-- Fix handle_new_user() to auto-generate username for Google OAuth signups.
-- Google users don't have 'username' in raw_user_meta_data, so we derive one
-- from the email prefix (e.g. julian.munyard@gmail.com → julianmunyard).
-- If that username is taken, appends incrementing numbers (julianmunyard1, etc.).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  _username TEXT;
  _base TEXT;
  _attempt TEXT;
  _i INT := 0;
BEGIN
  _username := NEW.raw_user_meta_data->>'username';

  -- Google OAuth users don't have a username in metadata — generate one from email
  IF _username IS NULL OR _username = '' THEN
    _base := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9_-]', '', 'g'));
    IF LENGTH(_base) < 3 THEN
      _base := 'user';
    END IF;
    _attempt := _base;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = _attempt) LOOP
      _i := _i + 1;
      _attempt := _base || _i::TEXT;
    END LOOP;
    _username := _attempt;
  END IF;

  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, _username);
  RETURN NEW;
END;
$$;
