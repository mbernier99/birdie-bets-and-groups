-- Allow tournament organizers to create rounds for any participant
CREATE POLICY "Tournament organizers can create participant rounds"
ON rounds FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT tp.user_id 
    FROM tournament_participants tp
    JOIN tournaments t ON t.id = tp.tournament_id
    WHERE t.created_by = auth.uid()
  )
);

-- Allow tournament organizers to manage participant scores
CREATE POLICY "Tournament organizers can manage participant scores"
ON hole_scores FOR ALL
TO authenticated
USING (
  round_id IN (
    SELECT r.id FROM rounds r
    JOIN tournament_rounds tr ON tr.round_id = r.id
    JOIN tournaments t ON t.id = tr.tournament_id
    WHERE t.created_by = auth.uid()
  )
)
WITH CHECK (
  round_id IN (
    SELECT r.id FROM rounds r
    JOIN tournament_rounds tr ON tr.round_id = r.id
    JOIN tournaments t ON t.id = tr.tournament_id
    WHERE t.created_by = auth.uid()
  )
);