-- ============================================================
-- Meal Planning OS — Supabase Migration v3
-- Snapshot backup system: auto-saves last 3 versions of user data
-- before every update. Zero frontend code needed.
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE)
-- ============================================================

-- ── 1. Snapshot table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_data_snapshots (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot   JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_user_id ON user_data_snapshots (user_id, created_at DESC);

-- Enable RLS
ALTER TABLE user_data_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can only read their own snapshots (no insert/update from frontend)
DROP POLICY IF EXISTS "Users can read own snapshots" ON user_data_snapshots;
CREATE POLICY "Users can read own snapshots" ON user_data_snapshots
  FOR SELECT USING (user_id = auth.uid());

-- ── 2. Trigger function ──────────────────────────────────────
-- Fires BEFORE UPDATE on user_data. Saves the OLD row as a snapshot,
-- then prunes to keep only the 3 most recent per user.
CREATE OR REPLACE FUNCTION snapshot_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Save the current (about-to-be-overwritten) row as a snapshot
  INSERT INTO user_data_snapshots (user_id, snapshot)
  VALUES (
    OLD.user_id,
    jsonb_build_object(
      'recipes',    OLD.recipes,
      'assignments', OLD.assignments,
      'week_notes',  OLD.week_notes,
      'week_start',  OLD.week_start,
      'freezer',     OLD.freezer,
      'groceries',   OLD.groceries,
      'onboarding',  OLD.onboarding,
      'updated_at',  OLD.updated_at
    )
  );

  -- Prune: keep only the 3 most recent snapshots for this user
  DELETE FROM user_data_snapshots
  WHERE user_id = OLD.user_id
    AND id NOT IN (
      SELECT id FROM user_data_snapshots
      WHERE user_id = OLD.user_id
      ORDER BY created_at DESC
      LIMIT 3
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. Attach the trigger ────────────────────────────────────
DROP TRIGGER IF EXISTS trg_snapshot_user_data ON user_data;
CREATE TRIGGER trg_snapshot_user_data
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION snapshot_user_data();

-- ── VERIFY ───────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'user_data_snapshots';
