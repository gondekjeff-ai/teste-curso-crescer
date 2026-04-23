-- Fix Function Search Path Mutable issue
-- Add SET search_path to cleanup_old_rate_limits function

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
  RETURN NEW;
END;
$function$;