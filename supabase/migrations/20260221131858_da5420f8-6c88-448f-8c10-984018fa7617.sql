
-- ============================================
-- FIX 1: Rebuild submit_quiz with EXCEPTION safety for trigger disable/enable
-- ============================================
CREATE OR REPLACE FUNCTION public.submit_quiz(p_milestone_id text, p_answers integer[], p_question_ids text[] DEFAULT NULL::text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_double_remaining INTEGER := 0;
  v_can_double BOOLEAN := false;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM milestones WHERE id = p_milestone_id) THEN
    RAISE EXCEPTION 'Milestone not found: %', p_milestone_id;
  END IF;
  IF p_answers IS NULL OR array_length(p_answers, 1) IS NULL THEN
    RAISE EXCEPTION 'Answers array is required';
  END IF;

  -- Check daily attempt limit
  SELECT COUNT(*) INTO v_today_attempts
  FROM quiz_attempts
  WHERE user_id = v_user_id
    AND milestone_id = p_milestone_id
    AND created_at::date = CURRENT_DATE;

  IF v_today_attempts >= 3 THEN
    RETURN jsonb_build_object('error', 'Bạn đã làm quiz này 3 lần hôm nay. Hãy thử lại vào ngày mai!', 'daily_limit_reached', true);
  END IF;

  -- Get premium status
  SELECT p.is_premium INTO v_is_premium FROM profiles p WHERE p.user_id = v_user_id;
  v_max_hearts := CASE WHEN v_is_premium THEN 10 ELSE 5 END;

  -- Ensure user_hearts row exists
  INSERT INTO user_hearts (user_id, hearts_remaining)
  VALUES (v_user_id, v_max_hearts)
  ON CONFLICT (user_id) DO NOTHING;

  -- Check and reset hearts if needed
  SELECT h.hearts_remaining INTO v_hearts_remaining FROM user_hearts h WHERE h.user_id = v_user_id FOR UPDATE;
  IF (SELECT last_reset_at FROM user_hearts WHERE user_id = v_user_id) < CURRENT_DATE THEN
    UPDATE user_hearts SET hearts_remaining = v_max_hearts, last_reset_at = CURRENT_DATE WHERE user_id = v_user_id;
    v_hearts_remaining := v_max_hearts;
  END IF;
  IF v_hearts_remaining <= 0 THEN
    RETURN jsonb_build_object('error', 'Hết tim! Hãy chờ ngày mai để thử lại.', 'hearts_remaining', 0);
  END IF;

  -- Grade quiz
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

  -- Calculate points and hearts
  IF v_score < 8 THEN v_hearts_lost := 1; END IF;
  IF v_score > 5 THEN v_points := v_score; END IF;

  IF v_hearts_lost > 0 THEN
    UPDATE user_hearts SET hearts_remaining = GREATEST(0, hearts_remaining - v_hearts_lost) WHERE user_id = v_user_id;
  END IF;

  SELECT h.hearts_remaining INTO v_final_hearts FROM user_hearts h WHERE h.user_id = v_user_id;

  -- Record attempt
  INSERT INTO quiz_attempts (user_id, milestone_id, quiz_score, points_earned, hearts_lost, double_points_used, answers)
  VALUES (v_user_id, p_milestone_id, v_score, v_points, v_hearts_lost, false, to_jsonb(p_answers))
  RETURNING id INTO v_attempt_id;

  -- Update progress
  INSERT INTO user_progress (user_id, milestone_id, is_completed, best_score, attempts_count, completed_at)
  VALUES (v_user_id, p_milestone_id, v_score >= 8, v_score, 1, CASE WHEN v_score >= 8 THEN now() ELSE NULL END)
  ON CONFLICT (user_id, milestone_id) DO UPDATE SET
    best_score = GREATEST(COALESCE(user_progress.best_score, 0), EXCLUDED.best_score),
    is_completed = user_progress.is_completed OR EXCLUDED.is_completed,
    attempts_count = user_progress.attempts_count + 1,
    completed_at = COALESCE(user_progress.completed_at, EXCLUDED.completed_at),
    updated_at = now();

  -- Update total_points with SAFE trigger handling
  IF v_points > 0 THEN
    BEGIN
      ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_sensitive_fields;
      UPDATE profiles SET total_points = total_points + v_points, updated_at = now() WHERE user_id = v_user_id;
      ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
    EXCEPTION WHEN OTHERS THEN
      -- Always re-enable trigger even on error
      ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
      RAISE;
    END;
  END IF;

  -- Award badge
  IF v_score >= 8 THEN
    INSERT INTO badges (user_id, milestone_id, badge_name)
    VALUES (v_user_id, p_milestone_id, 'Hoàn thành: ' || p_milestone_id)
    ON CONFLICT (user_id, milestone_id) DO NOTHING;
  END IF;

  -- Check double points eligibility
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
$function$;

