-- Update profiles RLS policy to allow viewing all profiles
-- This is necessary for tournament creation where users need to see and invite other players

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_profiles_search ON public.profiles (first_name, last_name, email, nickname);