-- Fix the Function Search Path Mutable warning for check_user_in_tournament function
-- Recreate the function with secure search_path setting

CREATE OR REPLACE FUNCTION public.check_user_in_tournament(tournament_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.tournament_participants
    WHERE public.tournament_participants.tournament_id = $1
      AND public.tournament_participants.user_id = auth.uid()
  );
END;
$function$;