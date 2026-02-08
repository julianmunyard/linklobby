-- Migration: Fix card size default from 'medium' to 'big'
-- 'medium' was a legacy value that no longer exists in the UI (only 'big' and 'small')
-- Cards with 'medium' should display as full-width ('big')

-- Update existing 'medium' cards to 'big'
UPDATE public.cards SET size = 'big' WHERE size = 'medium';

-- Update existing 'large' cards to 'big'
UPDATE public.cards SET size = 'big' WHERE size = 'large';

-- Change the column default to 'big'
ALTER TABLE public.cards ALTER COLUMN size SET DEFAULT 'big';
