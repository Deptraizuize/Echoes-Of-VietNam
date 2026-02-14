-- =====================================================================
-- ECHOES OF VIETNAM — DATABASE SETUP SCRIPT
-- =====================================================================
-- Dự án: Web tương tác lịch sử Việt Nam
-- Stack: React + Supabase (Lovable Cloud)
-- Ngày tạo: 2026-02-14
--
-- Script này tái tạo toàn bộ cấu trúc database từ đầu.
-- Chạy theo thứ tự: Enums → Tables → RLS → Functions → Triggers
-- =====================================================================


-- =============================================================
-- 1. ENUMS — Định nghĩa kiểu dữ liệu tùy chỉnh
-- =============================================================

-- Vai trò người dùng: admin (toàn quyền), moderator (duyệt nội dung), user (mặc định)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');


-- =============================================================
-- 2. TABLES — Bảng dữ liệu
-- =============================================================

-- ----- 2.1 PROFILES — Hồ sơ người dùng -----
-- Lưu thông tin mở rộng, tách biệt khỏi auth.users của Supabase.
-- Mỗi user có đúng 1 profile (tạo tự động qua trigger handle_new_user).
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE,          -- Liên kết với auth.users(id)
  display_name    TEXT,                           -- Tên hiển thị
  username        TEXT UNIQUE,                    -- Tên đăng nhập duy nhất (chữ thường, 3-30 ký tự)
  avatar_url      TEXT,                           -- URL ảnh đại diện (Supabase Storage)
  is_premium      BOOLEAN NOT NULL DEFAULT false, -- Tài khoản Premium?
  premium_expires_at TIMESTAMPTZ,                 -- Ngày hết hạn Premium
  total_points    INTEGER NOT NULL DEFAULT 0,     -- Tổng điểm tích lũy từ quiz
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.2 USER_ROLES — Phân quyền -----
-- Bảng riêng để tránh lỗ hổng privilege escalation.
-- Một user có thể có nhiều vai trò (nhưng thường chỉ 1).
CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL,                      -- Liên kết với auth.users(id)
  role       public.app_role NOT NULL,            -- Vai trò: admin | moderator | user
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)                           -- Mỗi user chỉ có 1 role cùng loại
);

