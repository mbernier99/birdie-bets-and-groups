-- Update search_profiles_for_tournament to work without authentication
-- This allows the function to be called from QuickLogin and tournament setup
DROP FUNCTION IF EXISTS public.search_profiles_for_tournament(text);

CREATE OR REPLACE FUNCTION public.search_profiles_for_tournament(search_query text DEFAULT ''::text)
RETURNS TABLE(id uuid, first_name text, last_name text, nickname text, handicap integer, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Allow searching profiles without authentication for tournament setup
  -- Only return non-sensitive profile data
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