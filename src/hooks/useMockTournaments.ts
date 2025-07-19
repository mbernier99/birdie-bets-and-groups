
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { MOCK_MODE, getMockTournamentsForUser, mockTournaments, getCurrentMockUser } from '@/utils/mockData';
import { useTournaments as useRealTournaments } from './useTournaments';

export const useMockTournaments = () => {
  const realTournaments = useRealTournaments();
  const [mockTournaments, setMockTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (MOCK_MODE) {
      setLoading(true);
      // Simulate API delay
      setTimeout(() => {
        const userTournaments = getMockTournamentsForUser();
        setMockTournaments(userTournaments);
        setLoading(false);
      }, 500);
    }
  }, []);

  const createTournament = async (tournamentData: any) => {
    if (MOCK_MODE) {
      const currentUser = getCurrentMockUser();
      const newTournament = {
        ...tournamentData,
        id: `tournament_${Date.now()}`,
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'draft'
      };
      
      setMockTournaments(prev => [newTournament, ...prev]);
      
      toast({
        title: "Tournament created!",
        description: `${newTournament.name} has been created successfully.`
      });
      
      return newTournament;
    }
    return realTournaments.createTournament(tournamentData);
  };

  const createTournamentWithInvitations = async (tournamentData: any, players: any[] = []) => {
    if (MOCK_MODE) {
      const tournament = await createTournament(tournamentData);
      
      if (players.length > 0) {
        toast({
          title: "Tournament created with invitations",
          description: `${tournament.name} created and ${players.length} invitations sent (mock mode).`
        });
      }
      
      return tournament;
    }
    return realTournaments.createTournamentWithInvitations(tournamentData, players);
  };

  const joinTournament = async (tournamentId: string, handicap?: number) => {
    if (MOCK_MODE) {
      toast({
        title: "Joined tournament!",
        description: "You have successfully joined the tournament (mock mode)."
      });
      return;
    }
    return realTournaments.joinTournament(tournamentId, handicap);
  };

  const leaveTournament = async (tournamentId: string) => {
    if (MOCK_MODE) {
      toast({
        title: "Left tournament",
        description: "You have successfully left the tournament (mock mode)."
      });
      return;
    }
    return realTournaments.leaveTournament(tournamentId);
  };

  const updateTournament = async (tournamentId: string, updates: any) => {
    if (MOCK_MODE) {
      setMockTournaments(prev => 
        prev.map(t => t.id === tournamentId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t)
      );
      return;
    }
    return realTournaments.updateTournament(tournamentId, updates);
  };

  return {
    tournaments: MOCK_MODE ? mockTournaments : realTournaments.tournaments,
    loading: MOCK_MODE ? loading : realTournaments.loading,
    error: MOCK_MODE ? null : realTournaments.error,
    createTournament,
    createTournamentWithInvitations,
    updateTournament,
    joinTournament,
    leaveTournament,
    refetch: MOCK_MODE ? () => {} : realTournaments.refetch
  };
};
