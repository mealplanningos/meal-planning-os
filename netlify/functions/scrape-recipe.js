const cheerio = require('cheerio');

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

    // Fetch the page HTML
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MealPlanningOS/1.0)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { statusCode: 422, headers, body: JSON.stringify({ error: 'Could not fetch that page (status ' + res.status + ')' }) };

    const html = await res.text();
    const $ = cheerio.load(html);

    // Find JSON-LD Recipe structured data
    let recipe = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      if (recipe) return;
      try {
        let data = JSON.parse($(el).html());
        // Handle @graph wrapper
        if (data['@graph']) data = data['@graph'];
        // Handle arrays
        if (Array.isArray(data)) {
          recipe = data.find(d => d['@type'] === 'Recipe' || (Array.isArray(d['@type']) && d['@type'].includes('Recipe')));
        } else if (data['@type'] === 'Recipe' || (Array.isArray(data['@type']) && data['@type'].includes('Recipe'))) {
          recipe = data;
        }
      } catch (e) { /* skip malformed JSON-LD */ }
    });

    if (!recipe) {
      return { statusCode: 422, headers, body: JSON.stringify({ error: 'No recipe found on that page. Try a different recipe URL.' }) };
    }

    // Extract ingredients (array of strings)
    const ingredients = (recipe.recipeIngredient || []).map(i => {
      // Strip HTML if present
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
        } else if (item['@type'] === 'HowToStep') {
          steps.push((item.text || '').replace(/<[^>]*>/g, '').trim());
        } else if (item['@type'] === 'HowToSection') {
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
