
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { MOCK_MODE, getMockPressBetsForTournament, getCurrentMockUser } from '@/utils/mockData';
import { usePress as useRealPress } from './usePress';

export const useMockPress = (tournamentId?: string) => {
  const realPress = useRealPress(tournamentId);
  const [mockPressBets, setMockPressBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (MOCK_MODE && tournamentId) {
      setLoading(true);
      setTimeout(() => {
        const bets = getMockPressBetsForTournament(tournamentId);
        setMockPressBets(bets);
        setLoading(false);
      }, 300);
    }
  }, [tournamentId]);

  const createPressBet = async (betData: any) => {
    if (MOCK_MODE) {
      const currentUser = getCurrentMockUser();
      const newBet = {
        ...betData,
        id: `bet_${Date.now()}`,
        tournament_id: tournamentId,
        initiator_id: currentUser.id,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      setMockPressBets(prev => [newBet, ...prev]);
      
      toast({
        title: "Press bet created!",
        description: `${betData.description || 'Press bet'} has been created (mock mode).`
      });
      
      return newBet;
    }
    return realPress.createPressBet(betData);
  };

  const acceptPressBet = async (betId: string) => {
    if (MOCK_MODE) {
      setMockPressBets(prev => 
        prev.map(bet => bet.id === betId ? { ...bet, status: 'accepted' } : bet)
      );
      
      toast({
        title: "Press bet accepted!",
        description: "The press bet has been accepted (mock mode)."
      });
      
      return;
    }
    return realPress.acceptPressBet(betId);
  };

  const declinePressBet = async (betId: string) => {
    if (MOCK_MODE) {
      setMockPressBets(prev => 
        prev.map(bet => bet.id === betId ? { ...bet, status: 'declined' } : bet)
      );
      
      toast({
        title: "Press bet declined",
        description: "The press bet has been declined (mock mode)."
      });
      
      return;
    }
    return realPress.declinePressBet(betId);
  };

  const resolvePressBet = async (betId: string, winnerId: string) => {
    if (MOCK_MODE) {
      setMockPressBets(prev => 
        prev.map(bet => bet.id === betId ? { 
          ...bet, 
          status: 'completed',
          winner_id: winnerId,
          completed_at: new Date().toISOString()
        } : bet)
      );
      
      toast({
        title: "Press bet resolved!",
        description: "The press bet has been resolved (mock mode)."
      });
      
      return;
    }
    return realPress.resolvePressBet(betId, winnerId);
  };

  const cancelPressBet = async (betId: string) => {
    if (MOCK_MODE) {
      setMockPressBets(prev => 
        prev.map(bet => bet.id === betId ? { ...bet, status: 'cancelled' } : bet)
      );
      
      toast({
        title: "Press bet cancelled",
        description: "The press bet has been cancelled (mock mode)."
      });
      
      return;
    }
    return realPress.cancelPressBet(betId);
  };

  return {
    pressBets: MOCK_MODE ? mockPressBets : realPress.pressBets,
    loading: MOCK_MODE ? loading : realPress.loading,
    error: MOCK_MODE ? null : realPress.error,
    createPressBet,
    acceptPressBet,
    declinePressBet,
    resolvePressBet,
    cancelPressBet,
    refetch: MOCK_MODE ? () => {} : realPress.refetch
  };
};
