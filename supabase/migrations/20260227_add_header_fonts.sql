DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'title_font') THEN
    ALTER TABLE profiles ADD COLUMN title_font text DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio_font') THEN
    ALTER TABLE profiles ADD COLUMN bio_font text DEFAULT NULL;
  END IF;
END $$;
