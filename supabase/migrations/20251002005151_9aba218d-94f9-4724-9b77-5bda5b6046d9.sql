-- Drop the existing policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create a strict policy: users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a security definer function to search profiles for tournament invitations
-- This returns LIMITED data (no email/phone) to prevent data harvesting
CREATE OR REPLACE FUNCTION public.search_profiles_for_tournament(search_query text DEFAULT '')
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  nickname text,
  handicap integer,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return non-sensitive profile data for authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.nickname,
    p.handicap,
    p.avatar_url
  FROM public.profiles p
  WHERE 
    CASE 
      WHEN search_query = '' THEN true
      ELSE (
        LOWER(p.first_name) LIKE '%' || LOWER(search_query) || '%' OR
        LOWER(p.last_name) LIKE '%' || LOWER(search_query) || '%' OR
        LOWER(p.nickname) LIKE '%' || LOWER(search_query) || '%'
      )
    END
  ORDER BY p.first_name, p.last_name
  LIMIT 100;
END;
$$;

-- Add comment explaining the security design
COMMENT ON FUNCTION public.search_profiles_for_tournament IS 
'Secure function for searching profiles during tournament setup. Returns only non-sensitive data (no email/phone) to prevent data harvesting while enabling legitimate tournament invitations.';