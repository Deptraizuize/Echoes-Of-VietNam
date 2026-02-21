-- =====================================================================
-- ECHOES OF VIETNAM — DATABASE SETUP SCRIPT (v2.0)
-- =====================================================================
-- Dự án: Web tương tác lịch sử Việt Nam
-- Stack: React + Supabase
-- Cập nhật: 2026-02-21
--
-- Script này tái tạo toàn bộ cấu trúc database từ đầu.
-- Chạy theo thứ tự: Enums → Tables → RLS → Functions → Triggers → Storage → Realtime
--
-- ⚠️  YÊU CẦU: Supabase project mới (hoặc đã xóa sạch schema public).
--     Nếu self-host, cần cấu hình thêm:
--       1. Google OAuth trong Authentication → Providers
--       2. Edge Functions: history-chat, delete-user, auto-expire-premium
--       3. Secrets: LOVABLE_API_KEY (cho AI chat), SUPABASE_SERVICE_ROLE_KEY
--       4. pg_cron + pg_net extensions (cho auto-expire cron job)
-- =====================================================================


-- =============================================================
-- 1. ENUMS — Định nghĩa kiểu dữ liệu tùy chỉnh
-- =============================================================

-- Vai trò người dùng: admin (toàn quyền), moderator (duyệt nội dung), user (mặc định)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- =============================================================
-- 2. TABLES — Bảng dữ liệu (17 bảng)
-- =============================================================

-- ----- 2.1 PROFILES — Hồ sơ người dùng -----
-- Lưu thông tin mở rộng, tách biệt khỏi auth.users của Supabase.
-- Mỗi user có đúng 1 profile (tạo tự động qua trigger handle_new_user).
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE,          -- Liên kết với auth.users(id)
  display_name    TEXT,                           -- Tên hiển thị
  username        TEXT UNIQUE,                    -- Tên đăng nhập duy nhất
  avatar_url      TEXT,                           -- URL ảnh đại diện (Supabase Storage)
  is_premium      BOOLEAN NOT NULL DEFAULT false, -- Tài khoản Premium?
  premium_expires_at TIMESTAMPTZ,                 -- Ngày hết hạn Premium
  total_points    INTEGER NOT NULL DEFAULT 0,     -- Tổng điểm tích lũy từ quiz
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.2 USER_ROLES — Phân quyền -----
-- Bảng riêng để tránh lỗ hổng privilege escalation.
CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,
  role       public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- ----- 2.3 USER_HEARTS — Hệ thống "tim" (mạng sống) -----
-- Mỗi ngày reset: Free = 5 tim, Premium = 10 tim.
CREATE TABLE public.user_hearts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE,
  hearts_remaining INTEGER NOT NULL DEFAULT 5,
  last_reset_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.4 MILESTONES — Cột mốc lịch sử -----
CREATE TABLE public.milestones (
  id           TEXT PRIMARY KEY,                   -- ID ngắn gọn: "hai-ba-trung"
  title        TEXT NOT NULL,
  period_id    TEXT NOT NULL,                       -- ID thời kỳ
  period_title TEXT NOT NULL,
  phase_id     TEXT NOT NULL,                       -- ID giai đoạn
  phase_title  TEXT NOT NULL,
  year         TEXT,                                -- Năm/khoảng thời gian
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.5 MILESTONE_DETAILS — Nội dung chi tiết cột mốc -----
CREATE TABLE public.milestone_details (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id      TEXT NOT NULL UNIQUE REFERENCES milestones(id),
  title             TEXT NOT NULL,
  summary           TEXT,
  events            TEXT,                             -- Diễn biến (Markdown)
  results           TEXT,
  significance      TEXT,
  hero_names        TEXT[],
  hero_urls         TEXT[],                           -- URL ảnh nhân vật
  landmark_names    TEXT[],
  landmark_urls     TEXT[],                           -- URL ảnh địa danh
  image_urls        TEXT[],
  image_captions    TEXT[],                           -- Chú thích ảnh
  source_references TEXT,                             -- Nguồn tham khảo
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.6 QUIZ_QUESTIONS — Ngân hàng câu hỏi -----
CREATE TABLE public.quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id   TEXT NOT NULL REFERENCES milestones(id),
  question       TEXT NOT NULL,
  options        JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer INTEGER NOT NULL,                    -- Index 0-based
  image_url      TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.7 QUIZ_ATTEMPTS — Lịch sử làm quiz -----
CREATE TABLE public.quiz_attempts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,
  milestone_id       TEXT NOT NULL REFERENCES milestones(id),
  quiz_score         INTEGER NOT NULL,
  points_earned      INTEGER NOT NULL DEFAULT 0,
  hearts_lost        INTEGER NOT NULL DEFAULT 0,
  double_points_used BOOLEAN NOT NULL DEFAULT false,
  answers            JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.8 USER_PROGRESS — Tiến trình theo cột mốc -----
CREATE TABLE public.user_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,
  milestone_id   TEXT NOT NULL REFERENCES milestones(id),
  is_completed   BOOLEAN NOT NULL DEFAULT false,
  best_score     INTEGER DEFAULT 0,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone_id)
);

