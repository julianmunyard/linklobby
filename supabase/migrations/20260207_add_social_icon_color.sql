-- Add social_icon_color column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_icon_color text DEFAULT NULL;
