// src/types/fan-tools.ts
// Fan engagement types - email collection, newsletter integration, etc.

/**
 * A collected email from a fan via the email collection card
 */
export interface CollectedEmail {
  id: string
  page_id: string
  email: string
  name?: string | null
  collected_at: string // ISO timestamp
  source_card_id?: string | null // Which card collected this email
  synced_to_mailchimp: boolean
  mailchimp_sync_at?: string | null // ISO timestamp
}

/**
 * Content schema for the email collection card type
 */
export interface EmailCollectionCardContent {
  heading: string // Default: "Stay in the loop"
  subheading?: string
  buttonText: string // Default: "Subscribe"
  showNameField: boolean // Whether to show optional name field
  successMessage: string // Default: "Thanks for subscribing!"
  // Standard card properties
  textAlign?: 'left' | 'center' | 'right'
  textColor?: string
  fontFamily?: string
  transparentBackground?: boolean
}

/**
 * Default content values for new email collection cards
 */
export const DEFAULT_EMAIL_COLLECTION_CONTENT: EmailCollectionCardContent = {
  heading: 'Stay in the loop',
  buttonText: 'Subscribe',
  showNameField: false,
  successMessage: 'Thanks for subscribing!',
  textAlign: 'center',
}

/*
 * SQL Migration for collected_emails table
 * Run this manually in Supabase SQL Editor:
 *
 * CREATE TABLE collected_emails (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
 *   email VARCHAR(255) NOT NULL,
 *   name VARCHAR(255),
 *   collected_at TIMESTAMPTZ DEFAULT NOW(),
 *   source_card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
 *   synced_to_mailchimp BOOLEAN DEFAULT FALSE,
 *   mailchimp_sync_at TIMESTAMPTZ,
 *   UNIQUE(page_id, email)
 * );
 *
 * CREATE INDEX idx_collected_emails_page_id ON collected_emails(page_id);
 * ALTER TABLE collected_emails ENABLE ROW LEVEL SECURITY;
 *
 * -- Artists can view emails collected on their pages
 * CREATE POLICY "Users can view their page emails" ON collected_emails
 *   FOR SELECT USING (page_id IN (SELECT id FROM pages WHERE user_id = auth.uid()));
 *
 * -- Anyone can submit their email (public insert)
 * CREATE POLICY "Public can insert emails" ON collected_emails
 *   FOR INSERT WITH CHECK (true);
 */
