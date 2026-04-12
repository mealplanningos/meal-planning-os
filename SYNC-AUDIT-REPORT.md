# Meal Planning OS — Sync System Audit Report

**Date:** April 12, 2026
**Auditor:** Claude (via Cowork)
**Scope:** All data sync paths in `app.js` + Supabase `user_data` table
**Trigger:** User-reported data loss — custom recipe ("test recipe SAVE") and custom grocery items disappeared after deploy

---

## Executive Summary

The sync system has **5 distinct bugs** that can cause data loss, silent sync failures, or misleading status indicators. The most critical is a broken keepalive flush that silently fails every time, combined with a cross-device "last write wins" architecture that has no merge logic — meaning a stale device can overwrite a fresh device's data. The Postgres logs confirm **repeated `duplicate key` errors** happening right now in production.

---

## Table Structure Context

The `user_data` table has:
- `id` (uuid) — **primary key**, auto-generated via `gen_random_uuid()`
- `user_id` (uuid) — **separate unique constraint** (`user_data_user_id_key`), foreign key to `auth.users`
- All data columns (recipes, assignments, freezer, groceries, etc.)

The `buildSyncPayload()` function sends `user_id` but **never sends `id`**. This is important because the two write paths handle conflict resolution differently.

RLS is enabled. There are **duplicate RLS policies** (two sets of insert/select/update policies), which is harmless but sloppy — should be cleaned up.

---

## Bug #1: `_flushToCloud` Keepalive Flush Always Fails (CRITICAL)

### What it is
When the user closes the tab, navigates away, or the browser hides the page (phone screen lock, app switch), `_flushToCloud()` fires as a last-chance data save using the `fetch()` API with `keepalive: true`.

### The bug
The keepalive fetch POSTs to:
```
${SUPABASE_URL}/rest/v1/user_data
```

With header:
```
Prefer: resolution=merge-duplicates,return=minimal
```

**The URL is missing the `?on_conflict=user_id` query parameter.**

Without this parameter, PostgREST defaults to using the **primary key** (`id`) for conflict resolution. Since the payload doesn't include `id`, PostgreSQL auto-generates a new UUID. There's never a conflict on `id`, so PostgREST attempts a plain INSERT — which then fails because `user_id` already exists (unique constraint violation).

### Evidence
The Postgres logs show **15+ `duplicate key value violates unique constraint "user_data_user_id_key"` errors** in the last hour alone. These are almost certainly from `_flushToCloud` calls.

### Impact
Every `_flushToCloud` call silently fails. This means:
- Closing a tab after making changes → changes NOT saved to cloud
- Locking your phone screen after making changes → changes NOT saved to cloud
- Switching apps on mobile → changes NOT saved to cloud
- The function is fire-and-forget with no error handling, so the user gets no indication

### Fix
Add `?on_conflict=user_id` to the fetch URL:
```javascript
fetch(`${SUPABASE_URL}/rest/v1/user_data?on_conflict=user_id`, {
```

---

## Bug #2: Cross-Device "Last Write Wins" Can Overwrite Fresh Data (CRITICAL)

### What it is
`syncToSupabase()` calls `buildSyncPayload()` which sends the **entire state** — all recipes, all meal plans, all freezer items, all groceries. There is no field-level merge. Whichever device writes last overwrites everything.

### The scenario that causes data loss
1. Steven opens the app on **desktop** at 8:00 AM. Cloud loads with 6 recipes.
2. Steven opens the app on **phone** at 8:05 AM. Cloud loads with 6 recipes. Phone now has these in localStorage.
3. Steven adds "test recipe SAVE" on **desktop** at 9:00 AM. Sync succeeds → cloud now has 7 recipes. Indicator is green.
4. Steven picks up his **phone**. The PWA was backgrounded. `visibilitychange` fires.
5. Phone checks dirty flag — phone has a stale dirty flag from some earlier interaction (or even from the `save()` calls during `applyCloudData`).
6. Phone's `syncToSupabase()` fires → pushes phone's stale 6-recipe state to cloud with `updated_at: new Date()` (current time).
7. **Cloud now has 6 recipes again. The test recipe is gone.**
8. Desktop's next 30-second poll pulls cloud data → sees cloud `updated_at` is newer → calls `applyCloudData()` → overwrites desktop localStorage with the stale 6-recipe state.
9. **Test recipe is gone from both devices and from the cloud.**

