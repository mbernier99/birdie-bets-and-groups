-- Create team_hole_scores table for tracking team scores
CREATE TABLE IF NOT EXISTS public.team_hole_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournaments(id) NOT NULL,
  team_id uuid REFERENCES public.tournament_teams(id) NOT NULL,
  hole_number integer NOT NULL,
  team_score integer NOT NULL,
  best_player_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, team_id, hole_number)
);

-- Index for fast lookups
CREATE INDEX idx_team_hole_scores_lookup 
ON public.team_hole_scores(tournament_id, team_id, hole_number);

-- Enable RLS
ALTER TABLE public.team_hole_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Team scores viewable by tournament members"
ON public.team_hole_scores
FOR SELECT
USING (
  tournament_id IN (
    SELECT tournament_id 
    FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team scores insertable by tournament members"
ON public.team_hole_scores
FOR INSERT
WITH CHECK (
  tournament_id IN (
    SELECT tournament_id 
    FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Team scores updatable by tournament members"
ON public.team_hole_scores
FOR UPDATE
USING (
  tournament_id IN (
    SELECT tournament_id 
    FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  )
);

-- Enable realtime
ALTER TABLE public.team_hole_scores REPLICA IDENTITY FULL;