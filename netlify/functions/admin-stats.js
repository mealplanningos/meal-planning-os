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

    let totalRecipes = 0, totalFreezerItems = 0, totalGroceryItems = 0, totalAssignments = 0;
    let usersWithRecipes = 0, usersWithFreezer = 0, usersWithGroceries = 0, usersWithAssignments = 0;
    let usersOnboarded = 0;

    // Keep a lookup so we can build the activation funnel below.
    const userDataMap = {};
    for (const u of userData) {
      userDataMap[u.user_id] = u;
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
      if (a > 0) usersWithAssignments++;
      // Onboarded = the user actually completed the first-run guide.
      // (Previously we counted any non-empty onboarding object, which is
      // initialized to {guideSeen:false, firstRunComplete:false} on signup,
      // so it counted every user.)
      if (u.onboarding?.firstRunComplete === true) usersOnboarded++;
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
    //  3. Completed onboarding (firstRunComplete === true)
    //  4. Created at least one recipe
    //  5. Assigned at least one meal to a slot
    //  6. Generated a grocery list
    let funnelSignedUp = authUsers.length;
    let funnelLoggedIn = 0;
    let funnelOnboarded = 0;
    let funnelHasRecipe = 0;
    let funnelHasAssignment = 0;
    let funnelHasGrocery = 0;
    for (const u of authUsers) {
      const ud = userDataMap[u.id];
      const loggedIn = !!loginsByUser[u.id];
      if (loggedIn) funnelLoggedIn++;
      if (ud?.onboarding?.firstRunComplete === true) funnelOnboarded++;
      if (ud && countArrayLike(ud.recipes)     > 0) funnelHasRecipe++;
      if (ud && countArrayLike(ud.assignments) > 0) funnelHasAssignment++;
      if (ud && countArrayLike(ud.groceries)   > 0) funnelHasGrocery++;
    }
    const funnel = [
      { step: 'Signed up',        count: funnelSignedUp },
      { step: 'Logged in',        count: funnelLoggedIn },
      { step: 'Onboarded',        count: funnelOnboarded },
      { step: 'Created recipe',   count: funnelHasRecipe },
      { step: 'Assigned meal',    count: funnelHasAssignment },
      { step: 'Built groceries',  count: funnelHasGrocery },
    ];

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
        recipes:    countArrayLike(userDataMap[uid]?.recipes),
        assignments: countArrayLike(userDataMap[uid]?.assignments),
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
        const recipes   = countArrayLike(ud?.recipes);
        const assigns   = countArrayLike(ud?.assignments);
        return {
          email:       u.email,
          signedUpAt:  u.created_at,
          ageDays,
          lastLogin:   lastLogin ? lastLogin.toISOString() : null,
          daysSinceLogin: daysSince,
          loginDays:   (loginDaysByUser[u.id]?.size) || 0,
          totalLogins: loginsByUser[u.id] || 0,
          recipes,
          assignments: assigns,
          onboarded:   ud?.onboarding?.firstRunComplete === true,
          status:      statusFor(ageDays, daysSince, hasLogin),
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
