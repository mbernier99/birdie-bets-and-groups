-- Create a dedicated extensions schema for future extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Update search_path to include the extensions schema
ALTER DATABASE postgres SET search_path TO "$user", public, extensions;

-- Note: Existing extensions like pg_net will remain in the public schema,
-- but new extensions should be created in the extensions schema
COMMENT ON SCHEMA extensions IS 'Schema for extensions. Some existing extensions like pg_net cannot be moved from public schema.';