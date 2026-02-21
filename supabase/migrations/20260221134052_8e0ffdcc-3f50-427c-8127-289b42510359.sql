
-- Add required_badges column to rewards
-- Format: [{"badge_type": "milestone", "id": "hai-ba-trung"}, {"badge_type": "phase", "id": "tk1-6"}]
ALTER TABLE public.rewards ADD COLUMN required_badges jsonb DEFAULT '[]'::jsonb;

-- Create server-side redeem function with full validation
CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_reward RECORD;
  v_user_points INTEGER;
  v_req JSONB;
  v_badge_type TEXT;
  v_badge_id TEXT;
  v_has_badge BOOLEAN;
  v_missing_badges TEXT[] := '{}';
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Lock reward row
  SELECT * INTO v_reward FROM rewards WHERE id = p_reward_id AND is_active = true FOR UPDATE;
  IF v_reward IS NULL THEN
    RETURN jsonb_build_object('error', 'Phần thưởng không tồn tại hoặc đã ngừng.');
  END IF;

  -- Check stock
  IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
    RETURN jsonb_build_object('error', 'Phần thưởng đã hết.');
  END IF;

  -- Check points
  SELECT total_points INTO v_user_points FROM profiles WHERE user_id = v_user_id;
  IF v_user_points < v_reward.points_cost THEN
    RETURN jsonb_build_object('error', 'Không đủ điểm. Cần ' || v_reward.points_cost || ' điểm, bạn có ' || v_user_points || ' điểm.');
  END IF;

  -- Check required badges
  IF v_reward.required_badges IS NOT NULL AND jsonb_array_length(v_reward.required_badges) > 0 THEN
    FOR v_req IN SELECT * FROM jsonb_array_elements(v_reward.required_badges)
    LOOP
      v_badge_type := v_req->>'badge_type';
      v_badge_id := v_req->>'id';
      
      IF v_badge_type = 'milestone' THEN
        SELECT EXISTS(SELECT 1 FROM badges WHERE user_id = v_user_id AND badge_type = 'milestone' AND milestone_id = v_badge_id) INTO v_has_badge;
      ELSIF v_badge_type = 'phase' THEN
        SELECT EXISTS(SELECT 1 FROM badges WHERE user_id = v_user_id AND badge_type = 'phase' AND phase_id = v_badge_id) INTO v_has_badge;
      ELSIF v_badge_type = 'period' THEN
        SELECT EXISTS(SELECT 1 FROM badges WHERE user_id = v_user_id AND badge_type = 'period' AND period_id = v_badge_id) INTO v_has_badge;
      ELSE
        v_has_badge := false;
      END IF;

      IF NOT v_has_badge THEN
        v_missing_badges := array_append(v_missing_badges, v_badge_id);
      END IF;
    END LOOP;

    IF array_length(v_missing_badges, 1) > 0 THEN
      RETURN jsonb_build_object('error', 'Bạn chưa có đủ huy hiệu cần thiết.', 'missing_badges', to_jsonb(v_missing_badges));
    END IF;
  END IF;

  -- Deduct points
  BEGIN
    ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_sensitive_fields;
    UPDATE profiles SET total_points = total_points - v_reward.points_cost, updated_at = now() WHERE user_id = v_user_id;
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
  EXCEPTION WHEN OTHERS THEN
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
    RAISE;
  END;

  -- Decrement stock
  IF v_reward.stock IS NOT NULL THEN
    UPDATE rewards SET stock = stock - 1 WHERE id = p_reward_id;
  END IF;

  -- Create redemption
  INSERT INTO reward_redemptions (user_id, reward_id, points_spent) 
  VALUES (v_user_id, p_reward_id, v_reward.points_cost);

  RETURN jsonb_build_object(
    'success', true,
    'points_spent', v_reward.points_cost,
    'remaining_points', v_user_points - v_reward.points_cost
  );
END;
$$;

-- Enable realtime for reward_redemptions and rewards
ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_redemptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rewards;
