-- Allow public viewing of tournament details for invite links
-- This enables shareable tournament invites without requiring login

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Tournaments are viewable by participants" ON public.tournaments;

-- Create new public SELECT policy
CREATE POLICY "Anyone can view tournament details"
ON public.tournaments
FOR SELECT
USING (true);

-- Note: Joining tournaments still requires authentication via tournament_participants table RLS
-- Existing UPDATE and INSERT policies remain unchanged