-- ============================================
-- FIX 2: Rebuild apply_double_points with EXCEPTION safety
-- ============================================
CREATE OR REPLACE FUNCTION public.apply_double_points(p_attempt_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_attempt RECORD;
  v_double_used INTEGER;
  v_bonus INTEGER;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_attempt FROM quiz_attempts WHERE id = p_attempt_id AND user_id = v_user_id;
  IF v_attempt IS NULL THEN
    RETURN jsonb_build_object('error', 'Không tìm thấy lần làm quiz này');
  END IF;

  IF v_attempt.quiz_score < 8 THEN
    RETURN jsonb_build_object('error', 'Chỉ nhân đôi khi đạt từ 8 điểm trở lên');
  END IF;

  IF v_attempt.double_points_used THEN
    RETURN jsonb_build_object('error', 'Đã nhân đôi điểm cho lần này rồi');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = v_user_id AND is_premium = true) THEN
    RETURN jsonb_build_object('error', 'Chỉ tài khoản Premium mới được nhân đôi');
  END IF;

  INSERT INTO user_daily_limits (user_id, date, double_points_used) VALUES (v_user_id, CURRENT_DATE, 0) ON CONFLICT (user_id, date) DO NOTHING;
  SELECT dl.double_points_used INTO v_double_used FROM user_daily_limits dl WHERE dl.user_id = v_user_id AND dl.date = CURRENT_DATE FOR UPDATE;

  IF v_double_used >= 2 THEN
    RETURN jsonb_build_object('error', 'Bạn đã dùng hết 2 lượt nhân đôi hôm nay');
  END IF;

  v_bonus := v_attempt.points_earned;

  UPDATE quiz_attempts SET double_points_used = true, points_earned = points_earned + v_bonus WHERE id = p_attempt_id;
  
  -- SAFE trigger handling with exception handler
  BEGIN
    ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_sensitive_fields;
    UPDATE profiles SET total_points = total_points + v_bonus, updated_at = now() WHERE user_id = v_user_id;
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
  EXCEPTION WHEN OTHERS THEN
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
    RAISE;
  END;
  
  UPDATE user_daily_limits SET double_points_used = double_points_used + 1 WHERE user_id = v_user_id AND date = CURRENT_DATE;

  RETURN jsonb_build_object(
    'success', true,
    'bonus_points', v_bonus,
    'total_points_earned', v_attempt.points_earned + v_bonus,
    'doubles_remaining', 1 - (v_double_used)
  );
END;
$function$;

-- ============================================
-- FIX 3: Rebuild auto_expire_premium with EXCEPTION safety
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_expire_premium()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  BEGIN
    ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_sensitive_fields;
    
    UPDATE public.profiles
    SET is_premium = false, updated_at = now()
    WHERE is_premium = true
      AND premium_expires_at IS NOT NULL
      AND premium_expires_at < now();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
  EXCEPTION WHEN OTHERS THEN
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
    RAISE;
  END;
  
  RETURN v_count;
END;
$function$;

-- ============================================
-- FIX 4: Sync total_points from actual quiz_attempts data
-- ============================================
DO $$
BEGIN
  ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_sensitive_fields;
  
  UPDATE profiles p
  SET total_points = COALESCE(sub.real_points, 0),
      updated_at = now()
  FROM (
    SELECT user_id, SUM(points_earned) as real_points
    FROM quiz_attempts
    GROUP BY user_id
  ) sub
  WHERE p.user_id = sub.user_id
    AND p.total_points != COALESCE(sub.real_points, 0);
  
  ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
EXCEPTION WHEN OTHERS THEN
  ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
  RAISE;
END;
$$;

-- ============================================
-- FIX 5: Clean abnormal double_points data (score < 8 but double_points_used = true)
-- ============================================
UPDATE quiz_attempts
SET double_points_used = false
WHERE quiz_score < 8 AND double_points_used = true;

-- ============================================
-- FIX 6: Fix attempts_count in user_progress to match actual data
-- ============================================
UPDATE user_progress up
SET attempts_count = sub.actual_count,
    updated_at = now()
FROM (
  SELECT user_id, milestone_id, COUNT(*) as actual_count
  FROM quiz_attempts
  GROUP BY user_id, milestone_id
) sub
WHERE up.user_id = sub.user_id
  AND up.milestone_id = sub.milestone_id
  AND up.attempts_count != sub.actual_count;

-- ============================================
-- FIX 7: Add unique constraint on user_hearts.user_id if not exists
-- to support ON CONFLICT in submit_quiz
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_hearts_user_id_key'
  ) THEN
    ALTER TABLE public.user_hearts ADD CONSTRAINT user_hearts_user_id_key UNIQUE (user_id);
  END IF;
END;
$$;
