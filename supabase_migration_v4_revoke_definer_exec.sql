-- ============================================================
-- Meal Planning OS — Supabase Migration v4
-- Phase 1b of pre-pentest hardening (2026-05-11)
--
-- Revokes direct EXECUTE permission on 4 SECURITY DEFINER trigger
-- functions from PUBLIC / anon / authenticated. Triggers continue
-- to fire because trigger execution doesn't check the caller's
-- EXECUTE privilege — only direct RPC calls do. service_role keeps
-- its EXECUTE grant so any future admin tooling is unaffected.
--
-- Clears these Supabase advisor warnings:
--   - anon_security_definer_function_executable        (× 4)
--   - authenticated_security_definer_function_executable (× 4)
--
-- Each function and what it does:
--   handle_new_user              — AFTER INSERT trigger on auth.users.
--                                  Creates a public.profiles row.
--   snapshot_user_data           — BEFORE UPDATE trigger on user_data.
--                                  Saves the OLD row to user_data_snapshots
--                                  (3-most-recent retention). The data-loss
--                                  safety net.
--   sync_profile_access_on_claim — AFTER INSERT OR UPDATE trigger on
--                                  payment_entitlements. Flips
--                                  profiles.has_access=true when an
--                                  entitlement becomes active+claimed.
--   rls_auto_enable              — DDL event trigger. Auto-enables RLS on
--                                  any new public-schema table.
--
-- Safe to run multiple times — REVOKE is idempotent.
-- Reversible: GRANT EXECUTE ... TO anon, authenticated; to restore.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.handle_new_user()              FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.snapshot_user_data()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_profile_access_on_claim() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()              FROM PUBLIC, anon, authenticated;

-- ── VERIFY ─────────────────────────────────────────────────
-- Expected: each row's acl shows only postgres=X/postgres and service_role=X/postgres
SELECT p.proname AS function_name, array_to_string(p.proacl, ', ') AS acl
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('handle_new_user', 'snapshot_user_data', 'sync_profile_access_on_claim', 'rls_auto_enable')
ORDER BY p.proname;
