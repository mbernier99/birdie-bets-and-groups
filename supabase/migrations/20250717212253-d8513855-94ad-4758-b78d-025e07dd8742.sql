-- Fix extension in public schema by moving extensions to their own schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Update search_path to include the new extensions schema
ALTER DATABASE postgres SET search_path TO "$user", public, extensions;

-- Move existing public extensions to the extensions schema
-- This won't move the extension objects themselves, just change where new objects are created
DO $$
DECLARE
  ext text;
BEGIN
  FOR ext IN SELECT extname FROM pg_extension WHERE extnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext);
  END LOOP;
END $$;