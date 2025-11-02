-- Add DELETE policy for tournament creators
CREATE POLICY "Tournament creators can delete their tournaments"
ON public.tournaments
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Ensure cascade deletes are properly set up for related tables
-- Update foreign key constraints to cascade deletes

-- For tournament_participants
ALTER TABLE public.tournament_participants
DROP CONSTRAINT IF EXISTS tournament_participants_tournament_id_fkey;

ALTER TABLE public.tournament_participants
ADD CONSTRAINT tournament_participants_tournament_id_fkey
FOREIGN KEY (tournament_id)
REFERENCES public.tournaments(id)
ON DELETE CASCADE;

-- For tournament_rounds
ALTER TABLE public.tournament_rounds
DROP CONSTRAINT IF EXISTS tournament_rounds_tournament_id_fkey;

ALTER TABLE public.tournament_rounds
ADD CONSTRAINT tournament_rounds_tournament_id_fkey
FOREIGN KEY (tournament_id)
REFERENCES public.tournaments(id)
ON DELETE CASCADE;

-- For tournament_messages
ALTER TABLE public.tournament_messages
DROP CONSTRAINT IF EXISTS tournament_messages_tournament_id_fkey;

ALTER TABLE public.tournament_messages
ADD CONSTRAINT tournament_messages_tournament_id_fkey
FOREIGN KEY (tournament_id)
REFERENCES public.tournaments(id)
ON DELETE CASCADE;

-- For tournament_teams
ALTER TABLE public.tournament_teams
DROP CONSTRAINT IF EXISTS tournament_teams_tournament_id_fkey;

ALTER TABLE public.tournament_teams
ADD CONSTRAINT tournament_teams_tournament_id_fkey
FOREIGN KEY (tournament_id)
REFERENCES public.tournaments(id)
ON DELETE CASCADE;

-- For press_bets
ALTER TABLE public.press_bets
DROP CONSTRAINT IF EXISTS press_bets_tournament_id_fkey;

ALTER TABLE public.press_bets
ADD CONSTRAINT press_bets_tournament_id_fkey
FOREIGN KEY (tournament_id)
REFERENCES public.tournaments(id)
ON DELETE CASCADE;

-- For skins_tracking
ALTER TABLE public.skins_tracking
DROP CONSTRAINT IF EXISTS skins_tracking_tournament_id_fkey;

ALTER TABLE public.skins_tracking
ADD CONSTRAINT skins_tracking_tournament_id_fkey
FOREIGN KEY (tournament_id)
REFERENCES public.tournaments(id)
ON DELETE CASCADE;

-- For wolf_game_state
ALTER TABLE public.wolf_game_state
DROP CONSTRAINT IF EXISTS wolf_game_state_tournament_id_fkey;

ALTER TABLE public.wolf_game_state
ADD CONSTRAINT wolf_game_state_tournament_id_fkey
FOREIGN KEY (tournament_id)
REFERENCES public.tournaments(id)
ON DELETE CASCADE;

-- For snake_tracking
ALTER TABLE public.snake_tracking
DROP CONSTRAINT IF EXISTS snake_tracking_tournament_id_fkey;

ALTER TABLE public.snake_tracking
ADD CONSTRAINT snake_tracking_tournament_id_fkey
FOREIGN KEY (tournament_id)
REFERENCES public.tournaments(id)
ON DELETE CASCADE;

-- For side_game_results
ALTER TABLE public.side_game_results
DROP CONSTRAINT IF EXISTS side_game_results_tournament_id_fkey;

ALTER TABLE public.side_game_results
ADD CONSTRAINT side_game_results_tournament_id_fkey
FOREIGN KEY (tournament_id)
REFERENCES public.tournaments(id)
ON DELETE CASCADE;