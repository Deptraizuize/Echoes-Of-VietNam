
CREATE OR REPLACE FUNCTION public.submit_quiz(p_milestone_id TEXT, p_answers INTEGER[], p_question_ids TEXT[] DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_is_premium BOOLEAN;
  v_max_hearts INTEGER;
  v_hearts_remaining INTEGER;
  v_score INTEGER := 0;
  v_total INTEGER;
  v_points INTEGER := 0;
  v_hearts_lost INTEGER := 0;
  v_question RECORD;
  v_idx INTEGER := 0;
  v_final_hearts INTEGER;
  v_today_attempts INTEGER;
  v_attempt_id UUID;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM milestones WHERE id = p_milestone_id) THEN
    RAISE EXCEPTION 'Milestone not found: %', p_milestone_id;
  END IF;
  IF p_answers IS NULL OR array_length(p_answers, 1) IS NULL THEN
    RAISE EXCEPTION 'Answers array is required';
  END IF;

  SELECT COUNT(*) INTO v_today_attempts
  FROM quiz_attempts
  WHERE user_id = v_user_id
    AND milestone_id = p_milestone_id
    AND created_at::date = CURRENT_DATE;

  IF v_today_attempts >= 3 THEN
    RETURN jsonb_build_object('error', 'Bạn đã làm quiz này 3 lần hôm nay. Hãy thử lại vào ngày mai!', 'daily_limit_reached', true);
  END IF;

  SELECT p.is_premium INTO v_is_premium FROM profiles p WHERE p.user_id = v_user_id;
  v_max_hearts := CASE WHEN v_is_premium THEN 10 ELSE 5 END;

  SELECT h.hearts_remaining INTO v_hearts_remaining FROM user_hearts h WHERE h.user_id = v_user_id FOR UPDATE;
  IF (SELECT last_reset_at FROM user_hearts WHERE user_id = v_user_id) < CURRENT_DATE THEN
    UPDATE user_hearts SET hearts_remaining = v_max_hearts, last_reset_at = CURRENT_DATE WHERE user_id = v_user_id;
    v_hearts_remaining := v_max_hearts;
  END IF;
  IF v_hearts_remaining <= 0 THEN
    RETURN jsonb_build_object('error', 'Hết tim! Hãy chờ ngày mai để thử lại.', 'hearts_remaining', 0);
  END IF;

  -- If question IDs are provided, use them to match answers correctly
  IF p_question_ids IS NOT NULL AND array_length(p_question_ids, 1) > 0 THEN
    v_total := array_length(p_question_ids, 1);
    FOR v_idx IN 1..v_total LOOP
      SELECT q.correct_answer INTO v_question
      FROM quiz_questions q
      WHERE q.id = p_question_ids[v_idx]::uuid
        AND q.milestone_id = p_milestone_id;
      IF FOUND AND p_answers[v_idx] = v_question.correct_answer THEN
        v_score := v_score + 1;
      END IF;
    END LOOP;
  ELSE
    -- Fallback: old behavior (not recommended)
    v_total := 0;
    FOR v_question IN SELECT q.id, q.correct_answer FROM quiz_questions q WHERE q.milestone_id = p_milestone_id ORDER BY q.id LIMIT 10
    LOOP
      v_total := v_total + 1;
      IF v_idx < array_length(p_answers, 1) AND p_answers[v_idx + 1] = v_question.correct_answer THEN
        v_score := v_score + 1;
      END IF;
      v_idx := v_idx + 1;
    END LOOP;
  END IF;

  IF v_total = 0 THEN RAISE EXCEPTION 'No quiz questions for milestone: %', p_milestone_id; END IF;
  IF array_length(p_answers, 1) <> v_total THEN
    RAISE EXCEPTION 'Expected % answers, got %', v_total, array_length(p_answers, 1);
  END IF;

  IF v_score < 8 THEN v_hearts_lost := 1; END IF;

  -- Points = score directly (no multiplier)
  IF v_score > 5 THEN
    v_points := v_score;
  END IF;

  IF v_hearts_lost > 0 THEN
    UPDATE user_hearts SET hearts_remaining = GREATEST(0, hearts_remaining - v_hearts_lost) WHERE user_id = v_user_id;
  END IF;

  SELECT h.hearts_remaining INTO v_final_hearts FROM user_hearts h WHERE h.user_id = v_user_id;

  INSERT INTO quiz_attempts (user_id, milestone_id, quiz_score, points_earned, hearts_lost, double_points_used, answers)
  VALUES (v_user_id, p_milestone_id, v_score, v_points, v_hearts_lost, false, to_jsonb(p_answers))
  RETURNING id INTO v_attempt_id;

  INSERT INTO user_progress (user_id, milestone_id, is_completed, best_score, attempts_count, completed_at)
  VALUES (v_user_id, p_milestone_id, v_score >= 8, v_score, 1, CASE WHEN v_score >= 8 THEN now() ELSE NULL END)
  ON CONFLICT (user_id, milestone_id) DO UPDATE SET
    best_score = GREATEST(COALESCE(user_progress.best_score, 0), EXCLUDED.best_score),
    is_completed = user_progress.is_completed OR EXCLUDED.is_completed,
    attempts_count = user_progress.attempts_count + 1,
    completed_at = COALESCE(user_progress.completed_at, EXCLUDED.completed_at),
    updated_at = now();

  IF v_points > 0 THEN
    UPDATE profiles SET total_points = total_points + v_points, updated_at = now() WHERE user_id = v_user_id;
  END IF;

  IF v_score >= 8 THEN
    INSERT INTO badges (user_id, milestone_id, badge_name)
    VALUES (v_user_id, p_milestone_id, 'Hoàn thành: ' || p_milestone_id)
    ON CONFLICT (user_id, milestone_id) DO NOTHING;
  END IF;

  DECLARE
    v_double_remaining INTEGER := 0;
    v_can_double BOOLEAN := false;
  BEGIN
    IF v_is_premium AND v_score >= 8 THEN
      INSERT INTO user_daily_limits (user_id, date, double_points_used) VALUES (v_user_id, CURRENT_DATE, 0) ON CONFLICT (user_id, date) DO NOTHING;
      SELECT dl.double_points_used INTO v_double_remaining FROM user_daily_limits dl WHERE dl.user_id = v_user_id AND dl.date = CURRENT_DATE;
      IF v_double_remaining < 2 THEN
        v_can_double := true;
      END IF;
    END IF;

    RETURN jsonb_build_object(
      'score', v_score, 'total', v_total, 'points_earned', v_points,
      'hearts_lost', v_hearts_lost, 'hearts_remaining', v_final_hearts,
      'double_points_used', false, 'is_completed', v_score >= 8,
      'attempt_id', v_attempt_id,
      'can_double', v_can_double,
      'attempts_today', v_today_attempts + 1
    );
  END;
END;
$$;
