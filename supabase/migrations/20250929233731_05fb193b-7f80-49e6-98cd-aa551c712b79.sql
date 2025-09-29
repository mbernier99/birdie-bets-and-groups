-- Fix: Update get_display_name function with proper search_path
CREATE OR REPLACE FUNCTION public.get_display_name(profile_row public.profiles)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    profile_row.nickname,
    profile_row.first_name,
    profile_row.email
  )
$$;