-- ----- 2.9 BADGES — Huy hiệu (milestone / phase / period) -----
CREATE TABLE public.badges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  milestone_id TEXT NOT NULL REFERENCES milestones(id),
  badge_name   TEXT NOT NULL,
  badge_icon   TEXT,
  badge_type   TEXT NOT NULL DEFAULT 'milestone',    -- milestone | phase | period
  phase_id     TEXT,                                  -- ID giai đoạn (cho badge phase/milestone)
  period_id    TEXT,                                  -- ID thời kỳ (cho badge period)
  earned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type, milestone_id)          -- Mỗi loại badge mỗi milestone chỉ 1 lần
);

-- ----- 2.10 USER_DAILY_LIMITS — Giới hạn nhân đôi điểm -----
CREATE TABLE public.user_daily_limits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  date              DATE NOT NULL DEFAULT CURRENT_DATE,
  double_points_used INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ----- 2.11 PREMIUM_REQUESTS — Yêu cầu nâng cấp Premium -----
CREATE TABLE public.premium_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  plan_type       TEXT NOT NULL DEFAULT 'monthly',     -- monthly | yearly
  status          TEXT NOT NULL DEFAULT 'pending',     -- pending | approved | rejected
  note            TEXT,
  admin_note      TEXT,
  proof_image_url TEXT,                                -- Ảnh minh chứng chuyển khoản
  reviewed_by     UUID,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.12 FEEDBACK — Góp ý từ người dùng -----
CREATE TABLE public.feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',
  admin_reply TEXT,
  replied_by  UUID,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.13 REWARDS — Phần thưởng đổi bằng điểm -----
CREATE TABLE public.rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  points_cost     INTEGER NOT NULL,
  reward_type     TEXT NOT NULL DEFAULT 'voucher',
  stock           INTEGER,                               -- NULL = vô hạn
  is_active       BOOLEAN NOT NULL DEFAULT true,
  required_badges JSONB DEFAULT '[]'::jsonb,             -- Yêu cầu huy hiệu: [{"badge_type":"milestone","id":"xxx"}]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.14 REWARD_REDEMPTIONS — Lịch sử đổi thưởng -----
CREATE TABLE public.reward_redemptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  reward_id    UUID NOT NULL REFERENCES rewards(id),
  points_spent INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  admin_note   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.15 AD_BANNERS — Banner quảng cáo -----
CREATE TABLE public.ad_banners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  link_url      TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.16 PAYMENT_SETTINGS — Cài đặt thanh toán -----
CREATE TABLE public.payment_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key   TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  updated_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.17 REVENUE_RECORDS — Doanh thu -----
-- Ghi nhận doanh thu từ Premium (tự động) và kê khai thủ công (ads, collab, other).
CREATE TABLE public.revenue_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type  TEXT NOT NULL DEFAULT 'premium',         -- premium | ads | collab | other
  source_label TEXT NOT NULL,                           -- Mô tả: "Gói 1 Tháng", "Google Ads T1"
  amount       INTEGER NOT NULL DEFAULT 0,              -- Số tiền (VND)
  note         TEXT,
  reference_id UUID,                                    -- Liên kết premium_requests.id (nếu premium)
  recorded_by  UUID,                                    -- Admin đã ghi nhận
  record_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================================================
