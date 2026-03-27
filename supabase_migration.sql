-- ============================================================
-- Meal Planning OS — Supabase Migration
-- Run this once in your Supabase SQL Editor
-- ============================================================

-- ── 1. payment_entitlements table ────────────────────────────
-- This is the source of truth for who has paid access.
-- Keyed by stripe_session_id for idempotent webhook retries.

CREATE TABLE IF NOT EXISTS payment_entitlements (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer info (from Stripe)
  email                    TEXT        NOT NULL,
  stripe_customer_id       TEXT,
  stripe_session_id        TEXT        UNIQUE NOT NULL,  -- idempotency key
  stripe_payment_intent_id TEXT,
  stripe_price_id          TEXT,

  -- Plan info (ready for subscriptions later)
  plan                     TEXT        NOT NULL DEFAULT 'lifetime',   -- 'lifetime', 'monthly', 'annual'
  product                  TEXT        NOT NULL DEFAULT 'meal_planning_os',

  -- Payment state
  payment_status           TEXT        NOT NULL DEFAULT 'pending',    -- 'pending', 'paid', 'refunded', 'disputed'

  -- Access state
  access_status            TEXT        NOT NULL DEFAULT 'unclaimed',  -- 'unclaimed', 'active', 'revoked'

  -- Timestamps
  purchased_at             TIMESTAMPTZ,
  granted_at               TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Claiming (linked after user creates account)
  claimed_by_user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at               TIMESTAMPTZ,

  -- Future subscription fields (no-op for one-time payments)
  stripe_subscription_id   TEXT,
  current_period_end       TIMESTAMPTZ,
  cancel_at_period_end     BOOLEAN     DEFAULT FALSE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_entitlements_email
  ON payment_entitlements (lower(email));

CREATE INDEX IF NOT EXISTS idx_entitlements_user_id
  ON payment_entitlements (claimed_by_user_id)
  WHERE claimed_by_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_entitlements_status
  ON payment_entitlements (payment_status, access_status);

-- ── 2. RLS for payment_entitlements ──────────────────────────
ALTER TABLE payment_entitlements ENABLE ROW LEVEL SECURITY;

-- Users can read entitlements that are theirs (claimed or matching email)
DROP POLICY IF EXISTS "Users can read own entitlements" ON payment_entitlements;
CREATE POLICY "Users can read own entitlements" ON payment_entitlements
  FOR SELECT USING (
    claimed_by_user_id = auth.uid()
    OR lower(email) = lower(auth.email())
  );

-- Users can claim an unclaimed paid entitlement that matches their email
DROP POLICY IF EXISTS "Users can claim own entitlements" ON payment_entitlements;
CREATE POLICY "Users can claim own entitlements" ON payment_entitlements
  FOR UPDATE
  USING (
    lower(email) = lower(auth.email())
    AND access_status = 'unclaimed'
    AND payment_status = 'paid'
  )
  WITH CHECK (
    claimed_by_user_id = auth.uid()
  );

-- ── 3. user_data RLS policies ─────────────────────────────────
-- Ensure users can only read/write their own data rows.
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON user_data;
CREATE POLICY "Users can read own data" ON user_data
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own data" ON user_data;
CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own data" ON user_data;
CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE USING (user_id = auth.uid());

-- ── 4. profiles — keep as metadata table, access via entitlements ──
-- profiles_insert, profiles_select, profiles_update already exist.
-- No changes needed here — has_access column is no longer used for gating.

-- ── 5. Optional: grant yourself access immediately for testing ──
-- Replace with your actual Supabase user ID from Auth > Users
-- INSERT INTO payment_entitlements (
--   email, stripe_session_id, plan, product,
--   payment_status, access_status, purchased_at
-- ) VALUES (
--   'hellmanskitchen@gmail.com',
--   'manual_test_001',
--   'lifetime', 'meal_planning_os',
--   'paid', 'unclaimed', NOW()
-- );
