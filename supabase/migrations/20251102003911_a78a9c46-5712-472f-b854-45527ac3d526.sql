-- Drop the existing function
DROP FUNCTION IF EXISTS public.search_profiles_for_tournament(text);

-- Recreate with correct handicap type
CREATE OR REPLACE FUNCTION public.search_profiles_for_tournament(search_query text DEFAULT ''::text)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  nickname text,
  handicap numeric(3,1),
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
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
$function$;