-- MFA backup codes table
-- Stores bcrypt-hashed backup codes for TOTP 2FA fallback.
-- Accessed via service role only (no public policies).

CREATE TABLE IF NOT EXISTS mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mfa_backup_codes_user_id_idx ON mfa_backup_codes(user_id);

ALTER TABLE mfa_backup_codes ENABLE ROW LEVEL SECURITY;
-- No public RLS policies — this table is accessed via service role key in API routes only.
-- Users cannot read/write backup codes directly.
