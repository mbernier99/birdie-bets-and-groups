import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TournamentParticipant = Database['public']['Tables']['tournament_participants']['Row'];

export const useTournamentParticipants = (tournamentId?: string) => {
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchParticipants = async () => {
    if (!tournamentId) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          profiles(first_name, last_name, email)
        `)
        .eq('tournament_id', tournamentId)
        .order('joined_at', { ascending: true });

      if (fetchError) throw fetchError;

      setParticipants(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading participants",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();

    if (tournamentId) {
      // Set up real-time subscription for participants
      const channel = supabase
        .channel(`participants-${tournamentId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tournament_participants',
            filter: `tournament_id=eq.${tournamentId}`
          },
          () => {
            fetchParticipants();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [tournamentId]);

  return {
    participants,
    loading,
    error,
    refetch: fetchParticipants
  };
};