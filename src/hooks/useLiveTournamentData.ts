import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlayerScore {
  id: string;
  userId: string;
  name: string;
  thru: number;
  score: number;
  toPar: number;
  currentHole: number;
  trend: 'up' | 'down' | 'steady';
}

export interface ActiveBet {
  id: string;
  initiatorId: string;
  targetId: string;
  amount: number;
  type: string;
  holeNumber: number;
  status: string;
  description?: string;
}

export const useLiveTournamentData = (tournamentId: string, userId: string) => {
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [activeBets, setActiveBets] = useState<ActiveBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any[]>([]);

  useEffect(() => {
    if (!tournamentId) return;
    
    fetchTournamentData();
    
    // Real-time updates
    const scoresChannel = supabase
      .channel(`live-tournament-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hole_scores'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'press_bets',
          filter: `tournament_id=eq.${tournamentId}`
        },
        () => {
          fetchActiveBets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scoresChannel);
    };
  }, [tournamentId, userId]);

  const fetchTournamentData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCourseData(),
      fetchLeaderboard(),
      fetchActiveBets()
    ]);
    setLoading(false);
  };

  const fetchCourseData = async () => {
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('course_id, courses(holes)')
      .eq('id', tournamentId)
      .single();

    if (tournament?.courses?.holes && Array.isArray(tournament.courses.holes)) {
      setCourseData(tournament.courses.holes);
    }
  };

  const fetchLeaderboard = async () => {
    const { data: participants } = await supabase
      .from('tournament_participants')
      .select('id, user_id, handicap')
      .eq('tournament_id', tournamentId)
      .eq('status', 'confirmed');

    if (!participants) return;

    const userIds = participants.map(p => p.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, nickname')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

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
            toPar: 0,
            currentHole: 1,
            trend: 'steady' as const
          };
        }

        const { data: holeScores } = await supabase
          .from('hole_scores')
          .select('strokes, hole_number')
          .eq('round_id', rounds.round_id)
          .order('hole_number', { ascending: false });

        const totalStrokes = holeScores?.reduce((sum, h) => sum + h.strokes, 0) || 0;
        const holesPlayed = holeScores?.length || 0;
        const currentHole = holesPlayed > 0 ? Math.min(holeScores[0].hole_number + 1, 18) : 1;
        
        const parForHoles = holeScores?.reduce((sum, h) => {
          return sum + 4; // Simplified, use actual par from courseHoles
        }, 0) || 0;

        return {
          id: p.id,
          userId: p.user_id,
          name,
          thru: holesPlayed,
          score: totalStrokes,
          toPar: totalStrokes - parForHoles,
          currentHole,
          trend: 'steady' as const
        };
      })
    );

    const sorted = leaderboardData.sort((a, b) => a.toPar - b.toPar);
    
    // Add trends
    const withTrends = sorted.map((player, index) => {
      const prevIndex = leaderboard.findIndex(p => p.userId === player.userId);
      let trend: 'up' | 'down' | 'steady' = 'steady';
      if (prevIndex !== -1) {
        if (index < prevIndex) trend = 'up';
        else if (index > prevIndex) trend = 'down';
      }
      return { ...player, trend };
    });

    setLeaderboard(withTrends);
    
    const myPos = withTrends.findIndex(p => p.userId === userId);
    setMyPosition(myPos >= 0 ? myPos + 1 : null);
  };

  const fetchActiveBets = async () => {
    const { data, error } = await supabase
      .from('press_bets')
      .select('*')
      .eq('tournament_id', tournamentId)
      .or(`initiator_id.eq.${userId},target_id.eq.${userId}`)
      .in('status', ['pending', 'active', 'accepted'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActiveBets(data.map(bet => ({
        id: bet.id,
        initiatorId: bet.initiator_id,
        targetId: bet.target_id,
        amount: parseFloat(String(bet.amount)),
        type: bet.bet_type,
        holeNumber: bet.hole_number || 0,
        status: bet.status,
        description: bet.description
      })));
    }
  };

  return {
    leaderboard,
    myPosition,
    activeBets,
    loading,
    courseHoles: courseData,
    refreshData: fetchTournamentData
  };
};
