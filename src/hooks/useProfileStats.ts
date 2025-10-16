import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileStats {
  totalWinnings: number;
  totalLosses: number;
  netWinnings: number;
  tournamentsPlayed: number;
  tournamentsHosted: number;
  winRate: number;
  recentRounds: Array<{
    id: string;
    started_at: string;
    total_score: number | null;
    course_name: string | null;
  }>;
  biggestWin: number;
  activeBets: number;
}

export const useProfileStats = (userId?: string) => {
  const [stats, setStats] = useState<ProfileStats>({
    totalWinnings: 0,
    totalLosses: 0,
    netWinnings: 0,
    tournamentsPlayed: 0,
    tournamentsHosted: 0,
    winRate: 0,
    recentRounds: [],
    biggestWin: 0,
    activeBets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch betting stats
      const { data: bets, error: betsError } = await supabase
        .from('press_bets')
        .select('*')
        .or(`initiator_id.eq.${userId},target_id.eq.${userId}`);

      if (betsError) throw betsError;

      let totalWinnings = 0;
      let totalLosses = 0;
      let biggestWin = 0;
      let activeBets = 0;

      bets?.forEach(bet => {
        if (bet.status === 'completed' && bet.winner_id) {
          const amount = Number(bet.amount);
          if (bet.winner_id === userId) {
            totalWinnings += amount;
            if (amount > biggestWin) biggestWin = amount;
          } else {
            totalLosses += amount;
          }
        } else if (bet.status === 'pending' || bet.status === 'active') {
          activeBets++;
        }
      });

      // Fetch tournament stats
      const { data: participants, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('tournament_id, tournaments!inner(created_by, status)')
        .eq('user_id', userId);

      if (participantsError) throw participantsError;

      const tournamentsPlayed = participants?.length || 0;
      const tournamentsHosted = participants?.filter(
        (p: any) => p.tournaments.created_by === userId
      ).length || 0;

      const completedTournaments = participants?.filter(
        (p: any) => p.tournaments.status === 'completed'
      ).length || 0;

      // Calculate win rate (tournaments with positive winnings)
      const wonTournaments = bets?.filter(
        bet => bet.status === 'completed' && bet.winner_id === userId
      ).length || 0;
      const winRate = completedTournaments > 0 
        ? Math.round((wonTournaments / completedTournaments) * 100) 
        : 0;

      // Fetch recent rounds
      const { data: rounds, error: roundsError } = await supabase
        .from('rounds')
        .select('id, started_at, total_score, courses(name)')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(5);

      if (roundsError) throw roundsError;

      const recentRounds = rounds?.map(round => ({
        id: round.id,
        started_at: round.started_at,
        total_score: round.total_score,
        course_name: (round.courses as any)?.name || null,
      })) || [];

      setStats({
        totalWinnings,
        totalLosses,
        netWinnings: totalWinnings - totalLosses,
        tournamentsPlayed,
        tournamentsHosted,
        winRate,
        recentRounds,
        biggestWin,
        activeBets,
      });
    } catch (err) {
      console.error('Error fetching profile stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return { stats, loading, error, refetch: fetchStats };
};