-- ----- 2.3 USER_HEARTS — Hệ thống "tim" (mạng sống) -----
-- Mỗi ngày reset: Free = 5 tim, Premium = 10 tim.
-- Sai quiz (score < 8/10) mất 1 tim. Hết tim = không chơi được.
CREATE TABLE public.user_hearts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL UNIQUE,
  hearts_remaining INTEGER NOT NULL DEFAULT 5,     -- Số tim còn lại
  last_reset_at    DATE NOT NULL DEFAULT CURRENT_DATE, -- Ngày reset gần nhất
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.4 MILESTONES — Cột mốc lịch sử -----
-- Mỗi cột mốc thuộc 1 thời kỳ (period) và 1 giai đoạn (phase).
-- Ví dụ: "Khởi nghĩa Hai Bà Trưng" thuộc thời kỳ "Bắc thuộc", giai đoạn "TK I-VI".
CREATE TABLE public.milestones (
  id           TEXT PRIMARY KEY,                   -- ID ngắn gọn: "hai-ba-trung"
  title        TEXT NOT NULL,                       -- Tên cột mốc
  period_id    TEXT NOT NULL,                       -- ID thời kỳ: "bac-thuoc"
  period_title TEXT NOT NULL,                       -- Tên thời kỳ
  phase_id     TEXT NOT NULL,                       -- ID giai đoạn: "tk1-6"
  phase_title  TEXT NOT NULL,                       -- Tên giai đoạn
  sort_order   INTEGER NOT NULL DEFAULT 0,          -- Thứ tự hiển thị
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.5 MILESTONE_DETAILS — Nội dung chi tiết cột mốc -----
-- Bài viết dạng Markdown cho mỗi cột mốc (1:1 với milestones).
CREATE TABLE public.milestone_details (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id   TEXT NOT NULL UNIQUE REFERENCES milestones(id),
  title          TEXT NOT NULL,
  summary        TEXT,                             -- Tóm tắt ngắn
  events         TEXT,                             -- Diễn biến (Markdown)
  results        TEXT,                             -- Kết quả
  significance   TEXT,                             -- Ý nghĩa lịch sử
  hero_names     TEXT[],                           -- Danh sách nhân vật
  landmark_names TEXT[],                           -- Danh sách địa danh
  image_urls     TEXT[],                           -- Hình ảnh minh họa
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.6 QUIZ_QUESTIONS — Ngân hàng câu hỏi -----
-- Mỗi câu hỏi thuộc 1 cột mốc. Câu hỏi trắc nghiệm 4 đáp án.
-- ⚠️ Cột correct_answer được ẩn khỏi client qua RPC get_quiz_questions.
CREATE TABLE public.quiz_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id   TEXT NOT NULL REFERENCES milestones(id),
  question       TEXT NOT NULL,                     -- Nội dung câu hỏi
  options        JSONB NOT NULL DEFAULT '[]'::jsonb, -- Mảng đáp án: ["A", "B", "C", "D"]
  correct_answer INTEGER NOT NULL,                  -- Index đáp án đúng (0-based)
  image_url      TEXT,                              -- Hình minh họa (tùy chọn)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.7 QUIZ_ATTEMPTS — Lịch sử làm quiz -----
-- Ghi lại mỗi lần làm quiz (tạo bởi RPC submit_quiz, KHÔNG cho client insert trực tiếp).
CREATE TABLE public.quiz_attempts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL,
  milestone_id     TEXT NOT NULL REFERENCES milestones(id),
  quiz_score       INTEGER NOT NULL,               -- Số câu đúng
  points_earned    INTEGER NOT NULL DEFAULT 0,      -- Điểm nhận được
  hearts_lost      INTEGER NOT NULL DEFAULT 0,      -- Số tim bị trừ
  double_points_used BOOLEAN NOT NULL DEFAULT false, -- Đã dùng x2 điểm?
  answers          JSONB,                           -- Mảng đáp án đã chọn
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.8 USER_PROGRESS — Tiến trình theo cột mốc -----
-- Theo dõi hoàn thành quiz cho mỗi cặp (user, milestone).
CREATE TABLE public.user_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,
  milestone_id   TEXT NOT NULL REFERENCES milestones(id),
  is_completed   BOOLEAN NOT NULL DEFAULT false,     -- Đã hoàn thành (≥8/10)?
  best_score     INTEGER DEFAULT 0,                  -- Điểm cao nhất
  attempts_count INTEGER NOT NULL DEFAULT 0,         -- Số lần thử
  completed_at   TIMESTAMPTZ,                        -- Thời điểm hoàn thành đầu tiên
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone_id)
);

-- ----- 2.9 BADGES — Huy hiệu -----
-- Tự động cấp khi hoàn thành quiz (score ≥ 8/10) qua RPC submit_quiz.
CREATE TABLE public.badges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  milestone_id TEXT NOT NULL REFERENCES milestones(id),
  badge_name   TEXT NOT NULL,
  badge_icon   TEXT,
  earned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone_id)                     -- Mỗi cột mốc chỉ nhận 1 huy hiệu
);

-- ----- 2.10 USER_DAILY_LIMITS — Giới hạn hàng ngày -----
-- Theo dõi số lần dùng x2 điểm (Premium: tối đa 2 lần/ngày).
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
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',       -- pending | approved | rejected
  note        TEXT,                                  -- Ghi chú từ người dùng
  admin_note  TEXT,                                  -- Phản hồi từ admin
  reviewed_by UUID,                                  -- Admin đã duyệt
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.12 FEEDBACK — Góp ý từ người dùng -----
CREATE TABLE public.feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new',           -- new | read | replied
  admin_reply TEXT,
  replied_by  UUID,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.13 REWARDS — Phần thưởng có thể đổi bằng điểm -----
CREATE TABLE public.rewards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  points_cost INTEGER NOT NULL,                      -- Số điểm cần để đổi
  reward_type TEXT NOT NULL DEFAULT 'voucher',        -- voucher | badge | item
  stock       INTEGER,                               -- NULL = vô hạn
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- 2.14 REWARD_REDEMPTIONS — Lịch sử đổi thưởng -----
CREATE TABLE public.reward_redemptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  reward_id    UUID NOT NULL REFERENCES rewards(id),
  points_spent INTEGER NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',      -- pending | approved | rejected
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

-- ===== PROFILES =====
-- User chỉ xem/sửa profile của mình. Admin xem tất cả. Không ai tự tạo/xóa.
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own safe fields" ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  -- Trigger protect_profile_fields ngăn user sửa: is_premium, total_points, user_id

