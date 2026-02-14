
-- Drop the leaderboard view since it won't work with restricted profiles RLS
DROP VIEW IF EXISTS public.leaderboard;

-- Create a security definer function for leaderboard instead
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(display_name text, total_points integer, is_premium boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.display_name, p.total_points, p.is_premium
  FROM public.profiles p
  ORDER BY p.total_points DESC
  LIMIT 50;
$$;
