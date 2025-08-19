-- Update users/profiles for the new role system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'player';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update display_name from existing names
UPDATE profiles 
SET display_name = COALESCE(
  CASE 
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
    WHEN first_name IS NOT NULL THEN first_name
    WHEN last_name IS NOT NULL THEN last_name
    ELSE email
  END
);

-- Create join codes for participants
ALTER TABLE tournament_participants ADD COLUMN IF NOT EXISTS join_code TEXT;
ALTER TABLE tournament_participants ADD COLUMN IF NOT EXISTS join_url TEXT;
ALTER TABLE tournament_participants ADD COLUMN IF NOT EXISTS invite_status TEXT NOT NULL DEFAULT 'draft';

-- Create unique index for join codes
CREATE UNIQUE INDEX IF NOT EXISTS idx_tournament_participants_join_code ON tournament_participants(join_code) WHERE join_code IS NOT NULL;

-- Create handicap snapshots table
CREATE TABLE IF NOT EXISTS handicap_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES tournament_participants(id) ON DELETE CASCADE,
  handicap_index DECIMAL NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for handicap snapshots
ALTER TABLE handicap_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policy for handicap snapshots
CREATE POLICY "Handicap snapshots viewable by tournament members" 
ON handicap_snapshots FOR SELECT 
USING (
  participant_id IN (
    SELECT tp.id FROM tournament_participants tp
    WHERE tp.tournament_id IN (
      SELECT tournament_id FROM tournament_participants 
      WHERE user_id = auth.uid()
    )
  )
);

-- Create rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for rounds
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Create policy for rounds
CREATE POLICY "Rounds viewable by tournament members" 
ON rounds FOR SELECT 
USING (
  tournament_id IN (
    SELECT tournament_id FROM tournament_participants 
    WHERE user_id = auth.uid()
  )
);

-- Create scorecards table
CREATE TABLE IF NOT EXISTS scorecards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES tournament_participants(id) ON DELETE CASCADE,
  hole_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  gross_total INTEGER,
  net_total INTEGER,
  computed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for scorecards
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;

-- Create policies for scorecards
CREATE POLICY "Scorecards viewable by tournament members" 
ON scorecards FOR SELECT 
USING (
  round_id IN (
    SELECT r.id FROM rounds r
    WHERE r.tournament_id IN (
      SELECT tournament_id FROM tournament_participants 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own scorecards" 
ON scorecards FOR UPDATE 
USING (
  participant_id IN (
    SELECT id FROM tournament_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own scorecards" 
ON scorecards FOR INSERT 
WITH CHECK (
  participant_id IN (
    SELECT id FROM tournament_participants 
    WHERE user_id = auth.uid()
  )
);

-- Create bets table (enhance existing press_bets or create new)
CREATE TABLE IF NOT EXISTS bets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  bet_type TEXT NOT NULL, -- 'match', 'bestBall2', 'skins', 'stableford', 'ctp', 'longDrive'
  participants JSONB NOT NULL DEFAULT '[]'::jsonb, -- participant IDs or team IDs
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'settled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for bets
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Create policy for bets
CREATE POLICY "Bets viewable by tournament members" 
ON bets FOR SELECT 
USING (
  tournament_id IN (
    SELECT tournament_id FROM tournament_participants 
    WHERE user_id = auth.uid()
  )
);

-- Create bet presses table
CREATE TABLE IF NOT EXISTS bet_presses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_bet_id UUID NOT NULL REFERENCES bets(id) ON DELETE CASCADE,
  initiator_participant_id UUID NOT NULL REFERENCES tournament_participants(id) ON DELETE CASCADE,
  target_participant_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  trigger_hole INTEGER NOT NULL,
  stake_override DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for bet presses
ALTER TABLE bet_presses ENABLE ROW LEVEL SECURITY;

-- Create policy for bet presses
CREATE POLICY "Bet presses viewable by tournament members" 
ON bet_presses FOR SELECT 
USING (
  parent_bet_id IN (
    SELECT id FROM bets 
    WHERE tournament_id IN (
      SELECT tournament_id FROM tournament_participants 
      WHERE user_id = auth.uid()
    )
  )
);

-- Create ledger entries table
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  bet_id UUID REFERENCES bets(id) ON DELETE CASCADE,
  press_id UUID REFERENCES bet_presses(id) ON DELETE CASCADE,
  from_participant_id UUID REFERENCES tournament_participants(id) ON DELETE CASCADE,
  to_participant_id UUID REFERENCES tournament_participants(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for ledger entries
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for ledger entries
CREATE POLICY "Ledger entries viewable by tournament members" 
ON ledger_entries FOR SELECT 
USING (
  tournament_id IN (
    SELECT tournament_id FROM tournament_participants 
    WHERE user_id = auth.uid()
  )
);

-- Create tee sets table (enhance existing course_tees)
ALTER TABLE course_tees ADD COLUMN IF NOT EXISTS tee_name TEXT NOT NULL DEFAULT 'White';
ALTER TABLE course_tees ADD COLUMN IF NOT EXISTS tee_color TEXT;

-- Update holes table to include stroke index
ALTER TABLE holes ADD COLUMN IF NOT EXISTS stroke_index_men INTEGER;
ALTER TABLE holes ADD COLUMN IF NOT EXISTS stroke_index_women INTEGER;

-- Add yardage_by_tee to holes table
ALTER TABLE holes ADD COLUMN IF NOT EXISTS yardage_by_tee JSONB DEFAULT '{}'::jsonb;

-- Update tournaments for privacy and tee selection
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS privacy TEXT NOT NULL DEFAULT 'private';
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tee_name TEXT;