-- ===== USER_ROLES =====
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== USER_HEARTS =====
-- Chỉ xem, KHÔNG cho client sửa trực tiếp (chỉ RPC submit_quiz mới sửa).
CREATE POLICY "Users view own hearts" ON public.user_hearts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct update hearts" ON public.user_hearts FOR UPDATE USING (false);

-- ===== MILESTONES (Công khai đọc, Admin quản lý) =====
CREATE POLICY "Anyone can view milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Only admins manage milestones" ON public.milestones FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== MILESTONE_DETAILS =====
CREATE POLICY "Anyone can view details" ON public.milestone_details FOR SELECT USING (true);
CREATE POLICY "Admins manage details" ON public.milestone_details FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== QUIZ_QUESTIONS =====
-- ⚠️ Client KHÔNG thể đọc trực tiếp (ẩn correct_answer).
-- Chỉ admin xem full, user dùng RPC get_quiz_questions.
CREATE POLICY "Only admins view full questions" ON public.quiz_questions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage questions" ON public.quiz_questions FOR ALL
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ===== QUIZ_ATTEMPTS =====
-- Chỉ xem, KHÔNG cho insert trực tiếp (chỉ RPC submit_quiz).
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

-- ===== REWARDS (Công khai đọc phần active, Admin quản lý) =====
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


-- =============================================================
-- 4. FUNCTIONS — Hàm cơ sở dữ liệu
-- =============================================================

-- ----- 4.1 has_role — Kiểm tra vai trò (SECURITY DEFINER) -----
-- Dùng trong RLS policies. SECURITY DEFINER để tránh đệ quy vô hạn.
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
-- Trigger trên auth.users → tạo profile + hearts + role mặc định.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Tạo profile với tên hiển thị từ metadata hoặc phần trước @ của email
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'username'
  );
  -- Cấp 5 tim mặc định
  INSERT INTO public.user_hearts (user_id) VALUES (NEW.id);
  -- Gán vai trò 'user' mặc định
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Trigger: Khi user mới được tạo trong auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----- 4.3 protect_profile_fields — Chống gian lận -----
-- Ngăn user tự sửa: is_premium, premium_expires_at, total_points, user_id.
-- Admin được phép sửa tất cả.
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.is_premium := OLD.is_premium;
    NEW.premium_expires_at := OLD.premium_expires_at;
    NEW.total_points := OLD.total_points;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

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

-- Áp dụng cho các bảng có cột updated_at
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

-- ----- 4.5 validate_quiz_question — Kiểm tra câu hỏi hợp lệ -----
CREATE OR REPLACE FUNCTION public.validate_quiz_question()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Phải có ít nhất 2 đáp án
  IF jsonb_array_length(NEW.options) < 2 THEN
    RAISE EXCEPTION 'Quiz question must have at least 2 options';
  END IF;
  -- correct_answer phải nằm trong phạm vi options
  IF NEW.correct_answer < 0 OR NEW.correct_answer >= jsonb_array_length(NEW.options) THEN
    RAISE EXCEPTION 'correct_answer must be valid index (0-%)', jsonb_array_length(NEW.options) - 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_quiz_question_trigger
  BEFORE INSERT OR UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.validate_quiz_question();

-- ----- 4.6 get_quiz_questions — Lấy câu hỏi (ẨN đáp án đúng) -----
-- Client chỉ nhận: id, question, options, image_url, milestone_id.
-- KHÔNG trả về correct_answer → chống gian lận.
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
-- Xử lý: chấm điểm, trừ tim, cộng điểm, x2 Premium, cấp badge.
-- SECURITY DEFINER: chạy với quyền owner → bypass RLS để ghi dữ liệu.
CREATE OR REPLACE FUNCTION public.submit_quiz(p_milestone_id TEXT, p_answers INTEGER[])
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
  v_double_used BOOLEAN := false;
  v_double_remaining INTEGER;
  v_question RECORD;
  v_idx INTEGER := 0;
  v_final_hearts INTEGER;
