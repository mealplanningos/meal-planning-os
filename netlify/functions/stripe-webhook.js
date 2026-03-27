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

  // ── Verify the request came from Stripe ──────────────────────
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

  // ── Successful one-time payment ───────────────────────────────
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
  }

  // ── Refund: revoke access ─────────────────────────────────────
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
