-- Confirm all existing users' emails before enabling email verification
-- This prevents existing users from being locked out when
-- "Require email confirmation" is enabled in Supabase Auth settings.
--
-- IMPORTANT: Run this BEFORE enabling email confirmation in Supabase Dashboard:
--   Authentication > Providers > Email > Enable email confirmations
--
-- After running this migration:
--   1. Go to Supabase Dashboard > Authentication > Providers > Email
--   2. Enable "Confirm email"
--   3. New sign-ups will require email verification; existing users are unaffected

UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Prevent unverified users from publishing their page.
-- This is a database-level safety net; primary enforcement is in application code
-- (see src/lib/supabase/publish-gate.ts and src/app/api/page/route.ts).
CREATE OR REPLACE FUNCTION check_publish_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_published = TRUE AND (OLD.is_published IS DISTINCT FROM TRUE OR OLD.is_published IS NULL) THEN
    IF NOT EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = NEW.user_id
        AND email_confirmed_at IS NOT NULL
    ) THEN
      RAISE EXCEPTION 'Email must be verified before publishing';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists (safe re-run)
DROP TRIGGER IF EXISTS enforce_publish_email_verified ON pages;

CREATE TRIGGER enforce_publish_email_verified
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION check_publish_email_verified();