-- 3. ROW LEVEL SECURITY (RLS) — Bảo mật cấp hàng
-- =============================================================
-- Nguyên tắc: Bật RLS cho MỌI bảng → chặn truy cập mặc định
-- → thêm policy cho phép từng hành động cụ thể.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_hearts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;

-- ===== PROFILES =====
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own safe fields" ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== USER_ROLES =====
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== USER_HEARTS =====
CREATE POLICY "Users view own hearts" ON public.user_hearts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct update hearts" ON public.user_hearts FOR UPDATE USING (false);

-- ===== MILESTONES =====
CREATE POLICY "Anyone can view milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Only admins manage milestones" ON public.milestones FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== MILESTONE_DETAILS =====
CREATE POLICY "Anyone can view details" ON public.milestone_details FOR SELECT USING (true);
CREATE POLICY "Admins manage details" ON public.milestone_details FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== QUIZ_QUESTIONS (ẩn correct_answer khỏi client) =====
CREATE POLICY "Only admins view full questions" ON public.quiz_questions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage questions" ON public.quiz_questions FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== QUIZ_ATTEMPTS =====
CREATE POLICY "Users view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct insert attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (false);

-- ===== USER_PROGRESS =====
CREATE POLICY "Users view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct insert progress" ON public.user_progress FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update progress" ON public.user_progress FOR UPDATE USING (false);

-- ===== BADGES =====
CREATE POLICY "Users view own badges" ON public.badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct insert badges" ON public.badges FOR INSERT WITH CHECK (false);

-- ===== USER_DAILY_LIMITS =====
CREATE POLICY "Users view own limits" ON public.user_daily_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct write limits" ON public.user_daily_limits FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update limits" ON public.user_daily_limits FOR UPDATE USING (false);

-- ===== PREMIUM_REQUESTS =====
CREATE POLICY "Users can create requests" ON public.premium_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own requests" ON public.premium_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage requests" ON public.premium_requests FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== FEEDBACK =====
CREATE POLICY "Users can create feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage feedback" ON public.feedback FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== REWARDS =====
CREATE POLICY "Anyone can view active rewards" ON public.rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage rewards" ON public.rewards FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== REWARD_REDEMPTIONS =====
CREATE POLICY "Users can create redemptions" ON public.reward_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own redemptions" ON public.reward_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage redemptions" ON public.reward_redemptions FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== AD_BANNERS =====
CREATE POLICY "Anyone can view active banners" ON public.ad_banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage banners" ON public.ad_banners FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== PAYMENT_SETTINGS =====
CREATE POLICY "Anyone can view active payment settings" ON public.payment_settings FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage payment settings" ON public.payment_settings FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== REVENUE_RECORDS =====
CREATE POLICY "Admins manage revenue" ON public.revenue_records FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));


-- =============================================================
-- 4. FUNCTIONS — Hàm cơ sở dữ liệu
-- =============================================================

