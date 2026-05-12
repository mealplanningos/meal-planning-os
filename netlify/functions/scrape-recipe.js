const cheerio = require('cheerio');
const dns     = require('dns').promises;

// Realistic browser User-Agent — some recipe sites (AllRecipes, NYT Cooking,
// Serious Eats, Bon Appetit) return 403/429 on non-browser UAs.
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// ── SSRF DEFENSE ──────────────────────────────────────────────────────────
// This endpoint takes a user-supplied URL and fetches it server-side.
// Without these guards it's an open proxy / internal-network probe.
// The defense has three layers:
//   1. CORS+Origin allowlist — only legit caller is the Recipes tab on the app
//   2. URL validation — https only, hostname must resolve to a public IPv4/v6
//   3. Manual redirect handling — re-validate the destination before each hop
//      (prevents an attacker-controlled 302 from bouncing into a private IP)

const ALLOWED_ORIGINS = new Set([
  'https://app.mealplanningos.com',
  'https://mealplanningos.com',
]);

function corsHeaders(origin) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

// IPv4 private/reserved ranges (RFC 1918, loopback, link-local, CGNAT, broadcast)
function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  if (a === 0)   return true;                    // 0.0.0.0/8
  if (a === 10)  return true;                    // 10.0.0.0/8
  if (a === 127) return true;                    // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true;       // 169.254.0.0/16 link-local (cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true;       // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a >= 224) return true;                     // multicast + reserved
  return false;
}

function isPrivateIPv6(ip) {
  const s = ip.toLowerCase();
  if (s === '::1' || s === '::') return true;
  if (s.startsWith('fe80:'))     return true;    // link-local
  if (s.startsWith('fc') || s.startsWith('fd')) return true; // unique-local fc00::/7
  // IPv4-mapped IPv6 (::ffff:1.2.3.4) — re-check the embedded v4 octets
  const v4Mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (v4Mapped) return isPrivateIPv4(v4Mapped[1]);
  return false;
}

// Validate a URL: must be https, hostname must resolve to public IP(s).
// Doing DNS resolution here defeats DNS-rebinding to internal hosts.
async function validateUrl(rawUrl) {
  let u;
  try { u = new URL(rawUrl); }
  catch { return { ok: false, status: 400, error: 'Invalid URL.' }; }

  if (u.protocol !== 'https:') {
    return { ok: false, status: 400, error: 'Only https:// URLs are supported. Try copying the recipe link from your browser\'s address bar.' };
  }
  if (u.username || u.password) {
    return { ok: false, status: 400, error: 'URLs with embedded credentials are not allowed.' };
  }
  if (!u.hostname) {
    return { ok: false, status: 400, error: 'URL is missing a hostname.' };
  }

  let addrs;
  try {
    addrs = await dns.lookup(u.hostname, { all: true });
  } catch (e) {
    return { ok: false, status: 422, error: 'That site couldn\'t be reached. Check the URL and try again.' };
  }
  for (const { address, family } of addrs) {
    if (family === 4 && isPrivateIPv4(address)) return { ok: false, status: 400, error: 'URL resolves to a private or reserved network address.' };
    if (family === 6 && isPrivateIPv6(address)) return { ok: false, status: 400, error: 'URL resolves to a private or reserved network address.' };
  }
  return { ok: true, url: u.href };
}

// Fetch with manual redirect handling so we re-validate at each hop.
// Returns { ok: true, response } or { ok: false, status, error }.
async function safeFetch(initialUrl) {
  let current = initialUrl;
  for (let hop = 0; hop < 5; hop++) {
    const v = await validateUrl(current);
    if (!v.ok) return v;

    let res;
    try {
      res = await fetch(v.url, {
        headers: {
          'User-Agent':      BROWSER_UA,
          'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'manual',
        signal:   AbortSignal.timeout(12000),
      });
    } catch (fetchErr) {
      if (fetchErr.name === 'TimeoutError' || /timeout/i.test(String(fetchErr))) {
        return { ok: false, status: 504, error: 'That site took too long to respond. Try a different URL.' };
      }
      return { ok: false, status: 502, error: 'Could not reach that site. Check the URL and try again.' };
    }

    // 3xx — re-validate the redirect target before following
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) return { ok: false, status: 502, error: 'That site redirected without a destination.' };
      try { current = new URL(loc, v.url).href; }
      catch { return { ok: false, status: 502, error: 'That site redirected to an invalid URL.' }; }
      continue;
    }

    return { ok: true, response: res };
  }
  return { ok: false, status: 508, error: 'That site redirected too many times.' };
}

