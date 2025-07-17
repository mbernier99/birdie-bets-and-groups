import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Tournament = Database['public']['Tables']['tournaments']['Row'];
type TournamentInsert = Database['public']['Tables']['tournaments']['Insert'];
type TournamentParticipant = Database['public']['Tables']['tournament_participants']['Row'];

// Input validation helper
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

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

    if (!isValidUUID(user.id)) {
      setError('Invalid user ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use secure parameterized queries instead of template literals
      const { data: createdTournaments, error: createdError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('created_by', user.id);

      if (createdError) throw createdError;

      const { data: participatedTournaments, error: participatedError } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants!inner(user_id)
        `)
        .eq('tournament_participants.user_id', user.id);

      if (participatedError) throw participatedError;

      // Combine and deduplicate tournaments
      const allTournaments = [
        ...(createdTournaments || []),
        ...(participatedTournaments || [])
      ];

      // Remove duplicates based on tournament ID
      const uniqueTournaments = allTournaments.filter((tournament, index, self) =>
        index === self.findIndex(t => t.id === tournament.id)
      );

      // Sort by created_at descending
      uniqueTournaments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTournaments(uniqueTournaments);
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

    if (!isValidUUID(user.id)) {
      throw new Error('Invalid user ID');
    }

    // Validate tournament name
    if (!tournamentData.name || tournamentData.name.trim().length === 0) {
      throw new Error('Tournament name is required');
    }

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          ...tournamentData,
          name: tournamentData.name.trim(),
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
    if (!isValidUUID(tournamentId)) {
      throw new Error('Invalid tournament ID');
    }

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

    if (!isValidUUID(tournamentId) || !isValidUUID(user.id)) {
      throw new Error('Invalid tournament or user ID');
    }

    // Validate handicap if provided
    if (handicap !== undefined && (handicap < -54 || handicap > 54)) {
      throw new Error('Handicap must be between -54 and 54');
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

    if (!isValidUUID(tournamentId) || !isValidUUID(user.id)) {
      throw new Error('Invalid tournament or user ID');
    }

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