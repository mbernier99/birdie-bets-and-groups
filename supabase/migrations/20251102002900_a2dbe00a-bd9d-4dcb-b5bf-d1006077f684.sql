-- Update handicap column to support decimal values with one decimal point
ALTER TABLE public.profiles 
ALTER COLUMN handicap TYPE numeric(3,1);

-- Update group_members handicap to match
ALTER TABLE public.group_members 
ALTER COLUMN handicap TYPE numeric(3,1);

-- Update tournament_participants handicap to match
ALTER TABLE public.tournament_participants 
ALTER COLUMN handicap TYPE numeric(3,1);

COMMENT ON COLUMN public.profiles.handicap IS 'Golf handicap index with one decimal point precision (e.g., 16.5)';