const cheerio = require('cheerio');

// Realistic browser User-Agent — some recipe sites (AllRecipes, NYT Cooking,
// Serious Eats, Bon Appetit) return 403/429 on non-browser UAs.
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { url } = JSON.parse(event.body || '{}');
    if (!url) return { statusCode: 400, headers, body: JSON.stringify({ error: 'URL is required' }) };

    // Fetch the page HTML with a realistic browser UA + Accept headers.
    let res;
    try {
      res = await fetch(url, {
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
      });
    } catch (fetchErr) {
      if (fetchErr.name === 'TimeoutError' || /timeout/i.test(String(fetchErr))) {
        return { statusCode: 504, headers, body: JSON.stringify({ error: 'That site took too long to respond. Try a different URL.' }) };
      }
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Could not reach that site. Check the URL and try again.' }) };
    }

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
