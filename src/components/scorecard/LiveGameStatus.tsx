import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SkinsTracker } from '@/components/SkinsTracker';
import { SnakeIndicator } from '@/components/SnakeIndicator';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, TrendingUp } from 'lucide-react';
import type { SkinResult } from '@/utils/skinsCalculations';
import type { SnakeState } from '@/utils/snakeTracking';

interface LiveGameStatusProps {
  tournamentId: string;
  currentHole: number;
  settings: any;
  playerNames: Map<string, string>;
}

export function LiveGameStatus({ tournamentId, currentHole, settings, playerNames }: LiveGameStatusProps) {
  const [skinResults, setSkinResults] = useState<SkinResult[]>([]);
  const [snakeStates, setSnakeStates] = useState<SnakeState[]>([]);
  const [teamScores, setTeamScores] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    // Fetch initial data
    fetchSkinsData();
    fetchSnakeData();
    if (settings.gameType?.teamFormat) {
      fetchTeamScores();
    }

    // Subscribe to real-time updates
    const skinsChannel = supabase
      .channel('skins-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skins_tracking',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => fetchSkinsData()
      )
      .subscribe();

    const snakeChannel = supabase
      .channel('snake-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'snake_tracking',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => fetchSnakeData()
      )
      .subscribe();

    const teamChannel = supabase
      .channel('team-scores-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_hole_scores',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => fetchTeamScores()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(skinsChannel);
      supabase.removeChannel(snakeChannel);
      supabase.removeChannel(teamChannel);
    };
  }, [tournamentId]);

  async function fetchSkinsData() {
    const { data } = await supabase
      .from('skins_tracking')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('hole_number', { ascending: false })
      .limit(5);

    if (data) {
      setSkinResults(data.map(d => ({
        winnerId: d.winner_id,
        winnerScore: d.winning_score,
        potAmount: d.pot_amount,
        isCarryover: d.is_carried_over,
        holeNumber: d.hole_number,
        tiedPlayers: []
      })));
    }
  }

  async function fetchSnakeData() {
    const { data } = await supabase
      .from('snake_tracking')
      .select('*')
      .eq('tournament_id', tournamentId);

    if (data) {
      setSnakeStates(data.map(d => ({
        snakeType: d.snake_type as 'front_nine' | 'back_nine' | 'overall',
        currentHolderId: d.current_holder_id,
        lastHoleUpdated: d.last_hole_updated,
        amount: d.amount,
        isFinal: d.is_final
      })));
    }
  }

  async function fetchTeamScores() {
    const { data } = await supabase
      .from('team_hole_scores')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('hole_number', { ascending: false });

    if (data) {
      const scoresMap = new Map();
      data.forEach(score => {
        if (!scoresMap.has(score.team_id)) {
          scoresMap.set(score.team_id, []);
        }
        scoresMap.get(score.team_id).push(score);
      });
      setTeamScores(scoresMap);
    }
  }

  const hasSkins = settings.sideGames?.includes('skins');
  const hasSnake = settings.sideGames?.includes('snake');
  const hasTeamFormat = settings.gameType?.teamFormat;

  if (!hasSkins && !hasSnake && !hasTeamFormat) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Live Game Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Accordion type="single" collapsible className="w-full">
          {hasTeamFormat && (
            <AccordionItem value="team" className="border-border/50">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Team Best Ball</span>
                  <Badge variant="secondary" className="text-xs">
                    Hole {currentHole}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {Array.from(teamScores.entries()).map(([teamId, scores]) => {
                    const lastHole = scores[0];
                    return (
                      <div key={teamId} className="flex justify-between items-center text-sm">
                        <span>Team {teamId.slice(0, 8)}</span>
                        <Badge variant="outline">
                          {lastHole?.team_score || '-'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasSkins && (
            <AccordionItem value="skins" className="border-border/50">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Skins</span>
                  {skinResults[0]?.isCarryover && (
                    <Badge variant="secondary" className="text-xs">
                      ${skinResults[0].potAmount} pot
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <SkinsTracker
                  skinResults={skinResults}
                  currentHole={currentHole}
                  playerNames={playerNames}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {hasSnake && snakeStates.length > 0 && (
            <AccordionItem value="snake" className="border-border/50">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🐍</span>
                  <span className="text-sm font-medium">Snake</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <SnakeIndicator
                  snakes={snakeStates}
                  playerNames={playerNames}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
