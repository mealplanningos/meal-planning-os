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

// Users created on or before this cutoff are treated as beta (free),
// even if they have an "active" Stripe entitlement from a 100%-off
// discount code. Override with BETA_CUTOFF env var (ISO date string).
// Default: end of today (2026-04-06) so every current user is beta.
const BETA_CUTOFF = new Date(process.env.BETA_CUTOFF || '2026-04-06T23:59:59Z');

// Emails excluded from all stats (owner/admin accounts). They can still
// sign in and view the dashboard, they just don't pollute the metrics.
const EXCLUDED_EMAILS = new Set(
  (process.env.EXCLUDED_EMAILS || 'hellmanskitchen@gmail.com')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
);

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
    // Single round-trip: one Promise.all batches every data source we need.
    // auth.users          → who has an account (source of truth)
    // payment_entitlements→ actual Stripe purchases
    // user_data           → what people have built in the app (recipes, plans, etc.)
    // user_data_snapshots → data-loss-fix auto-backups (NOT a usage signal)
    // get_admin_login_log → per-login rows from auth.sessions (via SECURITY DEFINER RPC)
    const [
      authUsersRes,
      entitlementsRes,
      userDataRes,
      snapshotsRes,
      loginLogRes,
    ] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from('payment_entitlements').select('email,access_status,payment_status,plan,purchased_at'),
      admin.from('user_data').select('user_id,recipes,assignments,freezer,groceries,week_start,created_at,updated_at,onboarding'),
      admin.from('user_data_snapshots').select('user_id,created_at'),
      admin.rpc('get_admin_login_log', { days_back: 30 }),
    ]);

    if (authUsersRes.error)    return json(500, { error: authUsersRes.error.message });
    if (entitlementsRes.error) return json(500, { error: entitlementsRes.error.message });
    if (userDataRes.error)     return json(500, { error: userDataRes.error.message });
    if (snapshotsRes.error)    return json(500, { error: snapshotsRes.error.message });
    if (loginLogRes.error)     return json(500, { error: loginLogRes.error.message });

    // Raw pulls
    const rawAuthUsers    = authUsersRes.data?.users || [];
    const rawEntitlements = entitlementsRes.data     || [];
    const rawUserData     = userDataRes.data         || [];
    const rawSnapshots    = snapshotsRes.data        || [];
    const rawLoginLog     = loginLogRes.data         || [];

    // Exclude owner/admin accounts from stats entirely.
    const excludedUserIds = new Set(
      rawAuthUsers
        .filter(u => EXCLUDED_EMAILS.has((u.email || '').toLowerCase()))
        .map(u => u.id)
    );

    const authUsers    = rawAuthUsers.filter(u => !EXCLUDED_EMAILS.has((u.email || '').toLowerCase()));
    const entitlements = rawEntitlements.filter(e => !EXCLUDED_EMAILS.has((e.email || '').toLowerCase()));
    const userData     = rawUserData.filter(u => !excludedUserIds.has(u.user_id));
    const snapshots    = rawSnapshots.filter(s => !excludedUserIds.has(s.user_id));
    const loginLog     = rawLoginLog.filter(r => !excludedUserIds.has(r.user_id));

    const now     = new Date();
    const dayMs   = 24 * 60 * 60 * 1000;
    const startOf = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    const daysAgo = (n) => new Date(now.getTime() - n * dayMs);
    const iso     = (d) => startOf(d).toISOString().slice(0, 10);

    // ── Users ───────────────────────────────────────────────────────────
    const totalUsers = authUsers.length;

    // "Paid" = has an active Stripe entitlement AND signed up after the beta cutoff.
    // Anyone who signed up on or before BETA_CUTOFF is treated as a beta/free user,
    // even if they went through Stripe checkout with a 100%-off discount code.
    const paidEmails = new Set(
      entitlements
        .filter(e => e.access_status === 'active' || e.payment_status === 'paid')
        .map(e => (e.email || '').toLowerCase())
        .filter(Boolean)
    );
    const paidUsers = authUsers.filter(u =>
      new Date(u.created_at) > BETA_CUTOFF &&
      paidEmails.has((u.email || '').toLowerCase())
    ).length;
    const betaUsers = totalUsers - paidUsers;

    const newUsers7  = authUsers.filter(u => new Date(u.created_at) >= daysAgo(7)).length;
    const newUsers30 = authUsers.filter(u => new Date(u.created_at) >= daysAgo(30)).length;

    // ── Login-based activity (from auth.sessions via RPC) ───────────────
    // One row per login. Distinct days per user = "login days"; count = total logins.
    const loginsByUser     = {};  // user_id -> total login count
    const loginDaysByUser  = {};  // user_id -> Set of ISO date strings
    const lastLoginByUser  = {};  // user_id -> most recent login Date
    for (const row of loginLog) {
      const uid = row.user_id;
      const createdAt = new Date(row.created_at);
      loginsByUser[uid] = (loginsByUser[uid] || 0) + 1;
      loginDaysByUser[uid] = loginDaysByUser[uid] || new Set();
      loginDaysByUser[uid].add(iso(createdAt));
      if (!lastLoginByUser[uid] || createdAt > lastLoginByUser[uid]) {
        lastLoginByUser[uid] = createdAt;
      }
    }

    // Active = distinct users with at least one login in the window
    const activeUserIdsIn = (nDays) => {
      const cutoff = daysAgo(nDays);
      const s = new Set();
      for (const row of loginLog) {
        if (new Date(row.created_at) >= cutoff) s.add(row.user_id);
      }
      return s;
    };
    const loggedInToday  = activeUserIdsIn(1).size;
    const loggedIn7      = activeUserIdsIn(7).size;
    const loggedIn30     = activeUserIdsIn(30).size;
    const totalLogins30  = loginLog.length;

    // Signups per day (last 30 days)
    const signupsByDay = {};
    for (let i = 29; i >= 0; i--) signupsByDay[iso(daysAgo(i))] = 0;
    for (const u of authUsers) {
      const key = iso(new Date(u.created_at));
      if (key in signupsByDay) signupsByDay[key]++;
    }

    // Logins per day — one count per login row. Replaces the old
    // "active by day" metric which was based on user_data.updated_at.
    const loginsByDay = {};
    for (let i = 29; i >= 0; i--) loginsByDay[iso(daysAgo(i))] = 0;
    for (const row of loginLog) {
      const key = iso(new Date(row.created_at));
      if (key in loginsByDay) loginsByDay[key]++;
    }

    // ── Auto-backups (from user_data_snapshots) ─────────────────────────
    // NOT a usage signal — these are the data-loss-fix safety backups.
    const backupsByUser = {};
    for (const s of snapshots) {
      backupsByUser[s.user_id] = (backupsByUser[s.user_id] || 0) + 1;
    }

    // ── Feature usage (jsonb in user_data) ──────────────────────────────
    const countArrayLike = (v) => {
      if (!v) return 0;
      if (Array.isArray(v)) return v.length;
      if (typeof v === 'object') return Object.keys(v).length;
      return 0;
    };

    // New users are auto-seeded with 3 starter recipes (ids sr1/sr2/sr3),
    // 3 default staples (st1/st2/st3), and 3 default flex items (fl1/fl2/fl3).
    // None of these represent real user activity, so we exclude them from
    // every "did this user actually do something" metric.
    const SEED_RECIPE_ID = /^sr\d+$/;
    const SEED_STAPLE_ID = /^st\d+$/;
    const SEED_FLEX_ID   = /^fl\d+$/;

    const realRecipes = (recipesArr) => {
      if (!Array.isArray(recipesArr)) return 0;
      return recipesArr.filter(r => !SEED_RECIPE_ID.test(String(r?.id || ''))).length;
    };

    // groceries is an object, not an array:
    //   { staples, flexItems, checks, adhocItems, categoryItems }
    // Real user-added count = non-seed staples + non-seed flex + all ad-hoc
    // + all category items. `checks` is a map of checkbox state, not items.
    // Auto-generated items from assigned meals are NOT stored here — they're
    // computed on the fly — so this is the right signal for "intentional"
    // grocery list building.
    const realGroceryItems = (g) => {
      if (!g || typeof g !== 'object') return 0;
      const stp = Array.isArray(g.staples)       ? g.staples.filter(x => !SEED_STAPLE_ID.test(String(x?.id || ''))).length : 0;
      const flx = Array.isArray(g.flexItems)     ? g.flexItems.filter(x => !SEED_FLEX_ID.test(String(x?.id || ''))).length : 0;
      const ad  = Array.isArray(g.adhocItems)    ? g.adhocItems.length    : 0;
      const cat = Array.isArray(g.categoryItems) ? g.categoryItems.length : 0;
      return stp + flx + ad + cat;
    };

    // Meal plan is an object keyed by slot id. We only count slots that are
    // actually populated (truthy value), not keys left over from clears.
    const realAssignments = (a) => {
      if (!a || typeof a !== 'object') return 0;
      return Object.values(a).filter(v => {
        if (v == null || v === '') return false;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'object') return Object.keys(v).length > 0;
        return true;
      }).length;
    };

    // Onboarded = has completed the CURRENT onboarding walkthrough (V4).
    // Bumped whenever the onboarding experience materially changes so existing
    // users get re-prompted and the metric only reflects people who've seen
    // the latest guide. Keep in sync with ONBOARDING_VERSION in app.js.
    const CURRENT_ONBOARDING_VERSION = 4;
    const _isOnboardedStrict = (ud) =>
      ud?.onboarding?.firstRunComplete === true &&
      (ud?.onboarding?.version || 0) >= CURRENT_ONBOARDING_VERSION;
    // V4.5: Learn More completion (post-onboarding guided tour)
    const _isLearnMoreComplete = (ud) =>
      ud?.onboarding?.learnMoreComplete === true;

    let totalRecipes = 0, totalFreezerItems = 0, totalGroceryItems = 0, totalAssignments = 0;
    let usersWithRecipes = 0, usersWithFreezer = 0, usersWithGroceries = 0, usersWithAssignments = 0;
    let usersOnboarded = 0, usersLearnMoreComplete = 0;

    // Keep a lookup so we can build the activation funnel below.
    // Also precompute per-user "real" counts (seed data excluded).
    const userDataMap   = {};
    const realRecipesByUser    = {};
    const realGroceriesByUser  = {};
    const realAssignmentsByUser = {};
    for (const u of userData) {
      userDataMap[u.user_id] = u;
      const r = realRecipes(u.recipes);
      const f = countArrayLike(u.freezer);         // no seed data here
      const g = realGroceryItems(u.groceries);
      const a = realAssignments(u.assignments);
      realRecipesByUser[u.user_id]    = r;
      realGroceriesByUser[u.user_id]  = g;
      realAssignmentsByUser[u.user_id] = a;
      totalRecipes      += r;
      totalFreezerItems += f;
      totalGroceryItems += g;
      totalAssignments  += a;
      if (r > 0) usersWithRecipes++;
      if (f > 0) usersWithFreezer++;
      if (g > 0) usersWithGroceries++;
      if (a > 0) usersWithAssignments++;
      // Strict: only counts users who have finished the CURRENT walkthrough (V4).
      if (_isOnboardedStrict(u)) usersOnboarded++;
      if (_isLearnMoreComplete(u)) usersLearnMoreComplete++;
    }

    const avg = (num, den) => den ? +(num / den).toFixed(1) : 0;

    // ── Retention (login-based cohort proxy) ────────────────────────────
    // For users whose accounts are ≥ N days old, did they come BACK and
    // log in at least once more than N days after signup?
    // (Previously used user_data.updated_at; now uses real session data.)
    const retention = { d1: 0, d7: 0, d30: 0, eligible1: 0, eligible7: 0, eligible30: 0 };
    for (const u of authUsers) {
      const created = new Date(u.created_at);
      const lastLogin = lastLoginByUser[u.id] || null;
      const ageDays = (now - created) / dayMs;
      const returnedAfter = (n) => lastLogin && ((lastLogin - created) / dayMs >= n);
      if (ageDays >= 1)  { retention.eligible1++;  if (returnedAfter(1))  retention.d1++;  }
      if (ageDays >= 7)  { retention.eligible7++;  if (returnedAfter(7))  retention.d7++;  }
      if (ageDays >= 30) { retention.eligible30++; if (returnedAfter(30)) retention.d30++; }
    }
    const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;

    // ── Activation funnel ───────────────────────────────────────────────
    // Sequential steps, each a subset of the previous.
    //  1. Signed up
    //  2. Logged in at least once (post-signup session)
    //  3. Completed V4 Quick Start (firstRunComplete === true, version >= 4)
    //  4. Completed V4.5 Learn More (learnMoreComplete === true)
    //  5. Created at least one recipe
    //  6. Assigned at least one meal to a slot
    //  7. Generated a grocery list
    let funnelSignedUp = authUsers.length;
    let funnelLoggedIn = 0;
    let funnelOnboarded = 0;
    let funnelLearnMore = 0;
    let funnelHasRecipe = 0;
    let funnelHasAssignment = 0;
    let funnelHasGrocery = 0;
    for (const u of authUsers) {
      const ud = userDataMap[u.id];
      const loggedIn = !!loginsByUser[u.id];
      if (loggedIn) funnelLoggedIn++;
      if (_isOnboardedStrict(ud)) funnelOnboarded++;
      if (_isLearnMoreComplete(ud)) funnelLearnMore++;
      if ((realRecipesByUser[u.id]    || 0) > 0) funnelHasRecipe++;
      if ((realAssignmentsByUser[u.id] || 0) > 0) funnelHasAssignment++;
      if ((realGroceriesByUser[u.id]  || 0) > 0) funnelHasGrocery++;
    }
    // "Signed up" is implicit — every user on this dashboard has signed up,
    // so showing it as the top of the funnel just wastes a bar. We still
    // pass the total separately so % calculations use it as the denominator.
    const funnel = [
      { step: 'Logged in',            count: funnelLoggedIn },
      { step: 'V4 Quick Start',       count: funnelOnboarded },
      { step: 'V4.5 Learn More',      count: funnelLearnMore },
      { step: 'Added own recipe',     count: funnelHasRecipe },
      { step: 'Planned a meal',       count: funnelHasAssignment },
      { step: 'Added grocery items',  count: funnelHasGrocery },
    ];
    const funnelTotal = funnelSignedUp;

    // ── Drifting users (signed up ≥7d ago, no login in last 7d) ─────────
    const driftingUsers = authUsers
      .filter(u => {
        const ageDays = (now - new Date(u.created_at)) / dayMs;
        if (ageDays < 7) return false;
        const last = lastLoginByUser[u.id];
        if (!last) return true;  // never logged in at all (in 30d window)
        return (now - last) / dayMs > 7;
      })
      .map(u => ({
        email: u.email,
        signedUpAt: u.created_at,
        lastLogin:  lastLoginByUser[u.id] ? lastLoginByUser[u.id].toISOString() : null,
        daysSinceLogin: lastLoginByUser[u.id]
          ? Math.round((now - lastLoginByUser[u.id]) / dayMs)
          : null,
      }))
      .sort((a, b) => (b.daysSinceLogin || 999) - (a.daysSinceLogin || 999))
      .slice(0, 15);

    // ── Most loyal users (by login days, then total logins) ─────────────
    const emailById = Object.fromEntries(authUsers.map(u => [u.id, u.email]));
    const loyalUsers = Object.keys(loginsByUser)
      .map(uid => ({
        email:      emailById[uid] || '(unknown)',
        logins:     loginsByUser[uid] || 0,
        loginDays:  (loginDaysByUser[uid]?.size) || 0,
        recipes:    realRecipesByUser[uid]    || 0,
        assignments: realAssignmentsByUser[uid] || 0,
        lastLogin:  lastLoginByUser[uid] ? lastLoginByUser[uid].toISOString() : null,
      }))
      .sort((a, b) =>
        (b.loginDays - a.loginDays) ||
        (b.logins    - a.logins) ||
        (b.recipes   - a.recipes)
      )
      .slice(0, 10);

    // ── Recent logins (distinct users, most recent first) ───────────────
    const recentLogins = Object.entries(lastLoginByUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([uid, when]) => ({
        email: emailById[uid] || '(unknown)',
        at:    when.toISOString(),
      }));

    // ── User roster (one row per user, sorted by last activity) ─────────
    // This is the founder-CRM view: every user, what they've built,
    // when they last logged in, and a simple health status.
    const statusFor = (ageDays, daysSinceLogin, hasLogin) => {
      if (!hasLogin) return 'never';
      if (daysSinceLogin == null) return 'never';
      if (daysSinceLogin <= 7)  return 'active';
      if (daysSinceLogin <= 14) return 'slipping';
      return 'drifted';
    };
    const userRoster = authUsers
      .map(u => {
        const ud        = userDataMap[u.id];
        const lastLogin = lastLoginByUser[u.id] || null;
        const hasLogin  = !!lastLogin;
        const daysSince = lastLogin ? Math.round((now - lastLogin) / dayMs) : null;
        const ageDays   = Math.round((now - new Date(u.created_at)) / dayMs);
        return {
          email:       u.email,
          signedUpAt:  u.created_at,
          ageDays,
          lastLogin:   lastLogin ? lastLogin.toISOString() : null,
          daysSinceLogin: daysSince,
          loginDays:   (loginDaysByUser[u.id]?.size) || 0,
          totalLogins: loginsByUser[u.id] || 0,
          recipes:     realRecipesByUser[u.id]    || 0,
          assignments: realAssignmentsByUser[u.id] || 0,
          groceries:   realGroceriesByUser[u.id]  || 0,
          onboarded:      _isOnboardedStrict(ud),
          learnMoreDone:  _isLearnMoreComplete(ud),
          status:         statusFor(ageDays, daysSince, hasLogin),
        };
      })
      .sort((a, b) => {
        // Active users first, sorted by most recent login.
        const aTs = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const bTs = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        if (aTs !== bTs) return bTs - aTs;
        return new Date(b.signedUpAt) - new Date(a.signedUpAt);
      });

    return json(200, {
      generatedAt: now.toISOString(),
      summary: {
        totalUsers,
        betaUsers,
        paidUsers,
        newUsers7,
        newUsers30,
        loggedInToday,
        loggedIn7,
        loggedIn30,
        totalLogins30,
        totalBackups: snapshots.length,
      },
      series: {
        signupsByDay,
        loginsByDay,
      },
      features: {
        totalRecipes,
        totalFreezerItems,
        totalGroceryItems,
        totalAssignments,
        usersWithRecipes,
        usersWithFreezer,
        usersWithGroceries,
        usersWithAssignments,
        usersOnboarded,
        usersLearnMoreComplete,
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
      funnel,
      funnelTotal,
      userRoster,
      // Kept for anyone with old clients cached; primary UI uses userRoster.
      loyalUsers,
      driftingUsers,
      recentLogins,
      recentSignups: [...authUsers]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8)
        .map(u => ({ email: u.email, created_at: u.created_at })),
    });
  } catch (err) {
    console.error('admin-stats error:', err);
    return json(500, { error: err.message || 'Unknown error' });
  }
};