### Why the race-condition guard doesn't help
`applyCloudData()` has a guard:
```javascript
if (localDirty && data.updated_at) {
  if (localTs > cloudTs) { /* skip overwrite, push local */ }
}
```
But this only protects the device that has the dirty flag. In step 8, the **desktop has NO dirty flag** (its earlier sync cleared it). So the cloud data is applied without resistance.

### Impact
Any stale device that wakes up and syncs can overwrite another device's changes. This is the most likely cause of Steven's data loss.

### Fix (Simple — no over-building)
Add a **generation counter** (integer version number) to each sync payload. Before writing to cloud, check if the cloud's generation is higher than what we last loaded. If so, pull first, then merge, then push.

Alternatively (even simpler): change `_pullFromCloud` to always run BEFORE any push on resume, and have it update the in-memory state before `syncToSupabase` builds its payload. Right now the resume handler pushes first, then pulls — this is backwards.

---

## Bug #3: `syncToSupabase` Upsert May Also Be Failing (HIGH)

### What it is
`syncToSupabase()` uses the Supabase JS client:
```javascript
await _sb.from('user_data').upsert(payload, { onConflict: 'user_id' });
```

### The concern
The Supabase JS client (loaded via CDN `@supabase/supabase-js@2`) should translate `onConflict: 'user_id'` into the `?on_conflict=user_id` query parameter. **However**, the Postgres logs show duplicate key errors that could also be coming from this path, not just from `_flushToCloud`.

Possible reasons the JS client upsert might fail:
- The `@supabase/supabase-js@2` CDN URL resolves to the latest v2.x, which may have changed behavior
- With RLS enabled and duplicate policies, PostgREST may handle the upsert differently
- The table having both a PK on `id` and a unique constraint on `user_id` may confuse conflict resolution

### Impact
If `syncToSupabase` itself is failing, then even the "normal" sync path (not just the keepalive flush) is broken. The 3-retry mechanism would exhaust, the indicator would go red, and data would be stranded in localStorage.

### Fix
Replace the upsert with an explicit check-then-update/insert pattern:
```javascript
const existing = await _sb.from('user_data').select('id').eq('user_id', userId).maybeSingle();
if (existing.data) {
  await _sb.from('user_data').update(payload).eq('user_id', userId);
} else {
  await _sb.from('user_data').insert(payload);
}
```
This completely avoids the upsert/conflict resolution issue.

---

## Bug #4: Green Indicator Can Lie After Rapid Saves (MEDIUM)

### What it is
The sync indicator has a 15-second failsafe:
```javascript
if (state === 'saving') {
  _savingFailsafe = setTimeout(() => {
    const dirty = localStorage.getItem('mpos_local_dirty_at');
    el.style.background = dirty ? colors.error : colors.synced;
  }, 15000);
}
```

### The scenario
1. User saves data → indicator goes orange ("saving")
2. `syncToSupabase` fires 400ms later, succeeds → dirty flag cleared, indicator goes green
3. User saves MORE data → dirty flag set again, `scheduleSyncToSupabase` fires → indicator goes orange
4. But the 400ms debounce timer is reset each time
5. Meanwhile the 15s failsafe from step 1 was cleared, a new one starts
6. If `syncToSupabase` for step 3 fails (duplicate key error) → indicator goes RED
7. BUT: if the user makes yet another save quickly, `scheduleSyncToSupabase` fires again → indicator back to ORANGE → timer resets
8. The user sees orange/green flicker but never sees the red error state stick

Additionally: after a successful sync clears the dirty flag, a subsequent failed sync shows RED, but if the user doesn't notice the brief red flash, they may believe data is safe because it was green a moment ago.

### Impact
The user can believe data is synced (green indicator) when it actually isn't. Steven reported "the circle was green" when he added his recipe, but the sync for that specific save may have failed.

### Fix
Track the last confirmed sync timestamp in a separate variable. Only show green when the last `save()` call's timestamp has been confirmed synced. Don't show green until the dirty flag is actually cleared.

---

## Bug #5: Resume Handler Pushes Before Pulling (MEDIUM)

