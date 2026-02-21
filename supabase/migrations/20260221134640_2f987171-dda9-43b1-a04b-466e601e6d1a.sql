
-- Update get_leaderboard to exclude admin accounts
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(display_name text, total_points integer, is_premium boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.display_name, p.total_points, p.is_premium
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.user_id AND ur.role = 'admin'
  )
  ORDER BY p.total_points DESC
  LIMIT 50;
$$;
