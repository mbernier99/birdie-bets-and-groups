-- Create waitlist_signups table
CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'homepage',
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT waitlist_signups_email_unique UNIQUE (email)
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_email ON public.waitlist_signups(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_created_at ON public.waitlist_signups(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their email (public form submission)
CREATE POLICY "Anyone can sign up for waitlist"
ON public.waitlist_signups
FOR INSERT
TO public
WITH CHECK (true);

-- Only authenticated admins can view waitlist signups
CREATE POLICY "Only admins can view waitlist signups"
ON public.waitlist_signups
FOR SELECT
TO authenticated
USING (false); -- Will be updated when admin roles are implemented

-- Add comment to table
COMMENT ON TABLE public.waitlist_signups IS 'Stores email addresses from waitlist signup forms';