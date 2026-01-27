-- Add avatar feather column for edge softening effect
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_feather INTEGER NOT NULL DEFAULT 0;

-- Constraint: 0-100 range
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_feather_range CHECK (avatar_feather >= 0 AND avatar_feather <= 100);

COMMENT ON COLUMN public.profiles.avatar_feather IS 'Avatar edge feather amount (0-100)';
