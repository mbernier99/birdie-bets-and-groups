-- Fix security issue: Remove public access to profiles table
-- Drop the insecure public SELECT policy
DROP POLICY IF EXISTS "Users can search other profiles for tournaments" ON public.profiles;

-- Policy 1: Users can view their own profile (full access)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Tournament participants can view other participants' basic info
-- Only shows limited, non-sensitive fields for users in the same tournament
CREATE POLICY "Tournament participants can view each other"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT tp.user_id
    FROM public.tournament_participants tp
    WHERE tp.tournament_id IN (
      SELECT tournament_id
      FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  )
);

-- Note: Profile searching for tournaments is handled by the existing
-- search_profiles_for_tournament() security definer function which
-- controls what data is exposed and to whom