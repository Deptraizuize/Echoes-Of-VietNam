
-- ==========================================
-- ECHOES OF VIETNAM - PRODUCTION SCHEMA v3
-- Fix: Create has_role function BEFORE any policy references it
-- ==========================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. USER ROLES TABLE (needed by has_role)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. has_role FUNCTION (must exist before policies reference it)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- user_roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. MILESTONES
CREATE TABLE public.milestones (
  id TEXT PRIMARY KEY,
  period_id TEXT NOT NULL,
  phase_id TEXT NOT NULL,
  title TEXT NOT NULL,
  period_title TEXT NOT NULL,
  phase_title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Only admins manage milestones" ON public.milestones FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. MILESTONE DETAILS
CREATE TABLE public.milestone_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id TEXT NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  events TEXT,
  results TEXT,
  significance TEXT,
  hero_names TEXT[],
  landmark_names TEXT[],
  image_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.milestone_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view details" ON public.milestone_details FOR SELECT USING (true);
CREATE POLICY "Admins manage details" ON public.milestone_details FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 7. QUIZ QUESTIONS
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id TEXT NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Admins manage questions" ON public.quiz_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_quiz_questions_milestone ON public.quiz_questions(milestone_id);

-- Quiz validation trigger
CREATE OR REPLACE FUNCTION public.validate_quiz_question()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
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
CREATE TRIGGER trg_validate_quiz_question BEFORE INSERT OR UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.validate_quiz_question();

-- 8. USER PROGRESS
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_id TEXT NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  best_score INTEGER DEFAULT 0,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_id)
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own progress" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "No direct insert progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No direct update progress" ON public.user_progress FOR UPDATE TO authenticated USING (false);
CREATE INDEX idx_user_progress_user ON public.user_progress(user_id);

-- 9. QUIZ ATTEMPTS
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_id TEXT NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  quiz_score INTEGER NOT NULL CHECK (quiz_score BETWEEN 0 AND 10),
  points_earned INTEGER NOT NULL DEFAULT 0,
  hearts_lost INTEGER NOT NULL DEFAULT 0 CHECK (hearts_lost >= 0),
  double_points_used BOOLEAN NOT NULL DEFAULT false,
  answers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "No direct insert attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (false);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_milestone ON public.quiz_attempts(milestone_id);

-- 10. USER HEARTS
CREATE TABLE public.user_hearts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  hearts_remaining INTEGER NOT NULL DEFAULT 5 CHECK (hearts_remaining >= 0),
  last_reset_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_hearts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own hearts" ON public.user_hearts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "No direct update hearts" ON public.user_hearts FOR UPDATE TO authenticated USING (false);

-- 11. BADGES
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_id TEXT NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_id)
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own badges" ON public.badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "No direct insert badges" ON public.badges FOR INSERT TO authenticated WITH CHECK (false);

-- 12. USER DAILY LIMITS
CREATE TABLE public.user_daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  double_points_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
ALTER TABLE public.user_daily_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own limits" ON public.user_daily_limits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "No direct write limits" ON public.user_daily_limits FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "No direct update limits" ON public.user_daily_limits FOR UPDATE TO authenticated USING (false);

-- 13. GET HEARTS FUNCTION
CREATE OR REPLACE FUNCTION public.get_hearts()
RETURNS TABLE(hearts_remaining INTEGER, is_premium BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

-- 14. SUBMIT QUIZ RPC
CREATE OR REPLACE FUNCTION public.submit_quiz(p_milestone_id TEXT, p_answers INTEGER[])
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM milestones WHERE id = p_milestone_id) THEN
    RAISE EXCEPTION 'Milestone not found: %', p_milestone_id;
  END IF;
  IF p_answers IS NULL OR array_length(p_answers, 1) IS NULL THEN
    RAISE EXCEPTION 'Answers array is required';
  END IF;

  SELECT p.is_premium INTO v_is_premium FROM profiles p WHERE p.user_id = v_user_id;
  v_max_hearts := CASE WHEN v_is_premium THEN 10 ELSE 5 END;

  -- Lock heart row
  SELECT h.hearts_remaining INTO v_hearts_remaining FROM user_hearts h WHERE h.user_id = v_user_id FOR UPDATE;
  IF (SELECT last_reset_at FROM user_hearts WHERE user_id = v_user_id) < CURRENT_DATE THEN
    UPDATE user_hearts SET hearts_remaining = v_max_hearts, last_reset_at = CURRENT_DATE WHERE user_id = v_user_id;
    v_hearts_remaining := v_max_hearts;
  END IF;
  IF v_hearts_remaining <= 0 THEN
    RETURN jsonb_build_object('error', 'No hearts remaining', 'hearts_remaining', 0);
  END IF;

  -- Random questions
  v_total := 0;
  FOR v_question IN SELECT q.id, q.correct_answer FROM quiz_questions q WHERE q.milestone_id = p_milestone_id ORDER BY random() LIMIT 10
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

  IF v_score < 8 THEN v_hearts_lost := 1; END IF;

  IF v_score > 5 THEN
    v_points := v_score * 10;
    IF v_is_premium THEN
      INSERT INTO user_daily_limits (user_id, date, double_points_used) VALUES (v_user_id, CURRENT_DATE, 0) ON CONFLICT (user_id, date) DO NOTHING;
      SELECT dl.double_points_used INTO v_double_remaining FROM user_daily_limits dl WHERE dl.user_id = v_user_id AND dl.date = CURRENT_DATE FOR UPDATE;
      IF v_double_remaining < 2 AND v_score >= 6 THEN
        v_points := v_points * 2;
        v_double_used := true;
        UPDATE user_daily_limits SET double_points_used = double_points_used + 1 WHERE user_id = v_user_id AND date = CURRENT_DATE;
      END IF;
    END IF;
  END IF;

  IF v_hearts_lost > 0 THEN
    UPDATE user_hearts SET hearts_remaining = GREATEST(0, hearts_remaining - v_hearts_lost) WHERE user_id = v_user_id;
  END IF;

  SELECT h.hearts_remaining INTO v_final_hearts FROM user_hearts h WHERE h.user_id = v_user_id;

  INSERT INTO quiz_attempts (user_id, milestone_id, quiz_score, points_earned, hearts_lost, double_points_used, answers)
  VALUES (v_user_id, p_milestone_id, v_score, v_points, v_hearts_lost, v_double_used, to_jsonb(p_answers));

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

  RETURN jsonb_build_object(
    'score', v_score, 'total', v_total, 'points_earned', v_points,
    'hearts_lost', v_hearts_lost, 'hearts_remaining', v_final_hearts,
    'double_points_used', v_double_used, 'is_completed', v_score >= 8
  );
