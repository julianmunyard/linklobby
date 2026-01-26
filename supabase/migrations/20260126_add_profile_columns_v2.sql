-- Add additional profile columns (Phase 4.4 update)
-- Adds bio, show_title, show_logo fields
-- Removes title_style in favor of independent toggles

-- Add new columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS show_title BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_logo BOOLEAN NOT NULL DEFAULT false;

-- Drop the title_style constraint and column (no longer needed - title and logo are independent)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_title_style_check;

-- Note: We keep title_style column for backward compatibility but it's no longer used
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS title_style;

-- Comment on new columns
COMMENT ON COLUMN public.profiles.bio IS 'Short bio/description text shown below title';
COMMENT ON COLUMN public.profiles.show_title IS 'Whether to show display name as title';
COMMENT ON COLUMN public.profiles.show_logo IS 'Whether to show logo image';
