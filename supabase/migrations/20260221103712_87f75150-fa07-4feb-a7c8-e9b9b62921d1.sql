
-- Add URL columns for heroes and landmarks (parallel arrays to hero_names/landmark_names)
ALTER TABLE public.milestone_details 
  ADD COLUMN hero_urls text[] DEFAULT NULL,
  ADD COLUMN landmark_urls text[] DEFAULT NULL;
