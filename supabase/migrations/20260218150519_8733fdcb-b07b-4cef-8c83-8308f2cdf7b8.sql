-- Update protect_profile_fields to allow auto-downgrade when premium expired
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    -- Allow setting is_premium to false if premium has expired
    IF NEW.is_premium = false AND OLD.is_premium = true 
       AND OLD.premium_expires_at IS NOT NULL 
       AND OLD.premium_expires_at < now() THEN
      -- Allow the downgrade (expired premium)
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
$function$;