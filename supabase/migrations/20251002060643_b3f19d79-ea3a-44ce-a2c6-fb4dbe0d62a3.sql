-- Allow authenticated users to search for other players
-- This is needed for tournament invitations and player search
CREATE POLICY "Users can search other profiles for tournaments"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive policy that only allowed viewing own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;