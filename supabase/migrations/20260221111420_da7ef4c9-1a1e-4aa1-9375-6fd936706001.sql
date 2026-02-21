
ALTER TABLE public.milestone_details ADD COLUMN image_captions text[] DEFAULT NULL;
ALTER TABLE public.milestone_details ADD COLUMN source_references text DEFAULT NULL;
