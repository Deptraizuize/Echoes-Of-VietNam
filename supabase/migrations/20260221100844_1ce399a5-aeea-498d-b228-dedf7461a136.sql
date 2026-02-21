
-- Fix: use DISABLE TRIGGER for specific user trigger only
CREATE OR REPLACE FUNCTION public.auto_expire_premium()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  -- Disable only the protect_profile_fields trigger
  ALTER TABLE public.profiles DISABLE TRIGGER protect_profile_sensitive_fields;
  
  UPDATE public.profiles
  SET is_premium = false, updated_at = now()
  WHERE is_premium = true
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < now();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  ALTER TABLE public.profiles ENABLE TRIGGER protect_profile_sensitive_fields;
  
  RETURN v_count;
END;
$function$;
