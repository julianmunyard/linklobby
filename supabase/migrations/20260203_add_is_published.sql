-- Add is_published column to pages table
-- Default to false for existing pages (artists must explicitly publish)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false NOT NULL;

-- Add index for efficient filtering of published pages (used in sitemap, public queries)
CREATE INDEX IF NOT EXISTS idx_pages_is_published ON pages(is_published) WHERE is_published = true;
