-- Add profile header fields to profiles table
-- These columns support the Profile Editor feature (Phase 4.4)

-- Avatar URL already exists (avatar_url TEXT)
-- Display name already exists (display_name TEXT)

-- Add new columns for profile customization
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS title_style TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS title_size TEXT NOT NULL DEFAULT 'large',
  ADD COLUMN IF NOT EXISTS profile_layout TEXT NOT NULL DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS show_social_icons BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS social_icons JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add check constraints for enum-like columns
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_title_style_check
    CHECK (title_style IN ('text', 'logo')),
  ADD CONSTRAINT profiles_title_size_check
    CHECK (title_size IN ('small', 'large')),
  ADD CONSTRAINT profiles_layout_check
    CHECK (profile_layout IN ('classic', 'hero'));

-- Comment on columns for documentation
COMMENT ON COLUMN public.profiles.logo_url IS 'URL to uploaded logo image (when title_style is logo)';
COMMENT ON COLUMN public.profiles.title_style IS 'How to display title: text (display_name) or logo (logo_url)';
COMMENT ON COLUMN public.profiles.title_size IS 'Title text size when title_style is text: small or large';
COMMENT ON COLUMN public.profiles.profile_layout IS 'Header layout style: classic (small circle) or hero (banner)';
COMMENT ON COLUMN public.profiles.show_social_icons IS 'Whether to show social icons row in header';
COMMENT ON COLUMN public.profiles.social_icons IS 'Array of {id, platform, url, sortKey} objects';
