-- Create side_game_results table to track all side game outcomes
CREATE TABLE IF NOT EXISTS public.side_game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL, -- 'skins', 'snake', 'wolf', 'wolf_turd'
  hole_number INTEGER NOT NULL,
  winner_id UUID REFERENCES public.profiles(id),
  amount NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create skins_tracking table for detailed skins game state
CREATE TABLE IF NOT EXISTS public.skins_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  pot_amount NUMERIC NOT NULL DEFAULT 0,
  is_carried_over BOOLEAN DEFAULT false,
  winner_id UUID REFERENCES public.profiles(id),
  winning_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, hole_number)
);

-- Create wolf_game_state table for wolf game tracking
CREATE TABLE IF NOT EXISTS public.wolf_game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  wolf_player_id UUID NOT NULL REFERENCES public.profiles(id),
  partner_id UUID REFERENCES public.profiles(id),
  is_lone_wolf BOOLEAN DEFAULT false,
  hole_result TEXT, -- 'wolf_win', 'opponents_win', 'tie'
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, hole_number)
);

-- Create snake_tracking table for snake game state
CREATE TABLE IF NOT EXISTS public.snake_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  snake_type TEXT NOT NULL, -- 'front_nine', 'back_nine', 'overall'
  current_holder_id UUID REFERENCES public.profiles(id),
  last_hole_updated INTEGER,
  amount NUMERIC NOT NULL DEFAULT 0,
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_side_game_results_tournament ON public.side_game_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_side_game_results_winner ON public.side_game_results(winner_id);
CREATE INDEX IF NOT EXISTS idx_skins_tracking_tournament ON public.skins_tracking(tournament_id);
CREATE INDEX IF NOT EXISTS idx_wolf_game_state_tournament ON public.wolf_game_state(tournament_id);
CREATE INDEX IF NOT EXISTS idx_snake_tracking_tournament ON public.snake_tracking(tournament_id);

-- Enable RLS
ALTER TABLE public.side_game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skins_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wolf_game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snake_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for side_game_results
CREATE POLICY "Side game results viewable by tournament members"
  ON public.side_game_results FOR SELECT
  USING (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Side game results insertable by tournament members"
  ON public.side_game_results FOR INSERT
  WITH CHECK (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Side game results updatable by tournament members"
  ON public.side_game_results FOR UPDATE
  USING (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for skins_tracking
CREATE POLICY "Skins tracking viewable by tournament members"
  ON public.skins_tracking FOR SELECT
  USING (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Skins tracking insertable by tournament members"
  ON public.skins_tracking FOR INSERT
  WITH CHECK (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Skins tracking updatable by tournament members"
  ON public.skins_tracking FOR UPDATE
  USING (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for wolf_game_state
CREATE POLICY "Wolf game state viewable by tournament members"
  ON public.wolf_game_state FOR SELECT
  USING (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Wolf game state insertable by tournament members"
  ON public.wolf_game_state FOR INSERT
  WITH CHECK (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Wolf game state updatable by tournament members"
  ON public.wolf_game_state FOR UPDATE
  USING (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for snake_tracking
CREATE POLICY "Snake tracking viewable by tournament members"
  ON public.snake_tracking FOR SELECT
  USING (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Snake tracking insertable by tournament members"
  ON public.snake_tracking FOR INSERT
  WITH CHECK (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Snake tracking updatable by tournament members"
  ON public.snake_tracking FOR UPDATE
  USING (
    tournament_id IN (
      SELECT tournament_id FROM public.tournament_participants
      WHERE user_id = auth.uid()
    )
  );

-- Create trigger for updating timestamps
CREATE TRIGGER update_side_game_results_updated_at
  BEFORE UPDATE ON public.side_game_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_snake_tracking_updated_at
  BEFORE UPDATE ON public.snake_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();