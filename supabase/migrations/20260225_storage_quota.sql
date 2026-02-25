-- Add storage usage tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0;

-- Storage quota constant: 500MB for free tier
-- This is enforced in application code, not in the database
COMMENT ON COLUMN profiles.storage_used_bytes IS 'Tracks total storage used across all buckets. 500MB free tier limit enforced in API routes.';
