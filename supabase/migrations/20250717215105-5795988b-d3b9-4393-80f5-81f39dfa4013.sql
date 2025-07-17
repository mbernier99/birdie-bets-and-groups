-- Fix the infinite recursion in tournament_participants RLS policy
-- First, create a security definer function to safely check tournament participation
CREATE OR REPLACE FUNCTION public.check_user_in_tournament(tournament_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM tournament_participants
    WHERE tournament_participants.tournament_id = $1
      AND tournament_participants.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Participants are viewable by tournament members" ON public.tournament_participants;

-- Create a new policy using the security definer function
CREATE POLICY "Participants are viewable by tournament members" 
ON public.tournament_participants
FOR SELECT
USING (
  -- Either the user is viewing their own participation OR
  -- They're allowed to view participants in tournaments they're in
  user_id = auth.uid() OR 
  public.check_user_in_tournament(tournament_id)
);