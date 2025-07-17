import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tournament = Database['public']['Tables']['tournaments']['Row'];
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert'];
type TournamentParticipant = Database['public']['Tables']['tournament_participants']['Row'];

export const useTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTournaments = async () => {
    if (!user) {
      setTournaments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch tournaments the user created or is participating in
      const { data: userTournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('*')
        .or(`created_by.eq.${user.id},id.in.(select tournament_id from tournament_participants where user_id = ${user.id})`)
        .order('created_at', { ascending: false });

      if (tournamentsError) throw tournamentsError;

      setTournaments(userTournaments || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading tournaments",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async (tournamentData: Omit<TournamentInsert, 'created_by' | 'id' | 'created_at' | 'updated_at'> & { name: string }) => {
    if (!user) {
      throw new Error('Must be authenticated to create tournament');
    }

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          ...tournamentData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically join the creator as a participant
      await supabase
        .from('tournament_participants')
        .insert([{
          tournament_id: data.id,
          user_id: user.id,
          status: 'confirmed'
        }]);

      await fetchTournaments();
      
      toast({
        title: "Tournament created!",
        description: `${data.name} has been created successfully.`
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error creating tournament",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateTournament = async (tournamentId: string, updates: Partial<Tournament>) => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', tournamentId)
        .select()
        .single();

      if (error) throw error;

      await fetchTournaments();
      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error updating tournament",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const joinTournament = async (tournamentId: string, handicap?: number) => {
    if (!user) {
      throw new Error('Must be authenticated to join tournament');
    }

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .insert([{
          tournament_id: tournamentId,
          user_id: user.id,
          handicap,
          status: 'confirmed'
        }]);

      if (error) throw error;

      await fetchTournaments();
      
      toast({
        title: "Joined tournament!",
        description: "You have successfully joined the tournament."
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error joining tournament",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const leaveTournament = async (tournamentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tournament_participants')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchTournaments();
      
      toast({
        title: "Left tournament",
        description: "You have successfully left the tournament."
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error leaving tournament",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTournaments();

    // Set up real-time subscription for tournaments
    const channel = supabase
      .channel('tournament-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments'
        },
        () => {
          fetchTournaments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_participants'
        },
        () => {
          fetchTournaments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    tournaments,
    loading,
    error,
    createTournament,
    updateTournament,
    joinTournament,
    leaveTournament,
    refetch: fetchTournaments
  };
};