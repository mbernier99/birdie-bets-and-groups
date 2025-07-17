import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useOfflineStorage } from './useOfflineStorage';
import type { Database } from '@/integrations/supabase/types';

type PressBet = Database['public']['Tables']['press_bets']['Row'];
type PressBetInsert = Database['public']['Tables']['press_bets']['Insert'];

interface PressNotification {
  id: string;
  type: 'bet_received' | 'bet_accepted' | 'bet_declined' | 'bet_expired' | 'bet_resolved';
  message: string;
  timestamp: number;
  betId: string;
}

export const useEnhancedPress = (tournamentId?: string) => {
  const [pressBets, setPressBets] = useState<PressBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<PressNotification[]>([]);
  const { user } = useAuth();
  const { isOnline, addToSyncQueue, getOfflineData, saveOfflineData } = useOfflineStorage();

  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const fetchPressBets = useCallback(async () => {
    if (!user || !tournamentId) {
      setPressBets([]);
      setLoading(false);
      return;
    }

    if (!isValidUUID(tournamentId)) {
      setError('Invalid tournament ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isOnline) {
        // Fetch from Supabase when online
        const { data, error: fetchError } = await supabase
          .from('press_bets')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setPressBets(data || []);
        // Cache data for offline use
        saveOfflineData('pressBets', data || []);
      } else {
        // Load from offline storage when offline
        const offlineData = getOfflineData();
        setPressBets(offlineData.pressBets || []);
      }
    } catch (err: any) {
      setError(err.message);
      // Try to load offline data as fallback
      const offlineData = getOfflineData();
      setPressBets(offlineData.pressBets || []);
      
      toast({
        title: "Error loading press bets",
        description: isOnline ? err.message : "Using offline data",
        variant: isOnline ? "destructive" : "default"
      });
    } finally {
      setLoading(false);
    }
  }, [user, tournamentId, isOnline]);

  const createPressBet = async (betData: Omit<PressBetInsert, 'id' | 'created_at' | 'initiator_id' | 'tournament_id'>) => {
    if (!user || !tournamentId) {
      throw new Error('Must be authenticated and in a tournament to create press bet');
    }

    if (!isValidUUID(tournamentId) || !isValidUUID(user.id)) {
      throw new Error('Invalid user or tournament ID');
    }

    const newBet = {
      ...betData,
      tournament_id: tournamentId,
      initiator_id: user.id,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    try {
      if (isOnline) {
        // Create directly in Supabase when online
        const { data, error } = await supabase
          .from('press_bets')
          .insert(newBet)
          .select()
          .single();

        if (error) throw error;

        await fetchPressBets();
        
        toast({
          title: "Press bet created!",
          description: `${betData.description || 'Press bet'} has been created.`
        });

        return data;
      } else {
        // Queue for sync when offline
        addToSyncQueue({
          type: 'press_bet',
          operation: 'create',
          data: newBet
        });

        // Update local state optimistically
        setPressBets(prev => [newBet as PressBet, ...prev]);
        
        toast({
          title: "Press bet queued",
          description: "Bet will be created when connection is restored."
        });

        return newBet;
      }
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

  const updatePressBet = async (betId: string, updates: Partial<PressBet>) => {
    if (!user) {
      throw new Error('Must be authenticated to update press bet');
    }

    if (!isValidUUID(betId) || !isValidUUID(user.id)) {
      throw new Error('Invalid bet or user ID');
    }

    try {
      if (isOnline) {
        // Update directly in Supabase when online
        const { data, error } = await supabase
          .from('press_bets')
          .update(updates)
          .eq('id', betId)
          .or(`initiator_id.eq.${user.id},target_id.eq.${user.id}`)
          .select()
          .single();

        if (error) throw error;

        await fetchPressBets();
        return data;
      } else {
        // Queue for sync when offline
        addToSyncQueue({
          type: 'press_bet',
          operation: 'update',
          data: { id: betId, updates }
        });

        // Update local state optimistically
        setPressBets(prev => prev.map(bet => 
          bet.id === betId ? { ...bet, ...updates } : bet
        ));

        return { id: betId, ...updates };
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const acceptPressBet = async (betId: string) => {
    try {
      await updatePressBet(betId, { status: 'accepted' });
      
      addNotification({
        type: 'bet_accepted',
        message: 'Press bet accepted!',
        betId
      });

      toast({
        title: "Press bet accepted!",
        description: "The press bet has been accepted."
      });
    } catch (err: any) {
      toast({
        title: "Error accepting press bet",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const declinePressBet = async (betId: string) => {
    try {
      await updatePressBet(betId, { status: 'declined' });
      
      addNotification({
        type: 'bet_declined',
        message: 'Press bet declined',
        betId
      });

      toast({
        title: "Press bet declined",
        description: "The press bet has been declined."
      });
    } catch (err: any) {
      toast({
        title: "Error declining press bet",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const resolvePressBet = async (betId: string, winnerId: string) => {
    try {
      await updatePressBet(betId, { 
        status: 'completed',
        winner_id: winnerId,
        completed_at: new Date().toISOString()
      });
      
      addNotification({
        type: 'bet_resolved',
        message: 'Press bet resolved!',
        betId
      });

      toast({
        title: "Press bet resolved!",
        description: "The press bet has been resolved."
      });
    } catch (err: any) {
      toast({
        title: "Error resolving press bet",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  const addNotification = (notification: Omit<PressNotification, 'id' | 'timestamp'>) => {
    const newNotification: PressNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep last 10
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchPressBets();

    if (tournamentId && isValidUUID(tournamentId) && isOnline) {
      // Set up real-time subscription for press bets
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
          (payload) => {
            console.log('Real-time press bet update:', payload);
            
            // Handle different event types
            if (payload.eventType === 'INSERT') {
              const newBet = payload.new as PressBet;
              if (newBet.target_id === user?.id) {
                addNotification({
                  type: 'bet_received',
                  message: 'New press bet received!',
                  betId: newBet.id
                });
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedBet = payload.new as PressBet;
              if (updatedBet.initiator_id === user?.id && updatedBet.status === 'accepted') {
                addNotification({
                  type: 'bet_accepted',
                  message: 'Your press bet was accepted!',
                  betId: updatedBet.id
                });
              }
            }
            
            // Refresh data
            fetchPressBets();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, tournamentId, isOnline, fetchPressBets]);

  return {
    pressBets,
    loading,
    error,
    notifications,
    isOnline,
    createPressBet,
    acceptPressBet,
    declinePressBet,
    resolvePressBet,
    clearNotification,
    refetch: fetchPressBets
  };
};