-- ----- 4.1 has_role — Kiểm tra vai trò (SECURITY DEFINER) -----
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ----- 4.2 handle_new_user — Tự động tạo profile khi đăng ký -----
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'username'
  );
  INSERT INTO public.user_hearts (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- ----- 4.3 protect_profile_fields — Chống gian lận -----
-- Ngăn user tự sửa: is_premium, premium_expires_at, total_points, user_id.
-- Cho phép user tự hạ premium nếu đã hết hạn (auto-expire client-side).
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    -- Cho phép hạ premium nếu đã hết hạn
    IF NEW.is_premium = false AND OLD.is_premium = true 
       AND OLD.premium_expires_at IS NOT NULL 
       AND OLD.premium_expires_at < now() THEN
      NEW.premium_expires_at := OLD.premium_expires_at;
    ELSE
      NEW.is_premium := OLD.is_premium;
      NEW.premium_expires_at := OLD.premium_expires_at;
    END IF;
    NEW.total_points := OLD.total_points;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- ----- 4.4 update_updated_at — Tự động cập nhật timestamp -----
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----- 4.5 validate_quiz_question — Kiểm tra câu hỏi hợp lệ -----
CREATE OR REPLACE FUNCTION public.validate_quiz_question()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF jsonb_array_length(NEW.options) < 2 THEN
    RAISE EXCEPTION 'Quiz question must have at least 2 options';
  END IF;
  IF NEW.correct_answer < 0 OR NEW.correct_answer >= jsonb_array_length(NEW.options) THEN
    RAISE EXCEPTION 'correct_answer must be valid index (0-%)', jsonb_array_length(NEW.options) - 1;
  END IF;
  RETURN NEW;
END;
$$;

-- ----- 4.6 get_quiz_questions — Lấy câu hỏi (ẨN đáp án đúng) -----
CREATE OR REPLACE FUNCTION public.get_quiz_questions(p_milestone_id TEXT)
RETURNS TABLE(id UUID, question TEXT, options JSONB, image_url TEXT, milestone_id TEXT)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT q.id, q.question, q.options, q.image_url, q.milestone_id
  FROM public.quiz_questions q
  WHERE q.milestone_id = p_milestone_id;
$$;

-- ----- 4.7 submit_quiz — Nộp bài quiz (TOÀN BỘ logic server-side) -----
-- Hỗ trợ 2 chế độ: với p_question_ids (chính xác) hoặc không (legacy).
-- Giới hạn 3 lần/ngày mỗi milestone. Score ≥ 8 = hoàn thành, cấp badge.
-- Badge cascade: milestone → phase → period.
CREATE OR REPLACE FUNCTION public.submit_quiz(
  p_milestone_id TEXT,
  p_answers INTEGER[],
  p_question_ids TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
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
  v_double_remaining INTEGER := 0;
  v_can_double BOOLEAN := false;
  v_phase_id TEXT;
  v_period_id TEXT;
  v_phase_title TEXT;
  v_period_title TEXT;
  v_phase_total INTEGER;
  v_phase_completed INTEGER;
  v_period_total INTEGER;
  v_period_completed INTEGER;
BEGIN
  -- === Validation ===
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM milestones WHERE id = p_milestone_id) THEN
    RAISE EXCEPTION 'Milestone not found: %', p_milestone_id;
  END IF;
  IF p_answers IS NULL OR array_length(p_answers, 1) IS NULL THEN
    RAISE EXCEPTION 'Answers array is required';
  END IF;

  -- === Giới hạn 3 lần/ngày ===
  SELECT COUNT(*) INTO v_today_attempts
  FROM quiz_attempts
  WHERE user_id = v_user_id AND milestone_id = p_milestone_id AND created_at::date = CURRENT_DATE;

  IF v_today_attempts >= 3 THEN
    RETURN jsonb_build_object('error', 'Bạn đã làm quiz này 3 lần hôm nay. Hãy thử lại vào ngày mai!', 'daily_limit_reached', true);
  END IF;

  -- === Kiểm tra tim ===
  SELECT p.is_premium INTO v_is_premium FROM profiles p WHERE p.user_id = v_user_id;
  v_max_hearts := CASE WHEN v_is_premium THEN 10 ELSE 5 END;

  INSERT INTO user_hearts (user_id, hearts_remaining) VALUES (v_user_id, v_max_hearts) ON CONFLICT (user_id) DO NOTHING;
  SELECT h.hearts_remaining INTO v_hearts_remaining FROM user_hearts h WHERE h.user_id = v_user_id FOR UPDATE;

  IF (SELECT last_reset_at FROM user_hearts WHERE user_id = v_user_id) < CURRENT_DATE THEN
    UPDATE user_hearts SET hearts_remaining = v_max_hearts, last_reset_at = CURRENT_DATE WHERE user_id = v_user_id;
    v_hearts_remaining := v_max_hearts;
  END IF;

  IF v_hearts_remaining <= 0 THEN
    RETURN jsonb_build_object('error', 'Hết tim! Hãy chờ ngày mai để thử lại.', 'hearts_remaining', 0);
  END IF;

  -- === Chấm điểm ===
  IF p_question_ids IS NOT NULL AND array_length(p_question_ids, 1) > 0 THEN
    -- Chế độ chính xác: theo thứ tự question_ids
    v_total := array_length(p_question_ids, 1);
    FOR v_idx IN 1..v_total LOOP
      SELECT q.correct_answer INTO v_question FROM quiz_questions q
        WHERE q.id = p_question_ids[v_idx]::uuid AND q.milestone_id = p_milestone_id;
      IF FOUND AND p_answers[v_idx] = v_question.correct_answer THEN v_score := v_score + 1; END IF;
    END LOOP;
  ELSE
    -- Legacy: lấy theo id
    v_total := 0;
    FOR v_question IN SELECT q.id, q.correct_answer FROM quiz_questions q
      WHERE q.milestone_id = p_milestone_id ORDER BY q.id LIMIT 10
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

  -- === Tính tim & điểm ===
  IF v_score < 8 THEN v_hearts_lost := 1; END IF;
  IF v_score > 5 THEN v_points := v_score; END IF;

  IF v_hearts_lost > 0 THEN
    UPDATE user_hearts SET hearts_remaining = GREATEST(0, hearts_remaining - v_hearts_lost) WHERE user_id = v_user_id;
  END IF;
  SELECT h.hearts_remaining INTO v_final_hearts FROM user_hearts h WHERE h.user_id = v_user_id;

  -- === Ghi quiz attempt ===
  INSERT INTO quiz_attempts (user_id, milestone_id, quiz_score, points_earned, hearts_lost, double_points_used, answers)
  VALUES (v_user_id, p_milestone_id, v_score, v_points, v_hearts_lost, false, to_jsonb(p_answers))
  RETURNING id INTO v_attempt_id;

  -- === Cập nhật tiến trình ===
  INSERT INTO user_progress (user_id, milestone_id, is_completed, best_score, attempts_count, completed_at)
  VALUES (v_user_id, p_milestone_id, v_score >= 8, v_score, 1, CASE WHEN v_score >= 8 THEN now() ELSE NULL END)
  ON CONFLICT (user_id, milestone_id) DO UPDATE SET
    best_score = GREATEST(COALESCE(user_progress.best_score, 0), EXCLUDED.best_score),
    is_completed = user_progress.is_completed OR EXCLUDED.is_completed,
    attempts_count = user_progress.attempts_count + 1,
    completed_at = COALESCE(user_progress.completed_at, EXCLUDED.completed_at),
    updated_at = now();

  -- === Cộng điểm (SAFE trigger handling) ===
  IF v_points > 0 THEN
    BEGIN
      ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_sensitive_fields;
      UPDATE profiles SET total_points = total_points + v_points, updated_at = now() WHERE user_id = v_user_id;
      ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
    EXCEPTION WHEN OTHERS THEN
      ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
      RAISE;
    END;
  END IF;

  -- === Cấp badge cascade: milestone → phase → period ===
  IF v_score >= 8 THEN
    SELECT m.phase_id, m.period_id, m.phase_title, m.period_title
    INTO v_phase_id, v_period_id, v_phase_title, v_period_title
    FROM milestones m WHERE m.id = p_milestone_id;

    -- Badge milestone
    INSERT INTO badges (user_id, milestone_id, badge_name, badge_type, phase_id, period_id)
    VALUES (v_user_id, p_milestone_id, (SELECT title FROM milestones WHERE id = p_milestone_id), 'milestone', v_phase_id, v_period_id)
    ON CONFLICT (user_id, badge_type, milestone_id) DO NOTHING;

    -- Kiểm tra hoàn thành phase
    SELECT COUNT(*) INTO v_phase_total FROM milestones WHERE phase_id = v_phase_id;
    SELECT COUNT(*) INTO v_phase_completed FROM badges WHERE user_id = v_user_id AND badge_type = 'milestone' AND phase_id = v_phase_id;
    IF v_phase_completed >= v_phase_total THEN
      INSERT INTO badges (user_id, milestone_id, badge_name, badge_type, phase_id, period_id)
      VALUES (v_user_id, v_phase_id, v_phase_title, 'phase', v_phase_id, v_period_id)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Kiểm tra hoàn thành period
    SELECT COUNT(*) INTO v_period_total FROM milestones WHERE period_id = v_period_id;
    SELECT COUNT(*) INTO v_period_completed FROM badges WHERE user_id = v_user_id AND badge_type = 'milestone' AND period_id = v_period_id;
    IF v_period_completed >= v_period_total THEN
      INSERT INTO badges (user_id, milestone_id, badge_name, badge_type, phase_id, period_id)
      VALUES (v_user_id, v_period_id, v_period_title, 'period', NULL, v_period_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- === Kiểm tra nhân đôi điểm ===
  IF v_is_premium AND v_score >= 8 THEN
    INSERT INTO user_daily_limits (user_id, date, double_points_used)
    VALUES (v_user_id, CURRENT_DATE, 0) ON CONFLICT (user_id, date) DO NOTHING;
    SELECT dl.double_points_used INTO v_double_remaining
    FROM user_daily_limits dl WHERE dl.user_id = v_user_id AND dl.date = CURRENT_DATE;
    IF v_double_remaining < 2 THEN v_can_double := true; END IF;
  END IF;

  RETURN jsonb_build_object(
    'score', v_score, 'total', v_total, 'points_earned', v_points,
    'hearts_lost', v_hearts_lost, 'hearts_remaining', v_final_hearts,
    'double_points_used', false, 'is_completed', v_score >= 8,
    'attempt_id', v_attempt_id, 'can_double', v_can_double,
    'attempts_today', v_today_attempts + 1
  );
END;
$$;

-- ----- 4.8 apply_double_points — Nhân đôi điểm (Premium) -----
-- Chỉ khi score ≥ 8, Premium active, tối đa 2 lần/ngày.
CREATE OR REPLACE FUNCTION public.apply_double_points(p_attempt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  INSERT INTO user_daily_limits (user_id, date, double_points_used)
  VALUES (v_user_id, CURRENT_DATE, 0) ON CONFLICT (user_id, date) DO NOTHING;
  SELECT dl.double_points_used INTO v_double_used
  FROM user_daily_limits dl WHERE dl.user_id = v_user_id AND dl.date = CURRENT_DATE FOR UPDATE;

  IF v_double_used >= 2 THEN
    RETURN jsonb_build_object('error', 'Bạn đã dùng hết 2 lượt nhân đôi hôm nay');
  END IF;

  v_bonus := v_attempt.points_earned;
  UPDATE quiz_attempts SET double_points_used = true, points_earned = points_earned + v_bonus WHERE id = p_attempt_id;

  BEGIN
    ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_sensitive_fields;
    UPDATE profiles SET total_points = total_points + v_bonus, updated_at = now() WHERE user_id = v_user_id;
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
  EXCEPTION WHEN OTHERS THEN
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
    RAISE;
  END;

  UPDATE user_daily_limits SET double_points_used = double_points_used + 1
  WHERE user_id = v_user_id AND date = CURRENT_DATE;

  RETURN jsonb_build_object(
    'success', true,
    'bonus_points', v_bonus,
    'total_points_earned', v_attempt.points_earned + v_bonus,
    'doubles_remaining', 1 - v_double_used
  );
END;
$$;

-- ----- 4.9 get_hearts — Lấy số tim (có auto-reset) -----
CREATE OR REPLACE FUNCTION public.get_hearts()
RETURNS TABLE(hearts_remaining INTEGER, is_premium BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_is_premium BOOLEAN;
  v_max_hearts INTEGER;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT p.is_premium INTO v_is_premium FROM profiles p WHERE p.user_id = v_user_id;
  v_max_hearts := CASE WHEN v_is_premium THEN 10 ELSE 5 END;
  UPDATE user_hearts h SET hearts_remaining = v_max_hearts, last_reset_at = CURRENT_DATE
    WHERE h.user_id = v_user_id AND h.last_reset_at < CURRENT_DATE;
  RETURN QUERY SELECT h.hearts_remaining, v_is_premium FROM user_hearts h WHERE h.user_id = v_user_id;
END;
$$;

-- ----- 4.10 get_leaderboard — Bảng xếp hạng (ẩn admin) -----
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(display_name TEXT, total_points INTEGER, is_premium BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER
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

-- ----- 4.11 check_username_exists -----
CREATE OR REPLACE FUNCTION public.check_username_exists(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(p_username)
  );
$$;

-- ----- 4.12 get_email_by_username — Đăng nhập bằng username -----
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT u.email
  FROM auth.users u
  JOIN public.profiles p ON p.user_id = u.id
  WHERE LOWER(p.username) = LOWER(p_username)
  LIMIT 1;
$$;

-- ----- 4.13 auto_expire_premium — Hạ cấp Premium hết hạn -----
-- Được gọi bởi cron job hàng ngày qua Edge Function.
CREATE OR REPLACE FUNCTION public.auto_expire_premium()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- ----- 4.14 redeem_reward — Đổi thưởng bằng điểm -----
-- Kiểm tra: đủ điểm, huy hiệu, stock → trừ điểm → tạo redemption.
CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
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

  SELECT * INTO v_reward FROM rewards WHERE id = p_reward_id AND is_active = true FOR UPDATE;
  IF v_reward IS NULL THEN
    RETURN jsonb_build_object('error', 'Phần thưởng không tồn tại hoặc đã ngừng.');
  END IF;

  IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
    RETURN jsonb_build_object('error', 'Phần thưởng đã hết.');
  END IF;

  SELECT total_points INTO v_user_points FROM profiles WHERE user_id = v_user_id;
  IF v_user_points < v_reward.points_cost THEN
    RETURN jsonb_build_object('error', 'Không đủ điểm. Cần ' || v_reward.points_cost || ' điểm, bạn có ' || v_user_points || ' điểm.');
  END IF;

  -- Kiểm tra huy hiệu yêu cầu
  IF v_reward.required_badges IS NOT NULL AND jsonb_array_length(v_reward.required_badges) > 0 THEN
    FOR v_req IN SELECT * FROM jsonb_array_elements(v_reward.required_badges) LOOP
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

  -- Trừ điểm
  BEGIN
    ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_sensitive_fields;
    UPDATE profiles SET total_points = total_points - v_reward.points_cost, updated_at = now() WHERE user_id = v_user_id;
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
  EXCEPTION WHEN OTHERS THEN
    ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
    RAISE;
  END;

  IF v_reward.stock IS NOT NULL THEN
    UPDATE rewards SET stock = stock - 1 WHERE id = p_reward_id;
  END IF;

  INSERT INTO reward_redemptions (user_id, reward_id, points_spent)
  VALUES (v_user_id, p_reward_id, v_reward.points_cost);

  RETURN jsonb_build_object(
    'success', true,
    'points_spent', v_reward.points_cost,
    'remaining_points', v_user_points - v_reward.points_cost
  );
END;
$$;

-- ----- 4.15 reset_yearly_badges — Reset huy hiệu đầu năm -----
CREATE OR REPLACE FUNCTION public.reset_yearly_badges()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_count INTEGER;
BEGIN
  DELETE FROM public.badges;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


-- =============================================================
-- 5. TRIGGERS
-- =============================================================

-- Trigger tạo profile khi user mới đăng ký
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger bảo vệ profile
CREATE TRIGGER protect_profile_sensitive_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- Trigger validate câu hỏi quiz
CREATE TRIGGER validate_quiz_question_trigger
  BEFORE INSERT OR UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.validate_quiz_question();

-- Triggers auto-update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_milestone_details_updated_at BEFORE UPDATE ON public.milestone_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_premium_requests_updated_at BEFORE UPDATE ON public.premium_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_ad_banners_updated_at BEFORE UPDATE ON public.ad_banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_payment_settings_updated_at BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_revenue_records_updated_at BEFORE UPDATE ON public.revenue_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- =============================================================
-- 6. STORAGE — Lưu trữ file
-- =============================================================

-- Bucket 'avatars' cho ảnh đại diện
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

-- Bucket 'payment-proofs' cho minh chứng thanh toán
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true)
  ON CONFLICT (id) DO NOTHING;

-- Policies cho avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policies cho payment-proofs
CREATE POLICY "Payment proofs are publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'payment-proofs');
CREATE POLICY "Users can upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);


-- =============================================================
-- 7. REALTIME — Đồng bộ thời gian thực
-- =============================================================

-- Bật realtime cho các bảng cần sync tức thì
ALTER PUBLICATION supabase_realtime ADD TABLE public.premium_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;


-- =============================================================
-- 8. CRON JOB — Tự động hạ cấp Premium hết hạn
-- =============================================================
-- ⚠️  Yêu cầu bật extensions: pg_cron, pg_net
-- Cron này gọi Edge Function 'auto-expire-premium' mỗi ngày lúc 00:00 UTC.
--
-- Chạy thủ công trong SQL Editor (Supabase Dashboard → SQL Editor):
--
-- SELECT cron.schedule(
--   'auto-expire-premium',
--   '0 0 * * *',
--   $$
--   SELECT net.http_post(
--     url := '<SUPABASE_URL>/functions/v1/auto-expire-premium',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer <SUPABASE_SERVICE_ROLE_KEY>',
--       'Content-Type', 'application/json'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );


-- =============================================================
-- 9. ADMIN SEEDING — Tạo admin đầu tiên
-- =============================================================
-- Sau khi đăng ký tài khoản admin đầu tiên qua UI,
-- chạy lệnh sau trong SQL Editor để gán quyền admin:
--
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<USER_ID_CỦA_ADMIN>', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;
--
-- Lấy USER_ID từ: Authentication → Users trong Supabase Dashboard.


-- =============================================================
-- 10. TÓM TẮT KIẾN TRÚC BẢO MẬT
-- =============================================================
--
-- ┌──────────────────────────────────────────────────────────────┐
-- │ CHỐNG GIAN LẬN (Anti-Cheat)                                 │
-- ├──────────────────────────────────────────────────────────────┤
-- │ 1. correct_answer ẩn khỏi client (get_quiz_questions RPC)   │
-- │ 2. Chấm điểm server-side (submit_quiz RPC)                  │
-- │ 3. Cấm client ghi quiz_attempts, user_progress, badges      │
-- │ 4. Cấm client sửa user_hearts, user_daily_limits            │
-- │ 5. protect_profile_fields chặn sửa points/premium           │
-- │ 6. BEGIN...EXCEPTION đảm bảo trigger luôn bật lại           │
-- ├──────────────────────────────────────────────────────────────┤
-- │ PHÂN QUYỀN                                                  │
-- ├──────────────────────────────────────────────────────────────┤
-- │ 1. Roles tách bảng riêng (user_roles) — chống escalation    │
-- │ 2. has_role() SECURITY DEFINER — tránh RLS đệ quy           │
-- │ 3. Admin check cả client-side (UX) + server-side (RLS)      │
-- │ 4. revenue_records chỉ admin truy cập (RLS)                 │
-- ├──────────────────────────────────────────────────────────────┤
-- │ QUYỀN RIÊNG TƯ                                              │
-- ├──────────────────────────────────────────────────────────────┤
-- │ 1. User chỉ xem data của mình (RLS: auth.uid() = user_id)   │
-- │ 2. Leaderboard qua RPC — không lộ user_id, ẩn admin         │
-- │ 3. get_email_by_username SECURITY DEFINER — login only       │
-- ├──────────────────────────────────────────────────────────────┤
-- │ EDGE FUNCTIONS                                               │
-- ├──────────────────────────────────────────────────────────────┤
-- │ 📁 history-chat/       — AI chatbot lịch sử (Premium only)  │
-- │ 📁 delete-user/        — Xóa tài khoản (admin/self)         │
-- │ 📁 auto-expire-premium/ — Cron hạ cấp Premium hết hạn       │
-- ├──────────────────────────────────────────────────────────────┤
-- │ SECRETS CẦN CẤU HÌNH                                        │
-- ├──────────────────────────────────────────────────────────────┤
-- │ SUPABASE_URL            — URL project                        │
-- │ SUPABASE_SERVICE_ROLE_KEY — Service role key (admin ops)     │
-- │ LOVABLE_API_KEY         — API key cho AI chat                │
-- │ SUPABASE_ANON_KEY       — Public anon key                    │
-- └──────────────────────────────────────────────────────────────┘


-- =============================================================
-- 11. GIÁ GÓI PREMIUM (Tham khảo — hardcoded trong frontend)
-- =============================================================
--
-- monthly: 19.000 VNĐ / tháng
-- yearly:  199.000 VNĐ / năm
--
-- Logic cộng dồn (cumulative): Nếu user đang Premium,
-- thời hạn mới = premium_expires_at + duration (không mất ngày cũ).
