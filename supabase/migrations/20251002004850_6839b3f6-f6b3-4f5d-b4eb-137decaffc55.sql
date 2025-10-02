-- Drop the existing public SELECT policy on profiles
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;

-- Create a new policy that restricts profile viewing to authenticated users only
-- This prevents anonymous scraping while allowing legitimate app usage
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Add a comment explaining the security reasoning
COMMENT ON POLICY "Authenticated users can view profiles" ON public.profiles IS 
'Restricts profile access to authenticated users only to prevent data scraping and unauthorized access to personal information';