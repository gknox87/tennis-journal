-- Migration: Populate profiles.full_name from auth user_metadata on signup
-- When a new user registers with first_name and last_name in metadata,
-- this trigger ensures the profiles row gets full_name set automatically.

CREATE OR REPLACE FUNCTION public.populate_profile_name_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
BEGIN
  v_first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', '');
  v_last_name  := COALESCE(NEW.raw_user_meta_data ->> 'last_name', '');
  v_full_name  := TRIM(BOTH FROM (v_first_name || ' ' || v_last_name));

  IF v_full_name <> '' THEN
    INSERT INTO public.profiles (id, full_name, updated_at)
    VALUES (NEW.id, v_full_name, now())
    ON CONFLICT (id) DO UPDATE
      SET full_name  = EXCLUDED.full_name,
          updated_at = EXCLUDED.updated_at
      WHERE public.profiles.full_name IS NULL OR public.profiles.full_name = '';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_populate_profile_name
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.populate_profile_name_on_signup();
