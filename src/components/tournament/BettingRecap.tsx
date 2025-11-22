import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, TrendingDown, Award, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BettingRecapProps {
  tournamentId: string;
}

interface PlayerScore {
  userId: string;
  playerName: string;
  holes: { [holeNumber: number]: number };
  totalScore: number;
}

interface BetOutcome {
  type: string;
  description: string;
  amount: number;
  winnerId: string | null;
  winnerName: string | null;
  holeNumber?: number;
}

export const BettingRecap: React.FC<BettingRecapProps> = ({ tournamentId }) => {
  const [loading, setLoading] = useState(true);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [betOutcomes, setBetOutcomes] = useState<BetOutcome[]>([]);
  const [playerSettlements, setPlayerSettlements] = useState<{ [userId: string]: number }>({});

  useEffect(() => {
    fetchRecapData();
  }, [tournamentId]);

  const fetchRecapData = async () => {
    try {
      setLoading(true);

      // Fetch all participants
      const { data: participants, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('user_id')
        .eq('tournament_id', tournamentId);

      if (participantsError) throw participantsError;

      // Fetch profiles separately
      const userIds = participants?.map(p => p.user_id) || [];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, nickname, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create profiles map
      const profilesMap: { [userId: string]: any } = {};
      profiles?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });

      // Fetch all tournament rounds
      const { data: tournamentRounds, error: roundsError } = await supabase
        .from('tournament_rounds')
        .select('round_id, user_id')
        .eq('tournament_id', tournamentId);

      if (roundsError) throw roundsError;

      // Fetch all hole scores for these rounds
      const roundIds = tournamentRounds?.map(tr => tr.round_id) || [];
      const { data: holeScores, error: scoresError } = await supabase
        .from('hole_scores')
        .select('*')
        .in('round_id', roundIds)
        .order('hole_number');

      if (scoresError) throw scoresError;

      // Build player scores data structure
      const scoresMap: { [userId: string]: PlayerScore } = {};
      
      participants?.forEach(p => {
        const profile = profilesMap[p.user_id];
        const playerName = profile?.nickname || 
          (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : null) ||
          profile?.email?.split('@')[0] || 'Unknown';

        scoresMap[p.user_id] = {
          userId: p.user_id,
          playerName,
          holes: {},
          totalScore: 0
        };
      });

      // Map scores to players
      holeScores?.forEach(score => {
        const round = tournamentRounds?.find(tr => tr.round_id === score.round_id);
        if (round && scoresMap[round.user_id]) {
          scoresMap[round.user_id].holes[score.hole_number] = score.strokes;
          scoresMap[round.user_id].totalScore += score.strokes;
        }
      });

      setPlayerScores(Object.values(scoresMap));

      // Fetch all betting data
      await fetchBettingOutcomes(participants, profilesMap);

    } catch (error: any) {
      console.error('Error fetching recap data:', error);
      toast({
        title: "Error loading recap",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBettingOutcomes = async (participants: any[], profilesMap: { [userId: string]: any }) => {
    const outcomes: BetOutcome[] = [];
    const settlements: { [userId: string]: number } = {};

    // Initialize settlements
    participants?.forEach(p => {
      settlements[p.user_id] = 0;
    });

    // Fetch press bets
    const { data: pressBets } = await supabase
      .from('press_bets')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('status', 'completed');

    pressBets?.forEach(bet => {
      const winnerProfile = profilesMap[bet.winner_id || ''];
      const winnerName = winnerProfile?.nickname || 
        (winnerProfile?.first_name ? `${winnerProfile.first_name} ${winnerProfile.last_name}` : null) ||
        'Unknown';

      outcomes.push({
        type: 'Press Bet',
        description: bet.description || bet.bet_type,
        amount: bet.amount,
        winnerId: bet.winner_id,
        winnerName,
        holeNumber: bet.hole_number || undefined
      });

      if (bet.winner_id) {
        settlements[bet.winner_id] = (settlements[bet.winner_id] || 0) + bet.amount;
        settlements[bet.initiator_id] = (settlements[bet.initiator_id] || 0) - bet.amount;
      }
    });

    // Fetch skins results
    const { data: skins } = await supabase
      .from('skins_tracking')
      .select('*')
      .eq('tournament_id', tournamentId)
      .not('winner_id', 'is', null);

    skins?.forEach(skin => {
      const winnerProfile = profilesMap[skin.winner_id || ''];
      const winnerName = winnerProfile?.nickname || 
        (winnerProfile?.first_name ? `${winnerProfile.first_name} ${winnerProfile.last_name}` : null) ||
        'Unknown';

      outcomes.push({
        type: 'Skins',
        description: `Hole ${skin.hole_number} Skin`,
        amount: skin.pot_amount,
        winnerId: skin.winner_id,
        winnerName,
        holeNumber: skin.hole_number
      });

      if (skin.winner_id) {
        settlements[skin.winner_id] = (settlements[skin.winner_id] || 0) + skin.pot_amount;
        // Distribute loss among other players
        const losersCount = participants.length - 1;
        const lossPerPlayer = skin.pot_amount / losersCount;
        participants?.forEach(p => {
          if (p.user_id !== skin.winner_id) {
            settlements[p.user_id] = (settlements[p.user_id] || 0) - lossPerPlayer;
          }
        });
      }
    });

    // Fetch snake tracking
    const { data: snakes } = await supabase
      .from('snake_tracking')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('is_final', true);

    snakes?.forEach(snake => {
      const holderProfile = profilesMap[snake.current_holder_id || ''];
      const holderName = holderProfile?.nickname || 
        (holderProfile?.first_name ? `${holderProfile.first_name} ${holderProfile.last_name}` : null) ||
        'Unknown';

      outcomes.push({
        type: 'Snake',
        description: `${snake.snake_type} Snake`,
        amount: snake.amount,
        winnerId: snake.current_holder_id,
        winnerName: holderName,
        holeNumber: snake.last_hole_updated || undefined
      });

      if (snake.current_holder_id) {
        settlements[snake.current_holder_id] = (settlements[snake.current_holder_id] || 0) - snake.amount;
        const winnersCount = participants.length - 1;
        const winPerPlayer = snake.amount / winnersCount;
        participants?.forEach(p => {
          if (p.user_id !== snake.current_holder_id) {
            settlements[p.user_id] = (settlements[p.user_id] || 0) + winPerPlayer;
          }
        });
      }
    });

    // Fetch side game results
    const { data: sideGames } = await supabase
      .from('side_game_results')
      .select('*')
      .eq('tournament_id', tournamentId);

    sideGames?.forEach(game => {
      const winnerProfile = profilesMap[game.winner_id || ''];
      const winnerName = winnerProfile?.nickname || 
        (winnerProfile?.first_name ? `${winnerProfile.first_name} ${winnerProfile.last_name}` : null) ||
        'Unknown';

      outcomes.push({
        type: game.game_type,
        description: `Hole ${game.hole_number}`,
        amount: game.amount,
        winnerId: game.winner_id,
        winnerName,
        holeNumber: game.hole_number
      });

      if (game.winner_id) {
        settlements[game.winner_id] = (settlements[game.winner_id] || 0) + game.amount;
      }
    });

    setBetOutcomes(outcomes);
    setPlayerSettlements(settlements);
  };

  const filterByHoles = (start: number, end: number) => {
    return betOutcomes.filter(bet => {
      if (!bet.holeNumber) return true; // Include bets without specific holes
      return bet.holeNumber >= start && bet.holeNumber <= end;
    });
  };

  const calculateTotalForRange = (start: number, end: number) => {
    const filtered = filterByHoles(start, end);
    return filtered.reduce((sum, bet) => sum + bet.amount, 0);
  };

  const renderScorecard = (start: number, end: number) => {
    const holes = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Player</TableHead>
              {holes.map(hole => (
                <TableHead key={hole} className="text-center min-w-12">{hole}</TableHead>
              ))}
              <TableHead className="text-center font-semibold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playerScores.map(player => {
              const rangeTotal = holes.reduce((sum, hole) => sum + (player.holes[hole] || 0), 0);
              return (
                <TableRow key={player.userId}>
                  <TableCell className="font-medium">{player.playerName}</TableCell>
                  {holes.map(hole => (
                    <TableCell key={hole} className="text-center">
                      {player.holes[hole] || '-'}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-semibold">{rangeTotal}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderBetOutcomes = (start: number, end: number) => {
    const filtered = filterByHoles(start, end);

    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No bets or wagers for this range
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filtered.map((bet, idx) => (
          <Card key={idx} className="border-l-4" style={{ borderLeftColor: bet.winnerId ? 'hsl(var(--success))' : 'hsl(var(--muted))' }}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{bet.type}</Badge>
                    {bet.holeNumber && (
                      <span className="text-sm text-muted-foreground">Hole {bet.holeNumber}</span>
                    )}
                  </div>
                  <p className="text-sm mt-1">{bet.description}</p>
                  {bet.winnerName && (
                    <p className="text-sm font-medium text-success mt-1 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Winner: {bet.winnerName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">
                    ${bet.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderSettlements = () => {
    const sortedPlayers = playerScores
      .map(player => ({
        ...player,
        settlement: playerSettlements[player.userId] || 0
      }))
      .sort((a, b) => b.settlement - a.settlement);

    return (
      <div className="space-y-3">
        {sortedPlayers.map(player => {
          const settlement = player.settlement;
          const isPositive = settlement > 0;
          const isNegative = settlement < 0;

          return (
            <Card key={player.userId} className={
              isPositive ? "border-l-4 border-l-success" : 
              isNegative ? "border-l-4 border-l-destructive" : ""
            }>
              <CardContent className="py-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      isPositive ? "bg-success/10" : 
                      isNegative ? "bg-destructive/10" : "bg-muted"
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : isNegative ? (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      ) : (
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {isPositive ? "Winning" : isNegative ? "Losing" : "Even"}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    isPositive ? "text-success" : 
                    isNegative ? "text-destructive" : ""
                  }`}>
                    {isPositive ? "+" : ""}{settlement.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading betting recap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Betting Recap</h2>
          <p className="text-muted-foreground">Complete breakdown of scores, bets, and settlements</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Users className="h-4 w-4 mr-2" />
          {playerScores.length} Players
        </Badge>
      </div>

      {/* Overall Settlements Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Final Settlements
          </CardTitle>
          <CardDescription>Net winnings/losses for all players</CardDescription>
        </CardHeader>
        <CardContent>
          {renderSettlements()}
        </CardContent>
      </Card>

      <Tabs defaultValue="full" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="front9">Front 9</TabsTrigger>
          <TabsTrigger value="back9">Back 9</TabsTrigger>
          <TabsTrigger value="full">Full Round</TabsTrigger>
        </TabsList>

        <TabsContent value="front9" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Front 9 Scorecard</CardTitle>
              <CardDescription>Holes 1-9</CardDescription>
            </CardHeader>
            <CardContent>
              {renderScorecard(1, 9)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Front 9 Bet Outcomes</CardTitle>
              <CardDescription>
                Total wagered: ${calculateTotalForRange(1, 9).toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderBetOutcomes(1, 9)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="back9" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Back 9 Scorecard</CardTitle>
              <CardDescription>Holes 10-18</CardDescription>
            </CardHeader>
            <CardContent>
              {renderScorecard(10, 18)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Back 9 Bet Outcomes</CardTitle>
              <CardDescription>
                Total wagered: ${calculateTotalForRange(10, 18).toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderBetOutcomes(10, 18)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Full Round Scorecard</CardTitle>
              <CardDescription>All 18 holes</CardDescription>
            </CardHeader>
            <CardContent>
              {renderScorecard(1, 18)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Bet Outcomes</CardTitle>
              <CardDescription>
                Total wagered: ${betOutcomes.reduce((sum, bet) => sum + bet.amount, 0).toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderBetOutcomes(1, 18)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
