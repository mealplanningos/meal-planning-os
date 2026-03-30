// netlify/functions/stripe-webhook.js
// Receives verified Stripe events and creates entitlement records.
// This is the ONLY place access is granted — never trust the frontend.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Service role key bypasses RLS — safe here because this is server-side only
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];

  // ── Verify the request came from Stripe ──────────────────────────────
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // ── Successful one-time payment ─────────────────────────────────────────────
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const email   = session.customer_details?.email?.toLowerCase().trim();

    if (!email) {
      console.error('No customer email in session:', session.id);
      return { statusCode: 400, body: 'Missing customer email' };
    }

    // Upsert is idempotent — safe if Stripe retries this event
    const { error } = await supabase
      .from('payment_entitlements')
      .upsert(
        {
          email,
          stripe_customer_id:       session.customer,
          stripe_session_id:        session.id,           // UNIQUE — conflict key
          stripe_payment_intent_id: session.payment_intent,
          stripe_price_id:          process.env.STRIPE_PRICE_ID,
          plan:                     'lifetime',
          product:                  'meal_planning_os',
          payment_status:           'paid',
          access_status:            'unclaimed',
          purchased_at:             new Date().toISOString(),
          updated_at:               new Date().toISOString(),
        },
        { onConflict: 'stripe_session_id' }
      );

    if (error) {
      console.error('Failed to create entitlement:', error.message);
      return { statusCode: 500, body: 'Database error' };
    }

    console.log(`Entitlement created — email: ${email}, session: ${session.id}`);

    // ── Beehiiv onboarding (secondary path — never blocks access) ─
    await enrollInBeehiiv(email, session.id);
  }

  // ── Refund: revoke access ─────────────────────────────────────────────────────
  if (stripeEvent.type === 'charge.refunded') {
    const charge = stripeEvent.data.object;

    const { error } = await supabase
      .from('payment_entitlements')
      .update({
        payment_status: 'refunded',
        access_status:  'revoked',
        updated_at:     new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', charge.payment_intent);

    if (error) {
      console.error('Failed to revoke on refund:', error.message);
    } else {
      console.log(`Access revoked for payment_intent: ${charge.payment_intent}`);
    }
  }

  // Always return 200 — prevents Stripe from retrying unnecessarily
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};

// ── Beehiiv enrollment ──────────────────────────────────────────────────────────────────────
// Secondary path only. Any failure here logs and exits silently —
// Supabase access is already granted before this runs.
async function enrollInBeehiiv(email, sessionId) {
  const PUB_ID  = process.env.BEEHIIV_PUB_ID;
  const AUTO_ID = process.env.BEEHIIV_AUTOMATION_ID;
  const API_KEY = process.env.BEEHIIV_API_KEY;

  if (!PUB_ID || !AUTO_ID || !API_KEY) {
    console.warn('Beehiiv env vars not set — skipping enrollment');
    return;
  }

  // Idempotency check — skip if already enrolled for this session
  const { data: row } = await supabase
    .from('payment_entitlements')
    .select('beehiiv_enrolled_at')
    .eq('stripe_session_id', sessionId)
    .single();

  if (row?.beehiiv_enrolled_at) {
    console.log(`Beehiiv already enrolled for session ${sessionId} — skipping`);
    return;
  }

  // ── Step A: Create or reactivate subscriber ───────────────────────────────────
  let stepAOk = false;
  try {
    const resA = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body:    JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email:  false,
          double_opt_in:       false,
        }),
      }
    );
    const bodyA = await resA.json();
    console.log(`Beehiiv Step A [${resA.status}] for ${email}:`, JSON.stringify(bodyA));
    if (resA.ok) {
      stepAOk = true;
    } else {
      console.error(`Beehiiv Step A failed — status ${resA.status}, aborting enrollment`);
    }
  } catch (err) {
    console.error('Beehiiv Step A exception:', err.message);
  }

  if (!stepAOk) return;

  // ── Step B: Enroll in automation journey ──────────────────────────────────────────────
  let stepBOk = false;
  try {
    const resB = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUB_ID}/automations/${AUTO_ID}/journeys`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body:    JSON.stringify({ email }),
      }
    );
    const bodyB = await resB.json();
    console.log(`Beehiiv Step B [${resB.status}] for ${email}:`, JSON.stringify(bodyB));
    if (resB.ok) {
      stepBOk = true;
    } else {
      console.error(`Beehiiv Step B failed — status ${resB.status}`);
    }
  } catch (err) {
    console.error('Beehiiv Step B exception:', err.message);
  }

  if (!stepBOk) return;

  // ── Both steps succeeded — mark enrolled ───────────────────────────────────────────────────────────────────────────────
  const { error: updateErr } = await supabase
    .from('payment_entitlements')
    .update({ beehiiv_enrolled_at: new Date().toISOString() })
    .eq('stripe_session_id', sessionId);

  if (updateErr) {
    console.error('Failed to write beehiiv_enrolled_at:', updateErr.message);
  } else {
    console.log(`Beehiiv enrollment complete for ${email}`);
  }
}