### What it is
The `visibilitychange` handler on resume does:
```javascript
// 1. Push dirty data first
if (localDirty && !_syncInFlight) {
  await syncToSupabase();  // pushes stale state
}
// 2. Then pull
await _pullFromCloud();
```

### The problem
On resume, the device pushes its **potentially stale** state to the cloud BEFORE checking if the cloud has newer data. This is the enabling condition for Bug #2. If the phone wakes up with stale data and a dirty flag, it blindly pushes stale data to the cloud, overwriting whatever another device added.

### Fix
Reverse the order: pull from cloud first, merge/apply, THEN push if there are still local changes that aren't in the cloud. Or at minimum, do a lightweight timestamp check before pushing:
```javascript
const cloud = await loadFromSupabase(userId);
if (cloud && cloud.updated_at) {
  const cloudTs = new Date(cloud.updated_at).getTime();
  const dirtyTs = new Date(localDirty).getTime();
  if (cloudTs > dirtyTs) {
    // Cloud is newer — apply it, don't push stale data
    applyCloudData(cloud);
    renderAll();
    return;
  }
}
// Only push if local is genuinely newer
await syncToSupabase();
```

---

## Additional Finding: Duplicate RLS Policies (LOW)

The `user_data` table has two identical sets of RLS policies:
1. "Users can insert own data" / "Users can read own data" / "Users can update own data"
2. "user_data_insert" / "user_data_select" / "user_data_update"

Both check `user_id = auth.uid()`. This is harmless (policies are OR'd together) but should be cleaned up to avoid confusion.

---

## Proposed Fix Priority

| Priority | Bug | Risk Level | Effort | Impact |
|----------|-----|-----------|--------|--------|
| **P0** | #1 — _flushToCloud missing on_conflict | CRITICAL | 1 line | Every tab close / page hide loses data |
| **P0** | #2 — Cross-device stale overwrite | CRITICAL | ~20 lines | Stale device can destroy another device's data |
| **P0** | #3 — Upsert may be failing | HIGH | ~10 lines | Normal sync path may be broken |
| **P1** | #5 — Push-before-pull on resume | MEDIUM | ~15 lines | Enables Bug #2 |
| **P2** | #4 — Green indicator lies | MEDIUM | ~10 lines | User trusts indicator that may be wrong |

---

## Recommended Implementation Order

1. **Fix `_flushToCloud` URL** (Bug #1) — one-line fix, zero risk
2. **Replace upsert with select+update/insert** (Bug #3) — eliminates duplicate key errors entirely
3. **Reverse resume order: pull before push** (Bug #5) — prevents stale device from overwriting
4. **Add cloud timestamp check before push** (Bug #2) — prevents stale data from overwriting newer cloud data
5. **Fix indicator accuracy** (Bug #4) — ensures green means green
6. **Clean up duplicate RLS policies** — housekeeping

---

## What Likely Happened to Steven's Data

Most probable sequence:
1. Steven added "test recipe SAVE" and custom grocery items on his **desktop browser**. The sync indicator showed green.
2. The sync via `syncToSupabase()` may have succeeded at that point — or it may have failed due to the duplicate key issue (Bug #3), with the green indicator being from a previous successful sync (Bug #4).
3. Steven's **phone PWA** was open in the background with stale data (no test recipe, no custom groceries).
4. At some point, the phone woke up (or Steven opened it). The `visibilitychange` handler fired and pushed the phone's stale data to the cloud BEFORE pulling (Bug #5).
5. The cloud was overwritten with stale data (Bug #2). The test recipe and custom groceries were gone from the cloud.
6. The desktop pulled the cloud data on its next 30-second poll cycle and applied it, overwriting the local state.
7. Alternatively: the deploy triggered a page reload. On reload, the app loaded cloud data (which was already stale from step 4-5). The desktop's localStorage dirty flag may have been cleared by a previous sync, so `applyCloudData` accepted the stale cloud data without resistance.

The data is **not recoverable** — Supabase does not have point-in-time recovery on the free tier, and the stale data has already been written over the row.

---

## Files That Will Be Modified

- `app.js` — all fixes are client-side JavaScript changes
- No Netlify function changes
- One optional Supabase migration to clean up duplicate RLS policies
- No changes to `index.html`, `styles.css`, or any other file
