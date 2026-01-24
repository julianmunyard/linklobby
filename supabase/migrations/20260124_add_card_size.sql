-- Migration: Add size column to cards table
-- Run in Supabase SQL Editor

-- Add size column with default 'medium'
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS size TEXT NOT NULL DEFAULT 'medium';

-- Verification query:
-- SELECT column_name, data_type, column_default FROM information_schema.columns
-- WHERE table_name = 'cards' AND column_name = 'size';
