-- Fix function search path security issue
DROP FUNCTION IF EXISTS public.increment_session_count();

CREATE OR REPLACE FUNCTION public.increment_session_count()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.onboarding_progress
  SET 
    session_count = session_count + 1,
    last_session_at = now()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;