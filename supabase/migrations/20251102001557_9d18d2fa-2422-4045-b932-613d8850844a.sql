-- Fix corrupted auth.users records where aud (audience) is NULL
-- This prevents Supabase auth admin API from loading these users

UPDATE auth.users 
SET aud = 'authenticated',
    role = COALESCE(role, 'authenticated'),
    updated_at = now()
WHERE aud IS NULL 
   OR role IS NULL;