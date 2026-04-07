// netlify/functions/admin-stats.js
// Returns aggregated usage stats for the Meal Planning OS admin dashboard.
// Gated by verifying the caller's Supabase JWT and checking their email
// against ADMIN_EMAILS (comma-separated) or a hardcoded fallback.
//
// Read-only: only SELECTs / list calls. Never writes to the database.

const { createClient } = require('@supabase/supabase-js');

// Service role bypasses RLS — safe here because this runs server-side only.
const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'hellmanskitchen@gmail.com')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  try {
    // ── Verify caller is a signed-in admin ──────────────────────────────
    const authHeader = event.headers.authorization || event.headers.Authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return json(401, { error: 'Missing bearer token' });

    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes?.user) return json(401, { error: 'Invalid token' });

    const email = (userRes.user.email || '').toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) {
      return json(403, { error: 'Not an admin' });
    }

    // ── Fetch data in parallel ──────────────────────────────────────────
    // auth.users is the source of truth for "who has an account".
    // payment_entitlements reflects actual Stripe purchases.
    // user_data holds everything people have actually built in the app.
    const [
      authUsersRes,
      entitlementsRes,
      userDataRes,
      snapshotsRes,
    ] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from('payment_entitlements').select('email,access_status,payment_status,plan,purchased_at'),
      admin.from('user_data').select('user_id,recipes,assignments,freezer,groceries,week_start,created_at,updated_at,onboarding'),
      admin.from('user_data_snapshots').select('user_id,created_at'),
    ]);

    if (authUsersRes.error)    return json(500, { error: authUsersRes.error.message });
    if (entitlementsRes.error) return json(500, { error: entitlementsRes.error.message });
    if (userDataRes.error)     return json(500, { error: userDataRes.error.message });
    if (snapshotsRes.error)    return json(500, { error: snapshotsRes.error.message });

    const authUsers    = authUsersRes.data?.users || [];
    const entitlements = entitlementsRes.data     || [];
    const userData     = userDataRes.data         || [];
    const snapshots    = snapshotsRes.data        || [];

    const now     = new Date();
    const dayMs   = 24 * 60 * 60 * 1000;
    const startOf = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    const daysAgo = (n) => new Date(now.getTime() - n * dayMs);
    const iso     = (d) => startOf(d).toISOString().slice(0, 10);

    // ── Users ───────────────────────────────────────────────────────────
    const totalUsers = authUsers.length;

    // "Paid" = has an active Stripe entitlement. During beta this is expected to be 0.
    const paidEmails = new Set(
      entitlements
        .filter(e => e.access_status === 'active' || e.payment_status === 'paid')
        .map(e => (e.email || '').toLowerCase())
        .filter(Boolean)
    );
    const paidUsers = authUsers.filter(u => paidEmails.has((u.email || '').toLowerCase())).length;
    const betaUsers = totalUsers - paidUsers; // everyone else is a beta/free user

    const newUsers7  = authUsers.filter(u => new Date(u.created_at) >= daysAgo(7)).length;
    const newUsers30 = authUsers.filter(u => new Date(u.created_at) >= daysAgo(30)).length;

    // Active = user_data.updated_at within window (proxy for activity,
    // since we do not currently record sessions or events).
    const active1  = userData.filter(u => u.updated_at && new Date(u.updated_at) >= daysAgo(1)).length;
    const active7  = userData.filter(u => u.updated_at && new Date(u.updated_at) >= daysAgo(7)).length;
    const active30 = userData.filter(u => u.updated_at && new Date(u.updated_at) >= daysAgo(30)).length;

    // Signups per day (last 30 days)
    const signupsByDay = {};
    for (let i = 29; i >= 0; i--) signupsByDay[iso(daysAgo(i))] = 0;
    for (const u of authUsers) {
      const key = iso(new Date(u.created_at));
      if (key in signupsByDay) signupsByDay[key]++;
    }

    // Active users per day (count of user_data rows updated on that day), last 30 days
    const activeByDay = {};
    for (let i = 29; i >= 0; i--) activeByDay[iso(daysAgo(i))] = 0;
    for (const u of userData) {
      if (!u.updated_at) continue;
      const key = iso(new Date(u.updated_at));
      if (key in activeByDay) activeByDay[key]++;
    }

    // ── Engagement proxies (no true session tracking yet) ───────────────
    //   - activeDays : distinct days a user saved a snapshot
    //   - lifespan   : days between created_at and last updated_at of user_data
    //   - snapshots  : total versions saved per user
    const snapsByUser = {};
    const daysByUser  = {};
    for (const s of snapshots) {
      snapsByUser[s.user_id] = (snapsByUser[s.user_id] || 0) + 1;
      const d = iso(new Date(s.created_at));
      daysByUser[s.user_id] = daysByUser[s.user_id] || new Set();
      daysByUser[s.user_id].add(d);
    }

    const lifespans = userData
      .filter(u => u.created_at && u.updated_at)
      .map(u => Math.max(0, (new Date(u.updated_at) - new Date(u.created_at)) / dayMs));
    const avgLifespanDays = lifespans.length
      ? lifespans.reduce((a, b) => a + b, 0) / lifespans.length
      : 0;

    const activeDaysPerUser = Object.values(daysByUser).map(s => s.size);
    const avgActiveDays = activeDaysPerUser.length
      ? activeDaysPerUser.reduce((a, b) => a + b, 0) / activeDaysPerUser.length
      : 0;

    // ── Feature usage (jsonb in user_data) ──────────────────────────────
    const countArrayLike = (v) => {
      if (!v) return 0;
      if (Array.isArray(v)) return v.length;
      if (typeof v === 'object') return Object.keys(v).length;
      return 0;
    };

    let totalRecipes = 0, totalFreezerItems = 0, totalGroceryItems = 0, totalAssignments = 0;
    let usersWithRecipes = 0, usersWithFreezer = 0, usersWithGroceries = 0, usersOnboarded = 0;

    for (const u of userData) {
      const r = countArrayLike(u.recipes);
      const f = countArrayLike(u.freezer);
      const g = countArrayLike(u.groceries);
      const a = countArrayLike(u.assignments);
      totalRecipes      += r;
      totalFreezerItems += f;
      totalGroceryItems += g;
      totalAssignments  += a;
      if (r > 0) usersWithRecipes++;
      if (f > 0) usersWithFreezer++;
      if (g > 0) usersWithGroceries++;
      if (u.onboarding && Object.keys(u.onboarding).length) usersOnboarded++;
    }

    const avg = (num, den) => den ? +(num / den).toFixed(1) : 0;

    // ── Retention (simple cohort proxy) ─────────────────────────────────
    // For users whose accounts are ≥ N days old, did they still have
    // user_data edits after day N? Gives a rough stickiness signal.
    const userDataByUser = Object.fromEntries(userData.map(u => [u.user_id, u]));
    const retention = { d1: 0, d7: 0, d30: 0, eligible1: 0, eligible7: 0, eligible30: 0 };
    for (const u of authUsers) {
      const created = new Date(u.created_at);
      const ud = userDataByUser[u.id];
      const updated = ud?.updated_at ? new Date(ud.updated_at) : null;
      const ageDays = (now - created) / dayMs;
      if (ageDays >= 1)  { retention.eligible1++;  if (updated && (updated - created) / dayMs >= 1)  retention.d1++;  }
      if (ageDays >= 7)  { retention.eligible7++;  if (updated && (updated - created) / dayMs >= 7)  retention.d7++;  }
      if (ageDays >= 30) { retention.eligible30++; if (updated && (updated - created) / dayMs >= 30) retention.d30++; }
    }
    const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;

    // ── Top users (by engagement proxy score) ───────────────────────────
    const emailById = Object.fromEntries(authUsers.map(u => [u.id, u.email]));
    const topUsers = userData
      .map(u => ({
        email: emailById[u.user_id] || '(unknown)',
        recipes:   countArrayLike(u.recipes),
        freezer:   countArrayLike(u.freezer),
        groceries: countArrayLike(u.groceries),
        snapshots: snapsByUser[u.user_id] || 0,
        activeDays: (daysByUser[u.user_id]?.size) || 0,
        lastSeen: u.updated_at,
      }))
      .sort((a, b) =>
        (b.snapshots + b.activeDays * 2 + b.recipes) -
        (a.snapshots + a.activeDays * 2 + a.recipes)
      )
      .slice(0, 10);

    return json(200, {
      generatedAt: now.toISOString(),
      note: 'Beta period: all users are free. "Paid" reflects Stripe entitlements only.',
      summary: {
        totalUsers,
        betaUsers,
        paidUsers,
        newUsers7,
        newUsers30,
        active1,
        active7,
        active30,
        avgLifespanDays: +avgLifespanDays.toFixed(1),
        avgActiveDays:   +avgActiveDays.toFixed(1),
        totalSnapshots:  snapshots.length,
      },
      series: {
        signupsByDay,
        activeByDay,
      },
      features: {
        totalRecipes,
        totalFreezerItems,
        totalGroceryItems,
        totalAssignments,
        usersWithRecipes,
        usersWithFreezer,
        usersWithGroceries,
        usersOnboarded,
        avgRecipesPerUser: avg(totalRecipes,      userData.length),
        avgFreezerPerUser: avg(totalFreezerItems, userData.length),
        avgGroceryPerUser: avg(totalGroceryItems, userData.length),
      },
      retention: {
        day1:  pct(retention.d1,  retention.eligible1),
        day7:  pct(retention.d7,  retention.eligible7),
        day30: pct(retention.d30, retention.eligible30),
        eligible: {
          d1: retention.eligible1,
          d7: retention.eligible7,
          d30: retention.eligible30,
        },
      },
      topUsers,
    });
  } catch (err) {
    console.error('admin-stats error:', err);
    return json(500, { error: err.message || 'Unknown error' });
  }
};
