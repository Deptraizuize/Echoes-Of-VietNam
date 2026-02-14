
-- 1. Fix profiles RLS: users can only view their own profile (prevent data leak)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can view all profiles  
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix profiles UPDATE: restrict which columns users can modify (prevent premium self-grant)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own safe fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Create a view for quiz questions WITHOUT correct_answer to prevent cheating
CREATE OR REPLACE VIEW public.quiz_questions_safe
WITH (security_invoker = on) AS
  SELECT id, question, options, image_url, milestone_id, created_at
  FROM public.quiz_questions;

-- 4. Create a secure view for leaderboard (only display_name and total_points, no PII)
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = on) AS
  SELECT display_name, total_points, is_premium
  FROM public.profiles
  ORDER BY total_points DESC
  LIMIT 50;

-- 5. Add column restriction trigger to prevent users from modifying sensitive profile fields
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admin can change these fields
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.is_premium := OLD.is_premium;
    NEW.premium_expires_at := OLD.premium_expires_at;
    NEW.total_points := OLD.total_points;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_sensitive_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_fields();
