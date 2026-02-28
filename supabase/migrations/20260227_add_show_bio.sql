-- Add show_bio column to profiles table
-- Controls whether the bio text is displayed on the public page
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_bio boolean DEFAULT true;
