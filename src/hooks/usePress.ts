import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PressBet = Database['public']['Tables']['press_bets']['Row'];
type PressBetInsert = Database['public']['Tables']['press_bets']['Insert'];

// Input validation helper
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const usePress = (tournamentId?: string) => {
  const [pressBets, setPressBets] = useState<PressBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPressBets = async () => {
    if (!user || !tournamentId) {
      setPressBets([]);
      setLoading(false);
      return;
    }

    // Validate tournamentId
    if (!isValidUUID(tournamentId)) {
      setError('Invalid tournament ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('press_bets')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPressBets(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading press bets",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPressBet = async (betData: Omit<PressBetInsert, 'id' | 'created_at' | 'initiator_id' | 'tournament_id'>) => {
    if (!user || !tournamentId) {
      throw new Error('Must be authenticated and in a tournament to create press bet');
    }

    if (!isValidUUID(tournamentId) || !isValidUUID(user.id)) {
      throw new Error('Invalid user or tournament ID');
    }

    try {
      const { data, error } = await supabase
        .from('press_bets')
        .insert({
          ...betData,
          tournament_id: tournamentId,
          initiator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      await fetchPressBets();
      
      toast({
        title: "Press bet created!",
        description: `${betData.description || 'Press bet'} has been created.`
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error creating press bet",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const acceptPressBet = async (betId: string) => {
    if (!user) {
      throw new Error('Must be authenticated to accept press bet');
    }

    if (!isValidUUID(betId) || !isValidUUID(user.id)) {
      throw new Error('Invalid bet or user ID');
    }

    try {
      const { data, error } = await supabase
        .from('press_bets')
        .update({ status: 'accepted' })
        .eq('id', betId)
        .eq('target_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchPressBets();
      
      toast({
        title: "Press bet accepted!",
        description: "The press bet has been accepted."
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error accepting press bet",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const declinePressBet = async (betId: string) => {
    if (!user) {
      throw new Error('Must be authenticated to decline press bet');
    }

    if (!isValidUUID(betId) || !isValidUUID(user.id)) {
      throw new Error('Invalid bet or user ID');
    }

    try {
      const { data, error } = await supabase
        .from('press_bets')
        .update({ status: 'declined' })
        .eq('id', betId)
        .eq('target_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchPressBets();
      
      toast({
        title: "Press bet declined",
        description: "The press bet has been declined."
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error declining press bet",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const resolvePressBet = async (betId: string, winnerId: string) => {
    if (!user) {
      throw new Error('Must be authenticated to resolve press bet');
    }

    if (!isValidUUID(betId) || !isValidUUID(user.id) || !isValidUUID(winnerId)) {
      throw new Error('Invalid bet, user, or winner ID');
    }

    try {
      // Use secure query method - check if user is either initiator OR target
      const { data, error } = await supabase
        .from('press_bets')
        .update({ 
          status: 'completed',
          winner_id: winnerId,
          completed_at: new Date().toISOString()
        })
        .eq('id', betId)
        .or(`initiator_id.eq.${user.id},target_id.eq.${user.id}`)
        .select()
        .single();

      if (error) throw error;

      await fetchPressBets();
      
      toast({
        title: "Press bet resolved!",
        description: "The press bet has been resolved."
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error resolving press bet",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const cancelPressBet = async (betId: string) => {
    if (!user) {
      throw new Error('Must be authenticated to cancel press bet');
    }

    if (!isValidUUID(betId) || !isValidUUID(user.id)) {
      throw new Error('Invalid bet or user ID');
    }

    try {
      const { data, error } = await supabase
        .from('press_bets')
        .update({ status: 'cancelled' })
        .eq('id', betId)
        .eq('initiator_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await fetchPressBets();
      
      toast({
        title: "Press bet cancelled",
        description: "The press bet has been cancelled."
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error cancelling press bet",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchPressBets();

    if (tournamentId && isValidUUID(tournamentId)) {
      // Set up real-time subscription for press bets with safe filter
      const channel = supabase
        .channel(`press-bets-${tournamentId}`)
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
        supabase.removeChannel(channel);
      };
    }
  }, [user, tournamentId]);

  return {
    pressBets,
    loading,
    error,
    createPressBet,
    acceptPressBet,
    declinePressBet,
    resolvePressBet,
    cancelPressBet,
    refetch: fetchPressBets
  };
};