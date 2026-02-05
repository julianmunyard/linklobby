-- ============================================================================
-- Analytics Tables Migration
-- ============================================================================
--
-- IMPORTANT: This migration must be run manually in Supabase SQL Editor.
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste this file
--
-- This creates analytics tracking tables for page views, card clicks, and
-- card interactions (game plays, gallery views).
--
-- NOTE: We use standard PostgreSQL tables instead of TimescaleDB hypertables.
-- TimescaleDB extension may not be enabled on all Supabase instances.
-- Standard tables with proper indexes are sufficient for expected traffic.
-- For scale, TimescaleDB can be enabled later with:
--   CREATE EXTENSION IF NOT EXISTS timescaledb;
--   SELECT create_hypertable('analytics_page_views', 'time');
-- ============================================================================

-- Page Views Table
-- Records each time a visitor loads a public page
CREATE TABLE IF NOT EXISTS analytics_page_views (
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  pathname TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT
);

-- Card Clicks Table
-- Records each time a visitor clicks a card
CREATE TABLE IF NOT EXISTS analytics_card_clicks (
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL
);

-- Card Interactions Table
-- Records specialized interactions: game plays and gallery image views
CREATE TABLE IF NOT EXISTS analytics_interactions (
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('game_play', 'gallery_view'))
);

-- ============================================================================
-- Indexes for Query Performance
-- ============================================================================

-- Page views: Query by page and time range
CREATE INDEX IF NOT EXISTS idx_page_views_page_time
  ON analytics_page_views (page_id, time DESC);

-- Card clicks: Query by card and time range
CREATE INDEX IF NOT EXISTS idx_card_clicks_card_time
  ON analytics_card_clicks (card_id, time DESC);

-- Interactions: Query by card, type, and time range
CREATE INDEX IF NOT EXISTS idx_interactions_card_type_time
  ON analytics_interactions (card_id, interaction_type, time DESC);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_card_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_interactions ENABLE ROW LEVEL SECURITY;

-- Allow INSERT for anyone (anon role for public tracking)
CREATE POLICY "Allow public insert on page views"
  ON analytics_page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert on card clicks"
  ON analytics_card_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public insert on interactions"
  ON analytics_interactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow SELECT only by page owner (authenticated users viewing their own analytics)
CREATE POLICY "Allow page owner to view page views"
  ON analytics_page_views FOR SELECT
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow page owner to view card clicks"
  ON analytics_card_clicks FOR SELECT
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow page owner to view interactions"
  ON analytics_interactions FOR SELECT
  TO authenticated
  USING (
    page_id IN (
      SELECT id FROM pages WHERE user_id = auth.uid()
    )
  );