BEGIN
  -- === Kiểm tra đầu vào ===
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM milestones WHERE id = p_milestone_id) THEN
    RAISE EXCEPTION 'Milestone not found: %', p_milestone_id;
  END IF;
  IF p_answers IS NULL OR array_length(p_answers, 1) IS NULL THEN
    RAISE EXCEPTION 'Answers array is required';
  END IF;

  -- === Lấy thông tin Premium ===
  SELECT p.is_premium INTO v_is_premium FROM profiles p WHERE p.user_id = v_user_id;
  v_max_hearts := CASE WHEN v_is_premium THEN 10 ELSE 5 END;

  -- === Kiểm tra & reset tim nếu sang ngày mới ===
  SELECT h.hearts_remaining INTO v_hearts_remaining
    FROM user_hearts h WHERE h.user_id = v_user_id FOR UPDATE; -- Lock row
  IF (SELECT last_reset_at FROM user_hearts WHERE user_id = v_user_id) < CURRENT_DATE THEN
    UPDATE user_hearts SET hearts_remaining = v_max_hearts, last_reset_at = CURRENT_DATE
      WHERE user_id = v_user_id;
    v_hearts_remaining := v_max_hearts;
  END IF;
  IF v_hearts_remaining <= 0 THEN
    RETURN jsonb_build_object('error', 'No hearts remaining', 'hearts_remaining', 0);
  END IF;

  -- === Chấm điểm (lấy 10 câu ngẫu nhiên) ===
  v_total := 0;
  FOR v_question IN
    SELECT q.id, q.correct_answer FROM quiz_questions q
    WHERE q.milestone_id = p_milestone_id ORDER BY random() LIMIT 10
  LOOP
    v_total := v_total + 1;
    IF v_idx < array_length(p_answers, 1) AND p_answers[v_idx + 1] = v_question.correct_answer THEN
      v_score := v_score + 1;
    END IF;
    v_idx := v_idx + 1;
  END LOOP;

  IF v_total = 0 THEN RAISE EXCEPTION 'No quiz questions for milestone: %', p_milestone_id; END IF;
  IF array_length(p_answers, 1) <> v_total THEN
    RAISE EXCEPTION 'Expected % answers, got %', v_total, array_length(p_answers, 1);
  END IF;

  -- === Tính tim mất (score < 8 → mất 1 tim) ===
  IF v_score < 8 THEN v_hearts_lost := 1; END IF;

  -- === Tính điểm thưởng ===
  IF v_score > 5 THEN
    v_points := v_score * 10;  -- Mỗi câu đúng = 10 điểm
    -- Premium: x2 điểm (tối đa 2 lần/ngày, chỉ khi score ≥ 6)
    IF v_is_premium THEN
      INSERT INTO user_daily_limits (user_id, date, double_points_used)
        VALUES (v_user_id, CURRENT_DATE, 0) ON CONFLICT (user_id, date) DO NOTHING;
      SELECT dl.double_points_used INTO v_double_remaining
        FROM user_daily_limits dl WHERE dl.user_id = v_user_id AND dl.date = CURRENT_DATE FOR UPDATE;
      IF v_double_remaining < 2 AND v_score >= 6 THEN
        v_points := v_points * 2;
        v_double_used := true;
        UPDATE user_daily_limits SET double_points_used = double_points_used + 1
          WHERE user_id = v_user_id AND date = CURRENT_DATE;
      END IF;
    END IF;
  END IF;

  -- === Cập nhật tim ===
  IF v_hearts_lost > 0 THEN
    UPDATE user_hearts SET hearts_remaining = GREATEST(0, hearts_remaining - v_hearts_lost)
      WHERE user_id = v_user_id;
  END IF;
  SELECT h.hearts_remaining INTO v_final_hearts FROM user_hearts h WHERE h.user_id = v_user_id;

  -- === Ghi lịch sử quiz ===
  INSERT INTO quiz_attempts (user_id, milestone_id, quiz_score, points_earned, hearts_lost, double_points_used, answers)
  VALUES (v_user_id, p_milestone_id, v_score, v_points, v_hearts_lost, v_double_used, to_jsonb(p_answers));

  -- === Cập nhật tiến trình ===
  INSERT INTO user_progress (user_id, milestone_id, is_completed, best_score, attempts_count, completed_at)
  VALUES (v_user_id, p_milestone_id, v_score >= 8, v_score, 1, CASE WHEN v_score >= 8 THEN now() ELSE NULL END)
  ON CONFLICT (user_id, milestone_id) DO UPDATE SET
    best_score = GREATEST(COALESCE(user_progress.best_score, 0), EXCLUDED.best_score),
    is_completed = user_progress.is_completed OR EXCLUDED.is_completed,
    attempts_count = user_progress.attempts_count + 1,
    completed_at = COALESCE(user_progress.completed_at, EXCLUDED.completed_at),
    updated_at = now();

  -- === Cộng điểm vào profile ===
  IF v_points > 0 THEN
    UPDATE profiles SET total_points = total_points + v_points, updated_at = now()
      WHERE user_id = v_user_id;
  END IF;

  -- === Cấp badge nếu hoàn thành ===
  IF v_score >= 8 THEN
    INSERT INTO badges (user_id, milestone_id, badge_name)
    VALUES (v_user_id, p_milestone_id, 'Hoàn thành: ' || p_milestone_id)
    ON CONFLICT (user_id, milestone_id) DO NOTHING;
  END IF;

  -- === Trả kết quả ===
  RETURN jsonb_build_object(
    'score', v_score, 'total', v_total, 'points_earned', v_points,
    'hearts_lost', v_hearts_lost, 'hearts_remaining', v_final_hearts,
    'double_points_used', v_double_used, 'is_completed', v_score >= 8
  );
