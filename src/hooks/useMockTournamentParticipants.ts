
import { useState, useEffect } from 'react';
import { MOCK_MODE, getMockParticipantsForTournament } from '@/utils/mockData';
import { useTournamentParticipants as useRealTournamentParticipants } from './useTournamentParticipants';

export const useMockTournamentParticipants = (tournamentId?: string) => {
  const realParticipants = useRealTournamentParticipants(tournamentId);
  const [mockParticipants, setMockParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (MOCK_MODE && tournamentId) {
      setLoading(true);
      setTimeout(() => {
        const participants = getMockParticipantsForTournament(tournamentId);
        setMockParticipants(participants);
        setLoading(false);
      }, 200);
    }
  }, [tournamentId]);

  return {
    participants: MOCK_MODE ? mockParticipants : realParticipants.participants,
    loading: MOCK_MODE ? loading : realParticipants.loading,
    error: MOCK_MODE ? null : realParticipants.error,
    refetch: MOCK_MODE ? () => {} : realParticipants.refetch
  };
};
