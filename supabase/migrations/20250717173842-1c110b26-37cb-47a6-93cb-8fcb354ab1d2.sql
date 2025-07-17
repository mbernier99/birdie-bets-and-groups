-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id),
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'lobby', 'live', 'completed', 'cancelled')),
  game_type TEXT NOT NULL DEFAULT 'stroke' CHECK (game_type IN ('stroke', 'match', 'team_match', 'skins', 'stableford')),
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_pool DECIMAL(10,2) DEFAULT 0,
  max_players INTEGER DEFAULT 16,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  rules JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament participants table
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID,
  handicap INTEGER,
  entry_paid BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'withdrawn')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Create tournament teams table
CREATE TABLE public.tournament_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament rounds table (connects tournaments to golf rounds)
CREATE TABLE public.tournament_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.tournament_teams(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, round_id)
);

-- Create press/betting table
CREATE TABLE public.press_bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL,
  target_id UUID NOT NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('closest_to_pin', 'longest_drive', 'next_hole', 'match_hole', 'side_bet')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  hole_number INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  winner_id UUID,
  location_lat NUMERIC,
  location_lng NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create tournament chat table
CREATE TABLE public.tournament_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'bet', 'score_update')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tournaments
CREATE POLICY "Tournaments are viewable by participants" 
ON public.tournaments 
FOR SELECT 
USING (
  id IN (
    SELECT tournament_id FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  ) OR created_by = auth.uid()
);

CREATE POLICY "Users can create tournaments" 
ON public.tournaments 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tournament creators can update their tournaments" 
ON public.tournaments 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create RLS policies for tournament participants
CREATE POLICY "Participants are viewable by tournament members" 
ON public.tournament_participants 
FOR SELECT 
USING (
  tournament_id IN (
    SELECT tournament_id FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can join tournaments" 
ON public.tournament_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
ON public.tournament_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for tournament teams
CREATE POLICY "Teams are viewable by tournament members" 
ON public.tournament_teams 
FOR SELECT 
USING (
  tournament_id IN (
    SELECT tournament_id FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for tournament rounds
CREATE POLICY "Tournament rounds are viewable by participants" 
ON public.tournament_rounds 
FOR SELECT 
USING (
  tournament_id IN (
    SELECT tournament_id FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own tournament rounds" 
ON public.tournament_rounds 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for press bets
CREATE POLICY "Press bets are viewable by tournament members" 
ON public.press_bets 
FOR SELECT 
USING (
  tournament_id IN (
    SELECT tournament_id FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create press bets" 
ON public.press_bets 
FOR INSERT 
WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Users can update bets they're involved in" 
ON public.press_bets 
FOR UPDATE 
USING (auth.uid() = initiator_id OR auth.uid() = target_id);

-- Create RLS policies for tournament messages
CREATE POLICY "Messages are viewable by tournament members" 
ON public.tournament_messages 
FOR SELECT 
USING (
  tournament_id IN (
    SELECT tournament_id FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in tournaments they're in" 
ON public.tournament_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  tournament_id IN (
    SELECT tournament_id FROM public.tournament_participants 
    WHERE user_id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_tournaments_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_tournaments_created_by ON public.tournaments(created_by);
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournament_participants_tournament_id ON public.tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user_id ON public.tournament_participants(user_id);
CREATE INDEX idx_press_bets_tournament_id ON public.press_bets(tournament_id);
CREATE INDEX idx_press_bets_status ON public.press_bets(status);
CREATE INDEX idx_tournament_messages_tournament_id ON public.tournament_messages(tournament_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.press_bets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_messages;