import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TournamentNotification {
  id: string;
  type: 'bet' | 'score' | 'resolution' | 'social' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  requiresAction?: boolean;
}

export const useNotifications = (tournamentId: string, userId: string) => {
  const [notifications, setNotifications] = useState<TournamentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!tournamentId || !userId) return;

    // Subscribe to press bets for bet notifications
    const betsChannel = supabase
      .channel(`tournament-${tournamentId}-notifications`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'press_bets',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          const bet = payload.new;
          if (bet.target_id === userId && bet.status === 'pending') {
            const notification: TournamentNotification = {
              id: bet.id,
              type: 'bet',
              title: 'New Press Bet',
              message: `You have a new $${bet.amount} bet request`,
              data: bet,
              isRead: false,
              createdAt: new Date().toISOString(),
              requiresAction: true
            };
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast({
              title: notification.title,
              description: notification.message,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'press_bets',
          filter: `tournament_id=eq.${tournamentId}`
        },
        (payload) => {
          const bet = payload.new;
          
          // Bet resolution notifications
          if (bet.status === 'completed' && bet.winner_id) {
            if (bet.initiator_id === userId || bet.target_id === userId) {
              const isWinner = bet.winner_id === userId;
              const notification: TournamentNotification = {
                id: `${bet.id}-result`,
                type: 'resolution',
                title: isWinner ? 'You Won!' : 'Bet Lost',
                message: isWinner 
                  ? `You won $${bet.amount} from the bet!`
                  : `You lost $${bet.amount} on the bet`,
                data: bet,
                isRead: false,
                createdAt: new Date().toISOString()
              };
              setNotifications(prev => [notification, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              toast({
                title: notification.title,
                description: notification.message,
                variant: isWinner ? 'default' : 'destructive'
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to hole scores for leaderboard changes
    const scoresChannel = supabase
      .channel(`tournament-${tournamentId}-scores`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hole_scores'
        },
        async (payload) => {
          const score = payload.new;
          // Fetch user profile for the score
          const { data: round } = await supabase
            .from('rounds')
            .select('user_id')
            .eq('id', score.round_id)
            .single();

          if (round && round.user_id !== userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, nickname')
              .eq('id', round.user_id)
              .single();

            const playerName = profile?.nickname || profile?.first_name || 'A player';
            const par = 4; // You'd want to fetch actual par
            const diff = score.strokes - par;
            
            if (diff <= -2) {
              const notification: TournamentNotification = {
                id: `score-${score.id}`,
                type: 'score',
                title: 'Eagle Alert!',
                message: `${playerName} just made an eagle on hole ${score.hole_number}!`,
                isRead: false,
                createdAt: new Date().toISOString()
              };
              setNotifications(prev => [notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(betsChannel);
      supabase.removeChannel(scoresChannel);
    };
  }, [tournamentId, userId]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification
  };
};
