// netlify/functions/stripe-webhook.js
// Receives Stripe webhook events and grants/revokes access.
// ONLY this function can grant access — never the frontend.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Service role key bypasses RLS so we can write to user_access freely
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  if (!sig) {
    return { statusCode: 400, body: 'Missing stripe-signature header' };
  }

  // Verify the request actually came from Stripe
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

  // ── Payment completed: grant access ──────────────────────────────────────
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // Stripe always captures email at checkout — this is our access key
    const email = session.customer_details?.email;

    if (!email) {
      console.error('No email found in checkout.session.completed');
      return { statusCode: 400, body: 'No customer email in session' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Granting access to: ${normalizedEmail}`);

    const { error } = await supabase
      .from('user_access')
      .upsert(
        {
          email:      normalizedEmail,
          has_access: true,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Failed to grant access in Supabase:', error.message);
      return { statusCode: 500, body: 'Database error granting access' };
    }

    console.log(`Access granted successfully for ${normalizedEmail}`);
  }

  // ── Refund issued: revoke access ──────────────────────────────────────────
  if (stripeEvent.type === 'charge.refunded') {
    const charge = stripeEvent.data.object;
    const email  = charge.billing_details?.email || charge.receipt_email;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`Revoking access for: ${normalizedEmail}`);

      const { error } = await supabase
        .from('user_access')
        .update({ has_access: false })
        .eq('email', normalizedEmail);

      if (error) {
        console.error('Failed to revoke access in Supabase:', error.message);
        return { statusCode: 500, body: 'Database error revoking access' };
      }

      console.log(`Access revoked for ${normalizedEmail}`);
    } else {
      console.warn('charge.refunded event had no email — cannot revoke access');
    }
  }

  // Always return 200 so Stripe doesn't retry unnecessarily
  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
