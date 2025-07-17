-- Phase 1: Enhanced Golf Course Database Schema

-- First, let's add tee-specific information to support multiple tees per course
CREATE TABLE IF NOT EXISTS public.course_tees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tee_name TEXT NOT NULL, -- Red, White, Blue, Black, Gold, etc.
  tee_color TEXT, -- Hex color for UI display
  rating NUMERIC, -- Course rating for this tee
  slope INTEGER, -- Slope rating for this tee
  total_yardage INTEGER, -- Total yardage for this tee
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, tee_name)
);

-- Add tee-specific yardage to holes table
ALTER TABLE public.holes 
ADD COLUMN IF NOT EXISTS tee_id UUID REFERENCES course_tees(id) ON DELETE CASCADE;

-- Create a new holes_tees table for better normalization (hole yardage per tee)
CREATE TABLE IF NOT EXISTS public.hole_tees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hole_id UUID NOT NULL REFERENCES holes(id) ON DELETE CASCADE,
  tee_id UUID NOT NULL REFERENCES course_tees(id) ON DELETE CASCADE,
  yardage INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hole_id, tee_id)
);

-- Add course import tracking
CREATE TABLE IF NOT EXISTS public.course_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  import_source TEXT NOT NULL, -- 'api', 'manual', 'local'
  source_id TEXT, -- External API course ID
  imported_by UUID REFERENCES auth.users(id),
  imported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add course favorites for users
CREATE TABLE IF NOT EXISTS public.user_course_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS on new tables
ALTER TABLE public.course_tees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hole_tees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_tees
CREATE POLICY "Course tees are viewable by everyone" 
ON public.course_tees 
FOR SELECT 
USING (true);

-- RLS policies for hole_tees
CREATE POLICY "Hole tees are viewable by everyone" 
ON public.hole_tees 
FOR SELECT 
USING (true);

-- RLS policies for course_imports
CREATE POLICY "Course imports are viewable by everyone" 
ON public.course_imports 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create course imports" 
ON public.course_imports 
FOR INSERT 
WITH CHECK (auth.uid() = imported_by);

-- RLS policies for user_course_favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_course_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.user_course_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_course_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_course_tees_updated_at
BEFORE UPDATE ON public.course_tees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_tees_course_id ON public.course_tees(course_id);
CREATE INDEX IF NOT EXISTS idx_hole_tees_hole_id ON public.hole_tees(hole_id);
CREATE INDEX IF NOT EXISTS idx_hole_tees_tee_id ON public.hole_tees(tee_id);
CREATE INDEX IF NOT EXISTS idx_course_imports_course_id ON public.course_imports(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_favorites_user_id ON public.user_course_favorites(user_id);

-- Add some validation constraints
ALTER TABLE public.course_tees 
ADD CONSTRAINT check_rating_range CHECK (rating IS NULL OR (rating >= 50 AND rating <= 85));

ALTER TABLE public.course_tees 
ADD CONSTRAINT check_slope_range CHECK (slope IS NULL OR (slope >= 55 AND slope <= 155));

ALTER TABLE public.hole_tees 
ADD CONSTRAINT check_yardage_range CHECK (yardage >= 50 AND yardage <= 700);

-- Update holes table constraints
ALTER TABLE public.holes 
ADD CONSTRAINT check_par_range CHECK (par >= 3 AND par <= 6);

ALTER TABLE public.holes 
ADD CONSTRAINT check_handicap_range CHECK (handicap IS NULL OR (handicap >= 1 AND handicap <= 18));