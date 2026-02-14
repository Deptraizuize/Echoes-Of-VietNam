
-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN username text;

-- Create unique index for username (case-insensitive)
CREATE UNIQUE INDEX idx_profiles_username_unique ON public.profiles (LOWER(username));

-- Create a function to look up email by username (for login)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT u.email
  FROM auth.users u
  JOIN public.profiles p ON p.user_id = u.id
  WHERE LOWER(p.username) = LOWER(p_username)
  LIMIT 1;
$$;

-- Update handle_new_user to also store username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'username'
  );
  INSERT INTO public.user_hearts (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Also protect username from being changed to someone else's in the trigger
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.is_premium := OLD.is_premium;
    NEW.premium_expires_at := OLD.premium_expires_at;
    NEW.total_points := OLD.total_points;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;
