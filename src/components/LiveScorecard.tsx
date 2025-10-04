import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import PressInitiationModal from './press/PressInitiationModal';
import BettingStatusCard from './BettingStatusCard';
import ActivePressBets from './ActivePressBets';
import PlayerSelectionModal from './PlayerSelectionModal';
import type { PressRequest, CourseHole } from '@/types/press';
import { autoResolveBets } from '@/utils/betResolution';

interface LiveScorecardProps {
  tournamentId: string;
  roundId?: string;
  courseHoles?: Array<{ number: number; par: number; yardage: number; handicapIndex: number }>;
}

const LiveScorecard: React.FC<LiveScorecardProps> = ({ 
  tournamentId, 
  roundId,
  courseHoles = Array.from({ length: 18 }, (_, i) => ({ 
    number: i + 1, 
    par: [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4][i] || 4,
    yardage: 400,
    handicapIndex: i + 1
  }))
}) => {
  const { user } = useAuth();
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [pressBets, setPressBets] = useState<any[]>([]);
  const [showPressModal, setShowPressModal] = useState(false);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [betInitiationType, setBetInitiationType] = useState<'press' | 'side-bet'>('press');
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; currentHole: number } | null>(null);
  const [profiles, setProfiles] = useState<Map<string, any>>(new Map());

  const currentHoleData = courseHoles.find(h => h.number === currentHole) || courseHoles[0];
  const currentScore = scores[currentHole];
  const frontNine = courseHoles.slice(0, 9);
  const backNine = courseHoles.slice(9, 18);

  // Fetch current scores and bets
  useEffect(() => {
    if (!roundId) return;
    fetchScores();
    fetchLeaderboard();
    fetchPressBets();

    // Real-time score updates
    const scoresChannel = supabase
      .channel(`round-${roundId}-scores`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hole_scores',
          filter: `round_id=eq.${roundId}`
        },
        () => {
          fetchScores();
          fetchLeaderboard();
        }
      )
      .subscribe();

    // Real-time press bet updates
    const betsChannel = supabase
      .channel(`tournament-${tournamentId}-bets`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'press_bets',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => {
          fetchPressBets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scoresChannel);
      supabase.removeChannel(betsChannel);
    };
  }, [roundId, tournamentId]);

  const fetchScores = async () => {
    if (!roundId) return;
    
    const { data, error } = await supabase
      .from('hole_scores')
      .select('hole_number, strokes')
      .eq('round_id', roundId);

    if (!error && data) {
      const scoresMap: Record<number, number> = {};
      data.forEach(score => {
        scoresMap[score.hole_number] = score.strokes;
      });
      setScores(scoresMap);
    }
  };

  const fetchLeaderboard = async () => {
    // Fetch all participants
    const { data: participants } = await supabase
      .from('tournament_participants')
      .select('id, user_id, handicap')
      .eq('tournament_id', tournamentId)
      .eq('status', 'confirmed');

    if (!participants || participants.length === 0) return;

    // Fetch profiles separately
    const userIds = participants.map(p => p.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, nickname')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    setProfiles(profileMap);

    // Calculate scores for each player
    const leaderboardData = await Promise.all(
      participants.map(async (p) => {
        const profile = profileMap.get(p.user_id);
        const name = profile?.nickname || profile?.first_name || 'Player';

        const { data: rounds } = await supabase
          .from('tournament_rounds')
          .select('round_id')
          .eq('tournament_id', tournamentId)
          .eq('user_id', p.user_id)
          .maybeSingle();

        if (!rounds) {
          return {
            id: p.id,
            userId: p.user_id,
            name,
            thru: 0,
            score: 0,
            toPar: 0
          };
        }

        const { data: holeScores } = await supabase
          .from('hole_scores')
          .select('strokes, hole_number')
          .eq('round_id', rounds.round_id);

        const totalStrokes = holeScores?.reduce((sum, h) => sum + h.strokes, 0) || 0;
        const holesPlayed = holeScores?.length || 0;
        const parForHoles = holeScores?.reduce((sum, h) => {
          const hole = courseHoles.find(ch => ch.number === h.hole_number);
          return sum + (hole?.par || 4);
        }, 0) || 0;

        return {
          id: p.id,
          userId: p.user_id,
          name,
          thru: holesPlayed,
          score: totalStrokes,
          toPar: totalStrokes - parForHoles
        };
      })
    );

    // Sort by score
    const sorted = leaderboardData.sort((a, b) => a.toPar - b.toPar);
    setLeaderboard(sorted);
    
    // Find my position
    const myPos = sorted.findIndex(p => p.userId === user?.id);
    setMyPosition(myPos >= 0 ? myPos + 1 : null);
  };

  const fetchPressBets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('press_bets')
      .select('*')
      .eq('tournament_id', tournamentId)
      .or(`initiator_id.eq.${user.id},target_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPressBets(data);
    }
  };

  const handleOpenPlayerSelection = (type: 'press' | 'side-bet') => {
    setBetInitiationType(type);
    setShowPlayerSelection(true);
  };

  const handleSelectPlayer = (player: { id: string; name: string; currentHole: number }) => {
    setSelectedPlayer(player);
    setShowPressModal(true);
  };

  const handleSubmitPress = async (request: PressRequest) => {
    if (!user || !selectedPlayer) return;

    try {
      const { error } = await supabase
        .from('press_bets')
        .insert({
          tournament_id: tournamentId,
          initiator_id: user.id,
          target_id: request.targetId,
          amount: request.amount,
          bet_type: request.gameType,
          description: request.winCondition,
          hole_number: request.startHole,
          status: 'pending',
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min expiry
        });

      if (error) throw error;

      toast({
        title: "Press sent!",
        description: `${selectedPlayer.name} has 5 minutes to respond`
      });

      setShowPressModal(false);
      setSelectedPlayer(null);
      fetchPressBets();
    } catch (error: any) {
      toast({
        title: "Error sending press",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAcceptBet = async (betId: string) => {
    try {
      const { error } = await supabase
        .from('press_bets')
        .update({ 
          status: 'active',
          completed_at: null
        })
        .eq('id', betId);

      if (error) throw error;

      toast({
        title: "Bet accepted!",
        description: "Good luck!"
      });

      fetchPressBets();
    } catch (error: any) {
      toast({
        title: "Error accepting bet",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeclineBet = async (betId: string) => {
    try {
      const { error } = await supabase
        .from('press_bets')
        .update({ status: 'declined' })
        .eq('id', betId);

      if (error) throw error;

      toast({
        title: "Bet declined"
      });

      fetchPressBets();
    } catch (error: any) {
      toast({
        title: "Error declining bet",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveScore = async (hole: number, strokes: number) => {
    if (!roundId) {
      toast({
        title: "No active round",
        description: "Start a round to enter scores",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Upsert score
      const { error } = await supabase
        .from('hole_scores')
        .upsert({
          round_id: roundId,
          hole_number: hole,
          strokes: strokes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'round_id,hole_number'
        });

      if (error) throw error;

      setScores(prev => ({ ...prev, [hole]: strokes }));
      
      // Auto-advance to next hole
      if (hole < 18) {
        setTimeout(() => setCurrentHole(hole + 1), 300);
      }

      // Auto-resolve bets after score entry
      if (tournamentId) {
        autoResolveBets(tournamentId).then(count => {
          if (count > 0) {
            toast({
              title: "Bets resolved!",
              description: `${count} bet${count > 1 ? 's' : ''} settled`,
            });
            fetchPressBets();
          }
        });
      }

    } catch (error: any) {
      toast({
        title: "Error saving score",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (strokes: number, par: number) => {
    const diff = strokes - par;
    if (diff <= -2) return 'text-blue-600 font-bold'; // Eagle or better
    if (diff === -1) return 'text-red-600 font-semibold'; // Birdie
    if (diff === 0) return 'text-gray-900'; // Par
    if (diff === 1) return 'text-gray-600'; // Bogey
    return 'text-gray-500'; // Double+
  };

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const holesCompleted = Object.keys(scores).length;
  const parSoFar = courseHoles
    .filter(h => scores[h.number])
    .reduce((sum, h) => sum + h.par, 0);
  const toPar = totalScore - parSoFar;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header - Score Summary */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5" />
            <span className="font-medium">Hole {currentHole}</span>
          </div>
          {myPosition && (
            <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
              <TrendingUp className="h-4 w-4" />
              <span>#{myPosition}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{totalScore}</div>
            <div className="text-xs opacity-90">Total</div>
          </div>
          <div>
            <div className={cn("text-2xl font-bold", toPar > 0 ? "text-red-200" : toPar < 0 ? "text-blue-200" : "")}>
              {toPar > 0 ? '+' : ''}{toPar}
            </div>
            <div className="text-xs opacity-90">To Par</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{holesCompleted}</div>
            <div className="text-xs opacity-90">Thru</div>
          </div>
        </div>
      </div>

      {/* Current Hole Info */}
      <div className="bg-card border-b p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentHole(Math.max(1, currentHole - 1))}
            disabled={currentHole === 1}
            className="h-12 w-12"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="text-center flex-1">
            <div className="text-3xl font-bold mb-1">Hole {currentHole}</div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Par {currentHoleData.par}</span>
              <span>•</span>
              <span>{currentHoleData.yardage} yds</span>
              <span>•</span>
              <span>HCP {currentHoleData.handicapIndex}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentHole(Math.min(18, currentHole + 1))}
            disabled={currentHole === 18}
            className="h-12 w-12"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Score Entry Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <div className="text-sm font-medium text-muted-foreground mb-3">Enter Score</div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
              const isSelected = currentScore === score;
              const par = currentHoleData.par;
              
              return (
                <Button
                  key={score}
                  onClick={() => saveScore(currentHole, score)}
                  disabled={saving}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "h-14 text-lg font-semibold transition-all active:scale-95",
                    isSelected && "ring-2 ring-offset-2 ring-primary",
                    !isSelected && score < par && "hover:bg-blue-50 hover:text-blue-600",
                    !isSelected && score === par && "hover:bg-gray-50",
                    !isSelected && score > par && "hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  {score}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Betting Status */}
        {user && pressBets.length > 0 && (
          <div className="mb-6">
            <BettingStatusCard pressBets={pressBets} userId={user.id} />
          </div>
        )}

        {/* Active Press Bets */}
        {user && pressBets.length > 0 && (
          <div className="mb-6">
            <ActivePressBets
              pressBets={pressBets}
              userId={user.id}
              onAccept={handleAcceptBet}
              onDecline={handleDeclineBet}
              profiles={profiles}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-14 flex items-center justify-center gap-2 hover:bg-emerald-50 active:scale-95 transition-transform"
              onClick={() => handleOpenPlayerSelection('press')}
            >
              <DollarSign className="h-5 w-5" />
              <span>Press</span>
            </Button>
            <Button
              variant="outline"
              className="h-14 flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-95 transition-transform"
              onClick={() => handleOpenPlayerSelection('side-bet')}
            >
              <Plus className="h-5 w-5" />
              <span>Side Bet</span>
            </Button>
          </div>
        </div>

        {/* Mini Scorecard */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">Scorecard</div>
          
          {/* Front 9 */}
          <Card className="p-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Front 9</div>
            <div className="grid grid-cols-9 gap-1">
              {frontNine.map((hole) => {
                const score = scores[hole.number];
                return (
                  <button
                    key={hole.number}
                    onClick={() => setCurrentHole(hole.number)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded border text-xs transition-all",
                      currentHole === hole.number && "bg-primary text-primary-foreground border-primary",
                      currentHole !== hole.number && score && "bg-muted",
                      !score && currentHole !== hole.number && "border-dashed"
                    )}
                  >
                    <div className="text-[10px] opacity-70">{hole.number}</div>
                    <div className={cn("font-semibold", score && getScoreColor(score, hole.par))}>
                      {score || '-'}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Back 9 */}
          <Card className="p-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Back 9</div>
            <div className="grid grid-cols-9 gap-1">
              {backNine.map((hole) => {
                const score = scores[hole.number];
                return (
                  <button
                    key={hole.number}
                    onClick={() => setCurrentHole(hole.number)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded border text-xs transition-all",
                      currentHole === hole.number && "bg-primary text-primary-foreground border-primary",
                      currentHole !== hole.number && score && "bg-muted",
                      !score && currentHole !== hole.number && "border-dashed"
                    )}
                  >
                    <div className="text-[10px] opacity-70">{hole.number}</div>
                    <div className={cn("font-semibold", score && getScoreColor(score, hole.par))}>
                      {score || '-'}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Mini Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-medium text-muted-foreground mb-3">Leaderboard</div>
            <Card className="divide-y">
              {leaderboard.slice(0, 5).map((player, idx) => (
                <div
                  key={player.id}
                  className={cn(
                    "flex items-center justify-between p-3",
                    player.userId === user?.id && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-muted-foreground w-6">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Thru {player.thru}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-bold",
                      player.toPar < 0 && "text-blue-600",
                      player.toPar > 0 && "text-red-600"
                    )}>
                      {player.toPar > 0 ? '+' : ''}{player.toPar}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {player.score}
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        isOpen={showPlayerSelection}
        onClose={() => setShowPlayerSelection(false)}
        players={leaderboard.filter(p => p.userId !== user?.id).map(p => ({
          id: p.userId,
          name: p.name,
          handicap: profiles.get(p.userId)?.handicap,
          currentHole: Math.min(p.thru + 1, 18),
          thru: p.thru,
          toPar: p.toPar
        }))}
        onSelectPlayer={handleSelectPlayer}
        title={betInitiationType === 'press' ? 'Select Player for Press' : 'Select Player for Side Bet'}
      />

      {/* Press Initiation Modal */}
      {selectedPlayer && (
        <PressInitiationModal
          isOpen={showPressModal}
          onClose={() => {
            setShowPressModal(false);
            setSelectedPlayer(null);
          }}
          targetPlayer={selectedPlayer}
          currentHole={currentHole}
          courseHoles={courseHoles.map(h => ({
            number: h.number,
            par: h.par,
            yardage: h.yardage,
            handicapIndex: h.handicapIndex
          }))}
          onSubmit={handleSubmitPress}
        />
      )}
    </div>
  );
};

export default LiveScorecard;
