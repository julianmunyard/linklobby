-- LinkLobby Database Schema
-- Run in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
--
-- Tables: profiles, pages, cards
-- Features: RLS policies, auto-creation triggers, username uniqueness
--
-- WARNING: This schema assumes a fresh Supabase project.
-- If tables already exist, you may need to drop them first.

-- ============================================
-- PROFILES TABLE
-- Extends auth.users with username and display info
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read profiles (for public pages), users can update own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Index for username lookups (public page routing)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ============================================
-- PAGES TABLE
-- One page per user, stores theme and layout settings
-- ============================================

CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL REFERENCES public.profiles(username) ON UPDATE CASCADE,
  theme_id TEXT NOT NULL DEFAULT 'sleek',
  background_type TEXT DEFAULT 'color',
  background_value TEXT DEFAULT '#0a0a0a',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_page_per_user UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read pages (for public viewing), users manage own
CREATE POLICY "Public pages are viewable by everyone"
  ON public.pages FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own page"
  ON public.pages FOR ALL
  USING (auth.uid() = user_id);

-- Index for username lookups (public page routing)
CREATE INDEX IF NOT EXISTS idx_pages_username ON public.pages(username);

-- ============================================
-- CARDS TABLE
-- Belongs to pages, stores card type, content, position
-- ============================================

CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL, -- 'hero', 'horizontal', 'square', 'video', 'gallery', 'dropdown', 'game', 'audio'
  title TEXT,
  description TEXT,
  url TEXT,
  content JSONB DEFAULT '{}', -- Flexible content storage per card type
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 1,
  height INTEGER DEFAULT 1,
  z_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0, -- Deprecated: use sort_key for ordering
  sort_key TEXT NOT NULL DEFAULT 'a0', -- Fractional-indexing key for efficient reordering (a0, a1, a0V, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read cards (for public pages), users manage own via page ownership
CREATE POLICY "Cards are viewable by everyone"
  ON public.cards FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own cards"
  ON public.cards FOR ALL
  USING (
    page_id IN (SELECT id FROM public.pages WHERE user_id = auth.uid())
  );

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cards_page_id ON public.cards(page_id);
CREATE INDEX IF NOT EXISTS idx_cards_sort_order ON public.cards(page_id, sort_order); -- Deprecated: use idx_cards_sort_key
CREATE INDEX IF NOT EXISTS idx_cards_sort_key ON public.cards(page_id, sort_key); -- Primary ordering index

-- ============================================
-- TRIGGERS: Auto-create profile and page on signup
-- ============================================

-- Trigger: Auto-create profile when user signs up
-- Reads username from user metadata passed during signUp()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Auto-create page when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.pages (user_id, username)
  VALUES (NEW.id, NEW.username);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function: Check username availability (for client-side UX)
CREATE OR REPLACE FUNCTION public.check_username_available(desired_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE username = LOWER(desired_username)
  );
END;
$$;

-- Function: Update username (handles cascading to pages)
CREATE OR REPLACE FUNCTION public.update_username(new_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check availability
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = LOWER(new_username) AND id != current_user_id) THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;

  -- Update username (ON UPDATE CASCADE handles pages table)
  UPDATE public.profiles
  SET username = LOWER(new_username), updated_at = NOW()
  WHERE id = current_user_id;

  RETURN TRUE;
END;
$$;

-- ============================================
-- VERIFICATION QUERIES (run after schema creation)
-- ============================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
-- SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname LIKE 'on_%';