END;
$$;

-- 15. SECURITY: REVOKE/GRANT
REVOKE ALL ON FUNCTION public.submit_quiz FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz TO authenticated;
REVOKE ALL ON FUNCTION public.get_hearts FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_hearts TO authenticated;

-- 16. HANDLE NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_hearts (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 17. UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_milestone_details_updated_at BEFORE UPDATE ON public.milestone_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 18. SEED MILESTONES
INSERT INTO public.milestones (id, period_id, phase_id, title, period_title, phase_title, sort_order) VALUES
('tien-su', 'khoi-nguyen', 'tien-su', 'Di chỉ đồ đá cũ', 'Khởi Nguyên & Dựng Nước', 'Tiền sử', 1),
('hoa-binh-bac-son', 'khoi-nguyen', 'tien-su', 'Văn hóa Hòa Bình – Bắc Sơn', 'Khởi Nguyên & Dựng Nước', 'Tiền sử', 2),
('van-lang', 'khoi-nguyen', 'hong-bang', 'Nhà nước Văn Lang', 'Khởi Nguyên & Dựng Nước', 'Thời đại Hồng Bàng', 3),
('trong-dong-dong-son', 'khoi-nguyen', 'hong-bang', 'Trống đồng Đông Sơn', 'Khởi Nguyên & Dựng Nước', 'Thời đại Hồng Bàng', 4),
('au-lac', 'khoi-nguyen', 'au-lac', 'Thục Phán lập Âu Lạc', 'Khởi Nguyên & Dựng Nước', 'Âu Lạc', 5),
('co-loa', 'khoi-nguyen', 'au-lac', 'Thành Cổ Loa', 'Khởi Nguyên & Dựng Nước', 'Âu Lạc', 6),
('hai-ba-trung', 'bac-thuoc', 'tk1-6', 'Khởi nghĩa Hai Bà Trưng', 'Bắc Thuộc & Đấu Tranh', 'Thế kỷ I–VI', 7),
('ba-trieu', 'bac-thuoc', 'tk1-6', 'Khởi nghĩa Bà Triệu', 'Bắc Thuộc & Đấu Tranh', 'Thế kỷ I–VI', 8),
('van-xuan', 'bac-thuoc', 'tk1-6', 'Nhà nước Vạn Xuân', 'Bắc Thuộc & Đấu Tranh', 'Thế kỷ I–VI', 9),
('mai-thuc-loan', 'bac-thuoc', 'tk7-10', 'Mai Thúc Loan', 'Bắc Thuộc & Đấu Tranh', 'Thế kỷ VII–X', 10),
('phung-hung', 'bac-thuoc', 'tk7-10', 'Phùng Hưng', 'Bắc Thuộc & Đấu Tranh', 'Thế kỷ VII–X', 11),
('ho-khuc', 'bac-thuoc', 'tk7-10', 'Họ Khúc tự chủ', 'Bắc Thuộc & Đấu Tranh', 'Thế kỷ VII–X', 12),
('bach-dang-938', 'bac-thuoc', 'tk7-10', 'Ngô Quyền – Bạch Đằng 938', 'Bắc Thuộc & Đấu Tranh', 'Thế kỷ VII–X', 13),
('dinh-bo-linh', 'dai-viet', 'cung-co', 'Đinh Bộ Lĩnh dẹp 12 sứ quân', 'Đại Việt', 'Củng cố', 14),
('le-hoan-chong-tong', 'dai-viet', 'cung-co', 'Lê Hoàn chống Tống', 'Đại Việt', 'Củng cố', 15),
('doi-do-thang-long', 'dai-viet', 'vang-son', 'Lý Công Uẩn dời đô', 'Đại Việt', 'Thời đại vàng son', 16),
('nhu-nguyet', 'dai-viet', 'vang-son', 'Lý Thường Kiệt – Sông Như Nguyệt', 'Đại Việt', 'Thời đại vàng son', 17),
('chong-nguyen-mong', 'dai-viet', 'vang-son', '3 lần chống Nguyên Mông', 'Đại Việt', 'Thời đại vàng son', 18),
('ho-quy-ly', 'dai-viet', 'vang-son', 'Cải cách Hồ Quý Ly', 'Đại Việt', 'Thời đại vàng son', 19),
('lam-son', 'dai-viet', 'le-so', 'Khởi nghĩa Lam Sơn', 'Đại Việt', 'Lê Sơ & Nam Bắc Triều', 20),
('le-thanh-tong', 'dai-viet', 'le-so', 'Lê Thánh Tông – cực thịnh', 'Đại Việt', 'Lê Sơ & Nam Bắc Triều', 21),
('trinh-nguyen', 'dai-viet', 'le-so', 'Trịnh – Nguyễn phân tranh', 'Đại Việt', 'Lê Sơ & Nam Bắc Triều', 22),
('rach-gam', 'dai-viet', 'tay-son', 'Rạch Gầm – Xoài Mút', 'Đại Việt', 'Tây Sơn & Nguyễn', 23),
('quang-trung', 'dai-viet', 'tay-son', 'Quang Trung đại phá quân Thanh', 'Đại Việt', 'Tây Sơn & Nguyễn', 24),
('nha-nguyen', 'dai-viet', 'tay-son', 'Nhà Nguyễn thống nhất', 'Đại Việt', 'Tây Sơn & Nguyễn', 25),
('phap-da-nang', 'chong-phap', 'gd1', 'Pháp nổ súng Đà Nẵng', 'Kháng chiến chống Pháp', 'Giai đoạn 1', 26),
('can-vuong', 'chong-phap', 'gd1', 'Phong trào Cần Vương', 'Kháng chiến chống Pháp', 'Giai đoạn 1', 27),
('yen-the', 'chong-phap', 'gd1', 'Khởi nghĩa Yên Thế', 'Kháng chiến chống Pháp', 'Giai đoạn 1', 28),
('khai-thac-thuoc-dia', 'chong-phap', 'gd2', 'Khai thác thuộc địa', 'Kháng chiến chống Pháp', 'Giai đoạn 2', 29),
('nguyen-ai-quoc', 'chong-phap', 'gd2', 'Nguyễn Ái Quốc tìm đường', 'Kháng chiến chống Pháp', 'Giai đoạn 2', 30),
('thanh-lap-dang', 'chong-phap', 'gd2', 'Thành lập Đảng 1930', 'Kháng chiến chống Pháp', 'Giai đoạn 2', 31),
('cach-mang-thang-8', 'chong-phap', 'gd2', 'Cách mạng tháng 8 & Tuyên ngôn', 'Kháng chiến chống Pháp', 'Giai đoạn 2', 32),
('toan-quoc-khang-chien', 'bao-ve', 'chong-phap-2', 'Toàn quốc kháng chiến', 'Bảo vệ Độc lập & Đổi mới', 'Chống Pháp', 33),
('bien-gioi-1950', 'bao-ve', 'chong-phap-2', 'Chiến dịch Biên giới 1950', 'Bảo vệ Độc lập & Đổi mới', 'Chống Pháp', 34),
('dien-bien-phu', 'bao-ve', 'chong-phap-2', 'Điện Biên Phủ 1954', 'Bảo vệ Độc lập & Đổi mới', 'Chống Pháp', 35),
('dong-khoi', 'bao-ve', 'chong-my', 'Đồng Khởi 1960', 'Bảo vệ Độc lập & Đổi mới', 'Chống Mỹ', 36),
('dien-bien-phu-tren-khong', 'bao-ve', 'chong-my', 'Điện Biên Phủ trên không', 'Bảo vệ Độc lập & Đổi mới', 'Chống Mỹ', 37),
('chien-dich-hcm', 'bao-ve', 'chong-my', 'Chiến dịch Hồ Chí Minh 1975', 'Bảo vệ Độc lập & Đổi mới', 'Chống Mỹ', 38),
('thong-nhat', 'bao-ve', 'doi-moi', 'Thống nhất 1976', 'Bảo vệ Độc lập & Đổi mới', 'Đổi mới', 39),
('doi-moi-1986', 'bao-ve', 'doi-moi', 'Đổi mới 1986', 'Bảo vệ Độc lập & Đổi mới', 'Đổi mới', 40),
('hoi-nhap', 'bao-ve', 'doi-moi', 'Hội nhập quốc tế', 'Bảo vệ Độc lập & Đổi mới', 'Đổi mới', 41);
