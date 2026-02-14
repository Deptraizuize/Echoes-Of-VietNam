
-- 1. Restrict quiz_questions SELECT to admin only (prevent cheating)
DROP POLICY IF EXISTS "Anyone can view questions" ON public.quiz_questions;
CREATE POLICY "Only admins view full questions"
  ON public.quiz_questions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. The quiz_questions_safe view uses security_invoker=on, so it inherits
-- the caller's permissions. Since we restricted quiz_questions to admin only,
-- we need to recreate it as security_definer function instead.
DROP VIEW IF EXISTS public.quiz_questions_safe;

CREATE OR REPLACE FUNCTION public.get_quiz_questions(p_milestone_id text)
RETURNS TABLE(id uuid, question text, options jsonb, image_url text, milestone_id text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.question, q.options, q.image_url, q.milestone_id
  FROM public.quiz_questions q
  WHERE q.milestone_id = p_milestone_id;
$$;
