-- Account deletion support columns
-- IMPORTANT: Run this manually in Supabase SQL Editor
-- These columns enable GDPR-compliant account deletion with 30-day grace period

-- Add deletion tracking columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_for TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add comments for clarity
COMMENT ON COLUMN profiles.deleted_at IS 'Timestamp when user initiated account deletion';
COMMENT ON COLUMN profiles.deletion_scheduled_for IS 'When account will be permanently deleted (deleted_at + 30 days)';
COMMENT ON COLUMN profiles.is_active IS 'False during deletion grace period, prevents login';

-- Index for periodic cleanup jobs (finding accounts ready for permanent deletion)
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_scheduled
  ON profiles(deletion_scheduled_for)
  WHERE deletion_scheduled_for IS NOT NULL;
