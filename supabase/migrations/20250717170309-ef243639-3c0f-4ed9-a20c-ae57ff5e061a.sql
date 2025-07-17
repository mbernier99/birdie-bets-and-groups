-- Create courses table for golf course management
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  par INTEGER NOT NULL,
  holes INTEGER NOT NULL DEFAULT 18,
  rating DECIMAL(3,1),
  slope INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create holes table for individual hole data
CREATE TABLE public.holes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  par INTEGER NOT NULL,
  yardage INTEGER,
  handicap INTEGER,
  tee_latitude DECIMAL(10,8),
  tee_longitude DECIMAL(11,8),
  green_latitude DECIMAL(10,8),
  green_longitude DECIMAL(11,8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, hole_number)
);

-- Create rounds table for golf rounds
CREATE TABLE public.rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_score INTEGER,
  total_putts INTEGER,
  fairways_hit INTEGER,
  greens_in_regulation INTEGER,
  weather TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shots table for individual shot tracking
CREATE TABLE public.shots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  shot_number INTEGER NOT NULL,
  club TEXT,
  shot_type TEXT CHECK (shot_type IN ('drive', 'approach', 'chip', 'putt', 'penalty')),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  distance_yards INTEGER,
  accuracy TEXT CHECK (accuracy IN ('fairway', 'rough', 'bunker', 'water', 'green', 'pin')),
  photo_url TEXT,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hole scores table for scorecard data
CREATE TABLE public.hole_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  strokes INTEGER NOT NULL,
  putts INTEGER DEFAULT 0,
  fairway_hit BOOLEAN DEFAULT false,
  green_in_regulation BOOLEAN DEFAULT false,
  penalties INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(round_id, hole_number)
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hole_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for courses (public read, admin write)
CREATE POLICY "Courses are viewable by everyone" 
ON public.courses 
FOR SELECT 
USING (true);

-- Create policies for holes (public read, admin write)
CREATE POLICY "Holes are viewable by everyone" 
ON public.holes 
FOR SELECT 
USING (true);

-- Create policies for rounds (user-specific)
CREATE POLICY "Users can view their own rounds" 
ON public.rounds 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own rounds" 
ON public.rounds 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own rounds" 
ON public.rounds 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own rounds" 
ON public.rounds 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create policies for shots (user-specific through rounds)
CREATE POLICY "Users can view their own shots" 
ON public.shots 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.rounds 
    WHERE rounds.id = shots.round_id 
    AND rounds.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can create their own shots" 
ON public.shots 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rounds 
    WHERE rounds.id = shots.round_id 
    AND rounds.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can update their own shots" 
ON public.shots 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.rounds 
    WHERE rounds.id = shots.round_id 
    AND rounds.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can delete their own shots" 
ON public.shots 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.rounds 
    WHERE rounds.id = shots.round_id 
    AND rounds.user_id::text = auth.uid()::text
  )
);

-- Create policies for hole scores (user-specific through rounds)
CREATE POLICY "Users can view their own hole scores" 
ON public.hole_scores 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.rounds 
    WHERE rounds.id = hole_scores.round_id 
    AND rounds.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can create their own hole scores" 
ON public.hole_scores 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rounds 
    WHERE rounds.id = hole_scores.round_id 
    AND rounds.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can update their own hole scores" 
ON public.hole_scores 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.rounds 
    WHERE rounds.id = hole_scores.round_id 
    AND rounds.user_id::text = auth.uid()::text
  )
);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at
BEFORE UPDATE ON public.rounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hole_scores_updated_at
BEFORE UPDATE ON public.hole_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_holes_course_id ON public.holes(course_id);
CREATE INDEX idx_rounds_user_id ON public.rounds(user_id);
CREATE INDEX idx_rounds_course_id ON public.rounds(course_id);
CREATE INDEX idx_shots_round_id ON public.shots(round_id);
CREATE INDEX idx_shots_hole_number ON public.shots(hole_number);
CREATE INDEX idx_hole_scores_round_id ON public.hole_scores(round_id);

-- Insert some sample course data for testing
INSERT INTO public.courses (name, location, par, holes, rating, slope, latitude, longitude) VALUES
('Pebble Beach Golf Links', 'Pebble Beach, CA', 72, 18, 74.8, 142, 36.5684, -121.9487),
('Augusta National Golf Club', 'Augusta, GA', 72, 18, 76.2, 137, 33.5030, -82.0198),
('St. Andrews Old Course', 'St. Andrews, Scotland', 72, 18, 74.1, 133, 56.3484, -2.8047);

-- Insert sample hole data for Pebble Beach (first few holes)
INSERT INTO public.holes (course_id, hole_number, par, yardage, handicap, tee_latitude, tee_longitude) VALUES
((SELECT id FROM public.courses WHERE name = 'Pebble Beach Golf Links'), 1, 4, 381, 11, 36.5687, -121.9485),
((SELECT id FROM public.courses WHERE name = 'Pebble Beach Golf Links'), 2, 5, 502, 15, 36.5689, -121.9483),
((SELECT id FROM public.courses WHERE name = 'Pebble Beach Golf Links'), 3, 4, 390, 5, 36.5691, -121.9481),
((SELECT id FROM public.courses WHERE name = 'Pebble Beach Golf Links'), 4, 4, 331, 17, 36.5693, -121.9479),
((SELECT id FROM public.courses WHERE name = 'Pebble Beach Golf Links'), 5, 3, 188, 7, 36.5695, -121.9477),
((SELECT id FROM public.courses WHERE name = 'Pebble Beach Golf Links'), 6, 5, 513, 3, 36.5697, -121.9475),
((SELECT id FROM public.courses WHERE name = 'Pebble Beach Golf Links'), 7, 3, 106, 13, 36.5699, -121.9473),
((SELECT id FROM public.courses WHERE name = 'Pebble Beach Golf Links'), 8, 4, 431, 1, 36.5701, -121.9471),
((SELECT id FROM public.courses WHERE name = 'Pebble Beach Golf Links'), 9, 4, 464, 9, 36.5703, -121.9469);