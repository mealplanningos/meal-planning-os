// netlify/functions/create-checkout-session.js
// Creates a Stripe Checkout session. No login required.
// Stripe collects the customer's email at checkout.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',                        // change to 'subscription' later
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      // Pass session_id back in URL so frontend can reference it
      success_url: `${process.env.SITE_URL}/?payment=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.SITE_URL}/`,
      // Stripe collects the email — no auth needed from our side
      billing_address_collection: 'auto',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