exports.handler = async (event) => {
  const origin  = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  // Defense-in-depth: reject non-allowed origins server-side too
  if (!ALLOWED_ORIGINS.has(origin)) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, headers, body: JSON.stringify({ error: 'URL is required' }) };

    const fetched = await safeFetch(url);
    if (!fetched.ok) {
      return { statusCode: fetched.status, headers, body: JSON.stringify({ error: fetched.error }) };
    }
    const res = fetched.response;

    if (!res.ok) {
      // Distinguish blocked vs missing vs other
      if (res.status === 403 || res.status === 401) {
        return { statusCode: 422, headers, body: JSON.stringify({ error: 'That site blocked our request. Try a different recipe site.' }) };
      }
      if (res.status === 404) {
        return { statusCode: 422, headers, body: JSON.stringify({ error: 'Page not found. Check the URL and try again.' }) };
      }
      if (res.status === 429) {
        return { statusCode: 422, headers, body: JSON.stringify({ error: 'That site is rate-limiting us. Try again in a minute or use a different site.' }) };
      }
      return { statusCode: 422, headers, body: JSON.stringify({ error: 'Could not fetch that page (status ' + res.status + ')' }) };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // ── Strategy 1: JSON-LD Recipe structured data ──
    let recipe = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      if (recipe) return;
      try {
        let data = JSON.parse($(el).html());
        if (data['@graph']) data = data['@graph'];
        if (Array.isArray(data)) {
          recipe = data.find(d => d && (d['@type'] === 'Recipe' || (Array.isArray(d['@type']) && d['@type'].includes('Recipe'))));
        } else if (data['@type'] === 'Recipe' || (Array.isArray(data['@type']) && data['@type'].includes('Recipe'))) {
          recipe = data;
        }
      } catch (e) { /* skip malformed JSON-LD */ }
    });

    // ── Strategy 2: schema.org microdata fallback ──
    // Catches older recipe sites that use itemtype="http://schema.org/Recipe"
    if (!recipe) {
      try {
        const mdRoot = $('[itemtype*="schema.org/Recipe"]').first();
        if (mdRoot && mdRoot.length) {
          const getProp = (name) => {
            const el = mdRoot.find(`[itemprop="${name}"]`).first();
            if (!el || !el.length) return '';
            return (el.attr('content') || el.text() || '').trim();
          };
          const getAllProp = (name) => {
            const arr = [];
            mdRoot.find(`[itemprop="${name}"]`).each((_, el) => {
              const $el = $(el);
              const v = ($el.attr('content') || $el.text() || '').trim();
              if (v) arr.push(v);
            });
            return arr;
          };
          const name = getProp('name');
          const ingredients = getAllProp('recipeIngredient').length
            ? getAllProp('recipeIngredient')
            : getAllProp('ingredients');
          const steps = getAllProp('recipeInstructions');
          const yld = getProp('recipeYield');
          if (name || ingredients.length || steps.length) {
            recipe = {
              name,
              recipeIngredient: ingredients,
              recipeInstructions: steps,
              recipeYield: yld,
            };
          }
        }
      } catch (mdErr) {
        console.error('microdata parse error:', mdErr);
      }
    }

    if (!recipe) {
      return { statusCode: 422, headers, body: JSON.stringify({ error: 'No recipe found on that page. This import works best with dedicated recipe sites. Try a different URL or enter the recipe manually.' }) };
    }

    // Extract ingredients (array of strings)
    const ingredients = (recipe.recipeIngredient || []).map(i => {
      return typeof i === 'string' ? i.replace(/<[^>]*>/g, '').trim() : '';
    }).filter(Boolean);

    // Extract instructions
    let steps = [];
    const rawInstructions = recipe.recipeInstructions;
    if (typeof rawInstructions === 'string') {
      steps = rawInstructions.split(/\n/).map(s => s.replace(/<[^>]*>/g, '').trim()).filter(Boolean);
    } else if (Array.isArray(rawInstructions)) {
      rawInstructions.forEach(item => {
        if (typeof item === 'string') {
          steps.push(item.replace(/<[^>]*>/g, '').trim());
        } else if (item && item['@type'] === 'HowToStep') {
          steps.push((item.text || '').replace(/<[^>]*>/g, '').trim());
        } else if (item && item['@type'] === 'HowToSection') {
          (item.itemListElement || []).forEach(sub => {
            steps.push((sub.text || '').replace(/<[^>]*>/g, '').trim());
          });
        }
      });
    }

    // Extract servings (recipeYield can be string or array)
    let servings = 4;
    const yld = recipe.recipeYield;
    if (yld) {
      const raw = Array.isArray(yld) ? yld[0] : yld;
      const num = parseInt(String(raw).replace(/[^\d]/g, ''));
      if (num && num > 0 && num <= 50) servings = num;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        name: recipe.name || '',
        ingredients,
        steps: steps.filter(Boolean),
        servings,
      }),
    };
  } catch (err) {
    console.error('scrape-recipe error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Something went wrong. Try a different URL.' }) };
  }
};
