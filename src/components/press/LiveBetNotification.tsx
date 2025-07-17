import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Target, MapPin, Timer, Trophy, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePress } from '@/hooks/usePress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LiveBetNotificationProps {
  tournamentId: string;
}

const LiveBetNotification: React.FC<LiveBetNotificationProps> = ({ tournamentId }) => {
  const { user } = useAuth();
  const { pressBets, acceptPressBet, declinePressBet } = usePress(tournamentId);
  const { toast } = useToast();
  const [pendingBets, setPendingBets] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;

    // Filter pending bets where current user is the target
    const pending = pressBets.filter(bet => 
      bet.target_id === user.id && 
      bet.status === 'pending' &&
      bet.expires_at &&
      new Date(bet.expires_at) > new Date()
    );
    
    setPendingBets(pending);
  }, [pressBets, user]);

  useEffect(() => {
    // Update timers for pending bets
    const interval = setInterval(() => {
      const newTimeRemaining: Record<string, number> = {};
      
      pendingBets.forEach(bet => {
        if (bet.expires_at) {
          const remaining = Math.max(0, Math.floor((new Date(bet.expires_at).getTime() - Date.now()) / 1000));
          newTimeRemaining[bet.id] = remaining;
          
          if (remaining === 0) {
            // Auto-decline expired bets
            handleExpiredBet(bet.id);
          }
        }
      });
      
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingBets]);

  const handleExpiredBet = async (betId: string) => {
    try {
      await supabase
        .from('press_bets')
        .update({ status: 'expired' })
        .eq('id', betId);
      
      toast({
        title: "Bet Expired",
        description: "A location-based bet has expired due to timeout.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error updating expired bet:', error);
    }
  };

  const handleAcceptBet = async (betId: string) => {
    try {
      await acceptPressBet(betId);
      toast({
        title: "Bet Accepted!",
        description: "You've accepted the location-based challenge. Good luck!",
      });
    } catch (error) {
      console.error('Error accepting bet:', error);
      toast({
        title: "Error",
        description: "Failed to accept the bet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeclineBet = async (betId: string) => {
    try {
      await declinePressBet(betId);
      toast({
        title: "Bet Declined",
        description: "You've declined the location-based challenge.",
      });
    } catch (error) {
      console.error('Error declining bet:', error);
      toast({
        title: "Error",
        description: "Failed to decline the bet. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBetTypeIcon = (betType: string) => {
    switch (betType) {
      case 'closest-to-pin':
        return <Target className="h-4 w-4" />;
      case 'longest-drive':
        return <Trophy className="h-4 w-4" />;
      case 'first-to-green':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getBetTypeDescription = (betType: string) => {
    switch (betType) {
      case 'closest-to-pin':
        return 'Closest to Pin Challenge';
      case 'longest-drive':
        return 'Longest Drive Challenge';
      case 'first-to-green':
        return 'First to Green Challenge';
      default:
        return 'Location-Based Challenge';
    }
  };

  if (pendingBets.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {pendingBets.map(bet => {
        const remainingTime = timeRemaining[bet.id] || 0;
        const isExpiring = remainingTime <= 10;
        
        return (
          <Card 
            key={bet.id} 
            className={`shadow-lg border-l-4 ${
              isExpiring ? 'border-l-red-500 bg-red-50' : 'border-l-emerald-500 bg-white'
            } animate-in slide-in-from-right-full duration-300`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {getBetTypeIcon(bet.bet_type)}
                  <span>New Challenge!</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Timer className="h-3 w-3 text-gray-500" />
                  <span className={`text-xs font-mono ${isExpiring ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatTimeRemaining(remainingTime)}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {getBetTypeDescription(bet.bet_type)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      ${bet.amount}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    Hole {bet.hole_number}
                  </div>
                  {bet.description && (
                    <p className="text-xs text-gray-700">{bet.description}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeclineBet(bet.id)}
                    className="flex-1 text-xs h-8"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAcceptBet(bet.id)}
                    className="flex-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                </div>

                {isExpiring && (
                  <div className="flex items-center space-x-1 text-red-600 text-xs">
                    <Timer className="h-3 w-3" />
                    <span>Expiring soon!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LiveBetNotification;