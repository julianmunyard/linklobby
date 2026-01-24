-- Migration: Add sort_key column for fractional-indexing ordering
-- Run in Supabase SQL Editor

-- 1. Add sort_key column (nullable initially for migration)
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS sort_key TEXT;

-- 2. Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_cards_sort_key ON public.cards(page_id, sort_key);

-- 3. Populate existing cards with sort keys based on current sort_order
-- Uses simple incrementing keys: 'a0', 'a1', 'a2', etc.
-- This matches fractional-indexing's natural progression
UPDATE public.cards
SET sort_key = 'a' || sort_order::text
WHERE sort_key IS NULL;

-- 4. Add default for new cards (will be overwritten by application)
ALTER TABLE public.cards
ALTER COLUMN sort_key SET DEFAULT 'a0';

-- 5. Make sort_key NOT NULL after population
ALTER TABLE public.cards
ALTER COLUMN sort_key SET NOT NULL;

-- Verification query (run after migration):
-- SELECT id, title, sort_order, sort_key FROM public.cards ORDER BY sort_key;
