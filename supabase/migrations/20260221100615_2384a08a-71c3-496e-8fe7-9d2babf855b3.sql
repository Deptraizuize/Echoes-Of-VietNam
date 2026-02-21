
-- Create a SECURITY DEFINER function to auto-expire premium accounts
-- This bypasses RLS and the protect_profile_fields trigger by directly updating
CREATE OR REPLACE FUNCTION public.auto_expire_premium()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  -- Temporarily disable the trigger to allow bulk update
  ALTER TABLE public.profiles DISABLE TRIGGER ALL;
  
  UPDATE public.profiles
  SET is_premium = false, updated_at = now()
  WHERE is_premium = true
    AND premium_expires_at IS NOT NULL
    AND premium_expires_at < now();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Re-enable triggers
  ALTER TABLE public.profiles ENABLE TRIGGER ALL;
  
  RETURN v_count;
END;
$function$;
