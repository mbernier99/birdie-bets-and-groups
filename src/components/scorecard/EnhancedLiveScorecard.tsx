import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Activity, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { autoResolveBets } from '@/utils/betResolution';
import { calculateHoleGames, type GameNotification } from '@/utils/gameCalculationOrchestrator';
import { HoleMiniMap } from './HoleMiniMap';
import { InlineBettingPanel } from '../betting/InlineBettingPanel';
import { QuickReactions } from '../social/QuickReactions';
import { LiveGameStatus } from './LiveGameStatus';
import { HoleCompletionModal } from './HoleCompletionModal';
import { SnakeTrackingPrompt } from './SnakeTrackingPrompt';
import { AdminPlayerSelector } from './AdminPlayerSelector';
import PressInitiationModal from '../press/PressInitiationModal';
import PlayerSelectionModal from '../PlayerSelectionModal';
import type { PressRequest } from '@/types/press';

interface EnhancedLiveScorecardProps {
  tournamentId: string;
  roundId?: string;
  courseHoles?: Array<{ number: number; par: number; yardage: number; handicapIndex: number }>;
}

export const EnhancedLiveScorecard: React.FC<EnhancedLiveScorecardProps> = ({
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
  const [pressBets, setPressBets] = useState<any[]>([]);
  const [showPressModal, setShowPressModal] = useState(false);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; currentHole: number } | null>(null);
  const [profiles, setProfiles] = useState<Map<string, any>>(new Map());
  const [viewMode, setViewMode] = useState<'focus' | 'overview'>('focus');
  const [tournamentSettings, setTournamentSettings] = useState<any>(null);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSnakePrompt, setShowSnakePrompt] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [playerNames, setPlayerNames] = useState<Map<string, string>>(new Map());
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);

  const currentHoleData = courseHoles.find(h => h.number === currentHole) || courseHoles[0];
  const currentScore = scores[currentHole];
  const completedHoles = Object.keys(scores).map(Number);

  useEffect(() => {
    fetchPressBets();
    fetchTournamentSettings();
    fetchParticipants();
    
    // Set initial selected player to current user
    if (user && !selectedPlayerId) {
      setSelectedPlayerId(user.id);
    }
  }, [tournamentId, user]);

  // Separate effect for handling player selection and round fetching
  useEffect(() => {
    if (!selectedPlayerId || !tournamentId) return;

    const loadRoundForPlayer = async () => {
      // Check if player has a round for this tournament
      const { data: existingTournamentRound } = await supabase
        .from('tournament_rounds')
        .select('round_id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', selectedPlayerId)
        .maybeSingle();

      if (existingTournamentRound) {
        setActiveRoundId(existingTournamentRound.round_id);
        return;
      }

      // If admin is selecting a player who doesn't have a round yet, create one
      if (isAdmin && selectedPlayerId !== user?.id) {
        const newRoundId = await createRoundForPlayer(selectedPlayerId);
        if (newRoundId) {
          setActiveRoundId(newRoundId);
        }
      } else if (roundId) {
        setActiveRoundId(roundId);
      }
    };

    loadRoundForPlayer();
  }, [selectedPlayerId, tournamentId, isAdmin, user, roundId]);

  // Effect for real-time score updates
  useEffect(() => {
    if (!activeRoundId) return;

    fetchScoresForRound(activeRoundId);

    const scoresChannel = supabase
      .channel(`round-${activeRoundId}-scores`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hole_scores', filter: `round_id=eq.${activeRoundId}` }, () => fetchScoresForRound(activeRoundId))
      .subscribe();

    return () => {
      supabase.removeChannel(scoresChannel);
    };
  }, [activeRoundId]);

  // Effect for bets
  useEffect(() => {
    if (!tournamentId) return;

    fetchPressBets();

    const betsChannel = supabase
      .channel(`tournament-${tournamentId}-bets`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'press_bets', filter: `tournament_id=eq.${tournamentId}` }, () => fetchPressBets())
      .subscribe();

    return () => {
      supabase.removeChannel(betsChannel);
    };
  }, [tournamentId]);

  const fetchScoresForRound = async (rId: string) => {
    const { data } = await supabase.from('hole_scores').select('hole_number, strokes').eq('round_id', rId);
    if (data) {
      const scoresMap: Record<number, number> = {};
      data.forEach(score => { scoresMap[score.hole_number] = score.strokes; });
      setScores(scoresMap);
    }
  };

  const createRoundForPlayer = async (playerId: string) => {
    try {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('course_id')
        .eq('id', tournamentId)
        .single();

      const { data: newRound, error: roundError } = await supabase
        .from('rounds')
        .insert({
          user_id: playerId,
          course_id: tournament?.course_id || null,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (roundError) throw roundError;

      const { error: linkError } = await supabase
        .from('tournament_rounds')
        .insert({
          tournament_id: tournamentId,
          round_id: newRound.id,
          user_id: playerId
        });

      if (linkError) throw linkError;

      return newRound.id;
    } catch (error: any) {
      console.error('Error creating round:', error);
      toast({ title: "Error creating round", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const fetchPressBets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('press_bets')
      .select('*')
      .eq('tournament_id', tournamentId)
      .or(`initiator_id.eq.${user.id},target_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    if (data) setPressBets(data);
  };

  const fetchTournamentSettings = async () => {
    const { data } = await supabase
      .from('tournaments')
      .select('settings, created_by')
      .eq('id', tournamentId)
      .single();
    
    if (data) {
      setTournamentSettings(data.settings);
      setIsAdmin(user?.id === data.created_by);
    }
  };

  const fetchParticipants = async () => {
    const { data } = await supabase
      .from('tournament_participants')
      .select('user_id, status, profiles!inner(first_name, last_name, nickname, email)')
      .eq('tournament_id', tournamentId);
    
    if (data) {
      setParticipants(data);
      const namesMap = new Map(
        data.map(p => [
          p.user_id,
          (p.profiles as any).nickname || (p.profiles as any).first_name || 'Player'
        ])
      );
      setPlayerNames(namesMap);
    }
  };

  const saveScore = async (hole: number, strokes: number) => {
    const currentRoundId = activeRoundId || roundId;
    
    if (!currentRoundId) {
      toast({ title: "No active round", description: "Start a round to enter scores", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await supabase.from('hole_scores').upsert({
        round_id: currentRoundId,
        hole_number: hole,
        strokes: strokes,
        updated_at: new Date().toISOString()
      }, { onConflict: 'round_id,hole_number' });

      setScores(prev => ({ ...prev, [hole]: strokes }));
      
      const playerName = playerNames.get(selectedPlayerId || user?.id || '') || 'Player';
      const isSelf = selectedPlayerId === user?.id;
      
      toast({ 
        title: isSelf ? "Score saved!" : `Score saved for ${playerName}`, 
        description: `Hole ${hole}: ${strokes} strokes` 
      });

      // Calculate all game results for this hole
      if (tournamentSettings) {
        const results = await calculateHoleGames(tournamentId, hole);
        
        if (results.notifications.length > 0) {
          setNotifications(results.notifications);
          setShowNotificationModal(true);
        }

        // Show snake prompt if enabled and user is admin
        if (isAdmin && tournamentSettings.sideGames?.includes('snake')) {
          setTimeout(() => setShowSnakePrompt(true), 1000);
        }
      }
      
      if (hole < 18) setTimeout(() => setCurrentHole(hole + 1), 300);

      if (tournamentId) {
        autoResolveBets(tournamentId).then(result => {
          const total = result.resolvedCount + result.pushedCount;
          if (total > 0) {
            toast({ title: "Bets resolved!", description: `${result.resolvedCount} won, ${result.pushedCount} pushed` });
            fetchPressBets();
          }
        });
      }
    } catch (error: any) {
      toast({ title: "Error saving score", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPlayerSelection = () => setShowPlayerSelection(true);
  const handleSelectPlayer = (player: { id: string; name: string; currentHole: number }) => {
    setSelectedPlayer(player);
    setShowPressModal(true);
  };

  const handleSubmitPress = async (request: PressRequest) => {
    if (!user || !selectedPlayer) return;
    try {
      await supabase.from('press_bets').insert({
        tournament_id: tournamentId,
        initiator_id: user.id,
        target_id: request.targetId,
        amount: request.amount,
        bet_type: request.gameType,
        description: request.winCondition,
        hole_number: request.startHole,
        status: 'pending',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });
      toast({ title: "Press sent!", description: `${selectedPlayer.name} has 5 minutes to respond` });
      setShowPressModal(false);
      setSelectedPlayer(null);
      fetchPressBets();
    } catch (error: any) {
      toast({ title: "Error sending press", description: error.message, variant: "destructive" });
    }
  };

  const handleAcceptBet = async (betId: string) => {
    await supabase.from('press_bets').update({ status: 'active' }).eq('id', betId);
    toast({ title: "Bet accepted!" });
    fetchPressBets();
  };

  const handleDeclineBet = async (betId: string) => {
    await supabase.from('press_bets').update({ status: 'declined' }).eq('id', betId);
    toast({ title: "Bet declined" });
    fetchPressBets();
  };

  const handleSendReaction = (emoji: string, message: string) => {
    toast({ title: `${emoji} ${message}`, description: "Reaction sent to group" });
  };

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);
  const parSoFar = courseHoles.filter(h => scores[h.number]).reduce((sum, h) => sum + h.par, 0);
  const toPar = totalScore - parSoFar;

  return (
    <div className="space-y-4">
      {/* Admin Player Selector */}
      {isAdmin && user && participants.length > 0 && (
        <AdminPlayerSelector
          participants={participants}
          selectedPlayerId={selectedPlayerId || user.id}
          onSelectPlayer={setSelectedPlayerId}
          currentUserId={user.id}
        />
      )}

      {/* View Mode Selector */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="focus">Focus Mode</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Focus Mode */}
        <TabsContent value="focus" className="space-y-4">
          {/* Score Summary Header */}
          <Card className="p-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">{totalScore}</div>
                <div className="text-xs opacity-90">Total</div>
              </div>
              <div>
                <div className={cn("text-3xl font-bold", toPar > 0 && "opacity-80", toPar < 0 && "opacity-100")}>
                  {toPar > 0 ? '+' : ''}{toPar}
                </div>
                <div className="text-xs opacity-90">To Par</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{completedHoles.length}</div>
                <div className="text-xs opacity-90">Thru</div>
              </div>
            </div>
          </Card>

          {/* Current Hole */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentHole(Math.max(1, currentHole - 1))} disabled={currentHole === 1}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="text-center flex-1">
                <div className="text-4xl font-bold mb-1">Hole {currentHole}</div>
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <span>Par {currentHoleData.par}</span>
                  <span>•</span>
                  <span>{currentHoleData.yardage} yds</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCurrentHole(Math.min(18, currentHole + 1))} disabled={currentHole === 18}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Score Entry */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Enter Score</div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const isSelected = currentScore === score;
                  const par = currentHoleData.par;
                  const diff = score - par;
                  
                  return (
                    <Button
                      key={score}
                      onClick={() => saveScore(currentHole, score)}
                      disabled={saving}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "h-16 text-xl font-bold transition-all active:scale-95",
                        isSelected && "ring-2 ring-offset-2 ring-primary",
                        !isSelected && diff <= -2 && "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300",
                        !isSelected && diff === -1 && "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300",
                        !isSelected && diff === 0 && "hover:bg-gray-50",
                        !isSelected && diff === 1 && "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300",
                        !isSelected && diff >= 2 && "hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      )}
                    >
                      {score}
                    </Button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Live Game Status */}
          {tournamentSettings && (
            <LiveGameStatus
              tournamentId={tournamentId}
              currentHole={currentHole}
              settings={tournamentSettings}
              playerNames={playerNames}
            />
          )}

          {/* Inline Betting Panel */}
          {user && (
            <InlineBettingPanel
              pressBets={pressBets}
              userId={user.id}
              onAccept={handleAcceptBet}
              onDecline={handleDeclineBet}
              onInitiateBet={handleOpenPlayerSelection}
              profiles={profiles}
            />
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12">
              <MapPin className="h-4 w-4 mr-2" />
              GPS Location
            </Button>
            <Button variant="outline" className="h-12">
              <Activity className="h-4 w-4 mr-2" />
              Stats
            </Button>
          </div>

          {/* Quick Reactions */}
          <QuickReactions onSendReaction={handleSendReaction} />
        </TabsContent>

        {/* Overview Mode */}
        <TabsContent value="overview" className="space-y-4">
          <HoleMiniMap
            currentHole={currentHole}
            completedHoles={completedHoles}
            onSelectHole={setCurrentHole}
          />

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Scorecard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Hole</th>
                    {courseHoles.slice(0, 9).map(h => (
                      <th key={h.number} className="text-center p-2">{h.number}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">Par</td>
                    {courseHoles.slice(0, 9).map(h => (
                      <td key={h.number} className="text-center p-2">{h.par}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Score</td>
                    {courseHoles.slice(0, 9).map(h => (
                      <td key={h.number} className="text-center p-2">
                        {scores[h.number] ? (
                          <span className={cn(
                            "font-bold",
                            scores[h.number] < h.par && "text-emerald-600",
                            scores[h.number] > h.par && "text-red-600"
                          )}>
                            {scores[h.number]}
                          </span>
                        ) : '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PlayerSelectionModal
        isOpen={showPlayerSelection}
        onClose={() => setShowPlayerSelection(false)}
        onSelectPlayer={handleSelectPlayer}
        players={[]}
      />
      <PressInitiationModal
        isOpen={showPressModal}
        onClose={() => setShowPressModal(false)}
        onSubmit={handleSubmitPress}
        targetPlayer={selectedPlayer}
        currentHole={currentHole}
        courseHoles={courseHoles}
      />
      
      {/* Hole Completion Notifications */}
      {user && (
        <HoleCompletionModal
          open={showNotificationModal}
          onOpenChange={setShowNotificationModal}
          notifications={notifications}
          currentUserId={user.id}
        />
      )}

      {/* Snake Tracking Prompt (Admin Only) */}
      {isAdmin && (
        <SnakeTrackingPrompt
          open={showSnakePrompt}
          onOpenChange={setShowSnakePrompt}
          tournamentId={tournamentId}
          holeNumber={currentHole}
          players={Array.from(playerNames.entries()).map(([id, name]) => ({
            id,
            name,
            putts: scores[currentHole] // Would need actual putt data
          }))}
          onComplete={() => {
            setShowSnakePrompt(false);
            // Refresh game status
          }}
        />
      )}
    </div>
  );
};
