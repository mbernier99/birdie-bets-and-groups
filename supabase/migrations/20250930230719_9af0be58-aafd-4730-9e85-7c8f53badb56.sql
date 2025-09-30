-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Create a new policy that allows public read access to profiles
CREATE POLICY "Profiles are publicly viewable"
ON public.profiles
FOR SELECT
TO public
USING (true);