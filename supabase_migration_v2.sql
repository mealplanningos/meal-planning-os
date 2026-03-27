-- ============================================================
-- Meal Planning OS — Supabase Migration v2
-- Run this in Supabase → SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE)
-- ============================================================

-- ── 1. user_access table ─────────────────────────────────────
-- Source of truth for who has paid.
-- Webhook writes here by email. App reads here to gate access.
-- Simple and fast — no complex state machine needed.

CREATE TABLE IF NOT EXISTS user_access (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        UNIQUE NOT NULL,
  has_access BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_user_access_email ON user_access (lower(email));

-- Enable RLS
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- Authenticated users can only read their own row (matched by email)
DROP POLICY IF EXISTS "Users can read own access" ON user_access;
CREATE POLICY "Users can read own access" ON user_access
  FOR SELECT
  USING (lower(email) = lower(auth.email()));

-- No INSERT or UPDATE from frontend — webhook only (uses service role key)


-- ── 2. user_data table ───────────────────────────────────────
-- All app data per user, stored as JSON blobs.
-- Keyed by user_id (Supabase auth UUID) — stable across email changes.

CREATE TABLE IF NOT EXISTS user_data (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipes     JSONB       DEFAULT '[]'::jsonb,
  assignments JSONB       DEFAULT '{}'::jsonb,
  week_notes  JSONB       DEFAULT '{}'::jsonb,
  week_start  TEXT        DEFAULT '',
  freezer     JSONB       DEFAULT '[]'::jsonb,
  groceries   JSONB       DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data (user_id);

-- Enable RLS
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
DROP POLICY IF EXISTS "Users can read own data" ON user_data;
CREATE POLICY "Users can read own data" ON user_data
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own data
DROP POLICY IF EXISTS "Users can insert own data" ON user_data;
CREATE POLICY "Users can insert own data" ON user_data
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own data
DROP POLICY IF EXISTS "Users can update own data" ON user_data;
CREATE POLICY "Users can update own data" ON user_data
  FOR UPDATE USING (user_id = auth.uid());


-- ── 3. Grant yourself access for testing ─────────────────────
-- Replace with your real email if needed.
-- has_access defaults to TRUE so you can test immediately.

INSERT INTO user_access (email, has_access)
VALUES ('hellmanskitchen@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET has_access = true;


-- ── VERIFY: check the tables were created ────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_access', 'user_data')
ORDER BY table_name;
