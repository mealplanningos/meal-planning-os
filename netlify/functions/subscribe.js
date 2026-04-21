// Beehiiv subscribe proxy. Keeps the API key on the server; the planner POSTs
// { email, utm_source, utm_medium, utm_campaign, referring_site } to this fn.
//
// Two-step flow:
//   1. Create/reactivate the subscription on the publication
//   2. Enroll the subscriber in the 5-Day Welcome Sequence automation
//
// Env vars (already set in Netlify for stripe-webhook.js — reused here):
//   BEEHIIV_API_KEY       — workspace API key
//   BEEHIIV_PUB_ID        — publication ID (fallback below in case env is missing)
//   BEEHIIV_LEAD_MAGNET_AUTOMATION_ID  — 5-Day Welcome Sequence automation (fallback below)

const BEEHIIV_PUB_ID = process.env.BEEHIIV_PUB_ID || 'pub_4c7696b6-1020-4853-9bc1-8630d2d6ec88';
const BEEHIIV_LEAD_MAGNET_AUTOMATION_ID =
  process.env.BEEHIIV_LEAD_MAGNET_AUTOMATION_ID ||
  'aut_785ed81b-649e-4e71-a55d-5d6bcca35a30';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!apiKey) {
    console.error('BEEHIIV_API_KEY not set in Netlify env');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const email = (payload.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) };
  }

  const body = {
    email,
    reactivate_existing: true,
    send_welcome_email: true,
    utm_source: payload.utm_source || 'dinner_planner',
    utm_medium: payload.utm_medium || 'lead_magnet',
    utm_campaign: payload.utm_campaign || 'dinner_planner_v1',
    referring_site: payload.referring_site || 'mealplanningos.com/planner',
  };

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
      }
    );

    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch {}

    if (!res.ok) {
      console.error('Beehiiv API error', res.status, text);
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: data?.errors?.[0]?.message || 'Subscription failed' }),
      };
    }

    // Step 2: enroll in the 5-Day Welcome Sequence.
    // Non-fatal — if this fails the subscriber is still on the list, so we
    // return ok:true and just log the error for manual follow-up.
    if (BEEHIIV_LEAD_MAGNET_AUTOMATION_ID) {
      try {
        const journeyRes = await fetch(
          `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/automations/${BEEHIIV_LEAD_MAGNET_AUTOMATION_ID}/journeys`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
            signal: AbortSignal.timeout(12000),
          }
        );
        if (!journeyRes.ok) {
          const jtext = await journeyRes.text();
          console.error('Beehiiv automation enroll failed', journeyRes.status, jtext);
        }
      } catch (err) {
        console.error('Beehiiv automation enroll threw', err);
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('subscribe fn threw', err);
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Upstream error' }) };
  }
};
