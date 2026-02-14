
-- Fix RLS policies: all current policies are RESTRICTIVE (requires at least one PERMISSIVE to grant access)
-- Drop and recreate as PERMISSIVE for affected tables

-- REWARDS table
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards;
DROP POLICY IF EXISTS "Admins manage rewards" ON public.rewards;
CREATE POLICY "Anyone can view active rewards" ON public.rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage rewards" ON public.rewards FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- REWARD_REDEMPTIONS table
DROP POLICY IF EXISTS "Users can create redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Users view own redemptions" ON public.reward_redemptions;
DROP POLICY IF EXISTS "Admins manage redemptions" ON public.reward_redemptions;
CREATE POLICY "Users can create redemptions" ON public.reward_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own redemptions" ON public.reward_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage redemptions" ON public.reward_redemptions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- PROFILES table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AD_BANNERS table
DROP POLICY IF EXISTS "Anyone can view active banners" ON public.ad_banners;
DROP POLICY IF EXISTS "Admins manage banners" ON public.ad_banners;
CREATE POLICY "Anyone can view active banners" ON public.ad_banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage banners" ON public.ad_banners FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- MILESTONES table
DROP POLICY IF EXISTS "Anyone can view milestones" ON public.milestones;
DROP POLICY IF EXISTS "Only admins manage milestones" ON public.milestones;
CREATE POLICY "Anyone can view milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Only admins manage milestones" ON public.milestones FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- MILESTONE_DETAILS table
DROP POLICY IF EXISTS "Anyone can view details" ON public.milestone_details;
DROP POLICY IF EXISTS "Admins manage details" ON public.milestone_details;
CREATE POLICY "Anyone can view details" ON public.milestone_details FOR SELECT USING (true);
CREATE POLICY "Admins manage details" ON public.milestone_details FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- QUIZ_QUESTIONS table
DROP POLICY IF EXISTS "Anyone can view questions" ON public.quiz_questions;
DROP POLICY IF EXISTS "Admins manage questions" ON public.quiz_questions;
CREATE POLICY "Anyone can view questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Admins manage questions" ON public.quiz_questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- QUIZ_ATTEMPTS table
DROP POLICY IF EXISTS "Users view own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "No direct insert attempts" ON public.quiz_attempts;
CREATE POLICY "Users view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct insert attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (false);

-- BADGES table
DROP POLICY IF EXISTS "Users view own badges" ON public.badges;
DROP POLICY IF EXISTS "No direct insert badges" ON public.badges;
CREATE POLICY "Users view own badges" ON public.badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct insert badges" ON public.badges FOR INSERT WITH CHECK (false);

-- USER_HEARTS table
DROP POLICY IF EXISTS "Users view own hearts" ON public.user_hearts;
DROP POLICY IF EXISTS "No direct update hearts" ON public.user_hearts;
CREATE POLICY "Users view own hearts" ON public.user_hearts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct update hearts" ON public.user_hearts FOR UPDATE USING (false);

-- USER_PROGRESS table
DROP POLICY IF EXISTS "Users view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "No direct insert progress" ON public.user_progress;
DROP POLICY IF EXISTS "No direct update progress" ON public.user_progress;
CREATE POLICY "Users view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct insert progress" ON public.user_progress FOR INSERT WITH CHECK (false);
CREATE POLICY "No direct update progress" ON public.user_progress FOR UPDATE USING (false);

-- USER_DAILY_LIMITS table
DROP POLICY IF EXISTS "Users view own limits" ON public.user_daily_limits;
DROP POLICY IF EXISTS "No direct update limits" ON public.user_daily_limits;
DROP POLICY IF EXISTS "No direct write limits" ON public.user_daily_limits;
CREATE POLICY "Users view own limits" ON public.user_daily_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "No direct update limits" ON public.user_daily_limits FOR UPDATE USING (false);
CREATE POLICY "No direct write limits" ON public.user_daily_limits FOR INSERT WITH CHECK (false);

-- USER_ROLES table
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- FEEDBACK table
DROP POLICY IF EXISTS "Users can create feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins manage feedback" ON public.feedback;
CREATE POLICY "Users can create feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage feedback" ON public.feedback FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- PREMIUM_REQUESTS table
DROP POLICY IF EXISTS "Users can create requests" ON public.premium_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON public.premium_requests;
DROP POLICY IF EXISTS "Admins manage requests" ON public.premium_requests;
CREATE POLICY "Users can create requests" ON public.premium_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own requests" ON public.premium_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage requests" ON public.premium_requests FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