END;
$$;

-- ----- 4.8 get_hearts — Lấy số tim (có auto-reset) -----
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
  -- Reset tim nếu sang ngày mới
  UPDATE user_hearts h SET hearts_remaining = v_max_hearts, last_reset_at = CURRENT_DATE
    WHERE h.user_id = v_user_id AND h.last_reset_at < CURRENT_DATE;
  RETURN QUERY SELECT h.hearts_remaining, v_is_premium FROM user_hearts h WHERE h.user_id = v_user_id;
END;
$$;

-- ----- 4.9 get_leaderboard — Bảng xếp hạng (bảo vệ privacy) -----
-- Chỉ trả về: tên, điểm, Premium status. KHÔNG trả user_id.
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(display_name TEXT, total_points INTEGER, is_premium BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.display_name, p.total_points, p.is_premium
  FROM public.profiles p
  ORDER BY p.total_points DESC
  LIMIT 50;
$$;

-- ----- 4.10 check_username_exists — Kiểm tra username trùng -----
CREATE OR REPLACE FUNCTION public.check_username_exists(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE LOWER(username) = LOWER(p_username)
  );
$$;

-- ----- 4.11 get_email_by_username — Lấy email từ username (đăng nhập) -----
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


-- =============================================================
-- 5. STORAGE — Lưu trữ file
-- =============================================================

-- Bucket 'avatars' cho ảnh đại diện (public để hiển thị trên UI)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- User chỉ quản lý avatar trong thư mục {user_id}/
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


-- =============================================================
-- 6. EDGE FUNCTIONS — Backend serverless
-- =============================================================
-- Các Edge Function được deploy tự động từ thư mục supabase/functions/:
--
-- 📁 history-chat/    — AI chatbot trợ lý lịch sử (Premium only)
--                       Sử dụng Lovable AI (Gemini) để trả lời câu hỏi
--                       về các cột mốc lịch sử Việt Nam.
--
-- 📁 delete-user/     — Xóa tài khoản người dùng
--                       Admin xóa user (trừ admin khác).
--                       User tự xóa tài khoản của mình.
--                       Sử dụng service_role key để xóa từ auth.users.


-- =============================================================
-- 7. TÓM TẮT KIẾN TRÚC BẢO MẬT
-- =============================================================
--
-- ┌─────────────────────────────────────────────────────────────┐
-- │ CHỐNG GIAN LẬN (Anti-Cheat)                                │
-- ├─────────────────────────────────────────────────────────────┤
-- │ 1. correct_answer ẩn khỏi client (get_quiz_questions RPC)  │
-- │ 2. Chấm điểm server-side (submit_quiz RPC)                 │
-- │ 3. Cấm client ghi quiz_attempts, user_progress, badges     │
-- │ 4. Cấm client sửa user_hearts, user_daily_limits           │
-- │ 5. protect_profile_fields chặn sửa points/premium          │
-- ├─────────────────────────────────────────────────────────────┤
-- │ PHÂN QUYỀN                                                 │
-- ├─────────────────────────────────────────────────────────────┤
-- │ 1. Roles tách bảng riêng (user_roles) — chống escalation   │
-- │ 2. has_role() SECURITY DEFINER — tránh RLS đệ quy          │
-- │ 3. Admin check cả client-side (UX) + server-side (RLS)     │
-- ├─────────────────────────────────────────────────────────────┤
-- │ QUYỀN RIÊNG TƯ                                             │
-- ├─────────────────────────────────────────────────────────────┤
-- │ 1. User chỉ xem data của mình (RLS: auth.uid() = user_id)  │
-- │ 2. Leaderboard qua RPC — không lộ user_id                  │
-- │ 3. get_email_by_username SECURITY DEFINER — login only      │
-- └─────────────────────────────────────────────────────────────┘
