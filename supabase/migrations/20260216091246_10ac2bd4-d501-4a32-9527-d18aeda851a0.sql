
UPDATE public.profiles 
SET is_premium = true, premium_expires_at = now() + interval '30 days' 
WHERE user_id = '5076f57a-16b3-4575-b1b8-0f1a005960a3';
