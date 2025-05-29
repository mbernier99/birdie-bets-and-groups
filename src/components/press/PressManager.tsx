
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Press, PressRequest, PressCounter } from '../../types/press';
import PressInitiationModal from './PressInitiationModal';
import PressNotificationModal from './PressNotificationModal';
import { useToast } from '@/hooks/use-toast';

interface PressManagerProps {
  tournamentId: string;
  currentUserId: string;
  currentHole: number;
  players: Array<{ id: string; name: string; currentHole: number }>;
}

const PressManager: React.FC<PressManagerProps> = ({
  tournamentId,
  currentUserId,
  currentHole,
  players
}) => {
  const [presses, setPresses] = useState<Press[]>([]);
  const [showInitiationModal, setShowInitiationModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);
  const [pendingPress, setPendingPress] = useState<Press | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const { toast } = useToast();

  // Mock data - replace with actual data fetching
  useEffect(() => {
    // Load presses from storage/API
    const loadPresses = () => {
      // This would be replaced with actual API calls
      console.log('Loading presses for tournament:', tournamentId);
    };
    loadPresses();
  }, [tournamentId]);

  // Timer for pending press responses
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (pendingPress && showNotificationModal) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((pendingPress.expiresAt - Date.now()) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          handlePressExpired();
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [pendingPress, showNotificationModal]);

  const handleInitiatePress = (player: { id: string; name: string }) => {
    setSelectedPlayer(player);
    setShowInitiationModal(true);
  };

  const handleSubmitPress = (request: PressRequest) => {
    const newPress: Press = {
      id: Date.now().toString(),
      tournamentId,
      initiatorId: currentUserId,
      targetId: request.targetId,
      amount: request.amount,
      currency: 'USD',
      startHole: request.startHole,
      gameType: request.gameType,
      winCondition: request.winCondition,
      status: 'pending',
      initiatedAt: Date.now(),
      isCounter: false,
      expiresAt: Date.now() + 60000 // 60 seconds
    };

    setPresses(prev => [...prev, newPress]);
    
    // If the press is for the current user (demo purposes), show notification
    if (request.targetId === currentUserId) {
      setPendingPress(newPress);
      setShowNotificationModal(true);
      setTimeRemaining(60);
    }

    toast({
      title: "Press Sent!",
      description: `Press sent to ${selectedPlayer?.name}. They have 60 seconds to respond.`,
    });
  };

  const handleAcceptPress = () => {
    if (!pendingPress) return;

    setPresses(prev => prev.map(p => 
      p.id === pendingPress.id 
        ? { ...p, status: 'accepted' as const, respondedAt: Date.now() }
        : p
    ));

    setShowNotificationModal(false);
    setPendingPress(null);

    toast({
      title: "Press Accepted!",
      description: "The press is now active. Good luck!",
    });
  };

  const handleDeclinePress = () => {
    if (!pendingPress) return;

    setPresses(prev => prev.map(p => 
      p.id === pendingPress.id 
        ? { ...p, status: 'declined' as const, respondedAt: Date.now() }
        : p
    ));

    setShowNotificationModal(false);
    setPendingPress(null);

    toast({
      title: "Press Declined",
      description: "You declined the press.",
    });
  };

  const handleCounterPress = (counter: PressCounter) => {
    if (!pendingPress) return;

    const counterPress: Press = {
      ...pendingPress,
      id: Date.now().toString(),
      initiatorId: pendingPress.targetId,
      targetId: pendingPress.initiatorId,
      amount: counter.amount || pendingPress.amount,
      gameType: counter.gameType || pendingPress.gameType,
      winCondition: counter.winCondition || pendingPress.winCondition,
      isCounter: true,
      originalPressId: pendingPress.id,
      initiatedAt: Date.now(),
      expiresAt: Date.now() + 60000
    };

    setPresses(prev => [
      ...prev.map(p => 
        p.id === pendingPress.id 
          ? { ...p, status: 'declined' as const, respondedAt: Date.now() }
          : p
      ),
      counterPress
    ]);

    setShowNotificationModal(false);
    setPendingPress(null);

    toast({
      title: "Counter Press Sent!",
      description: "Your counter press has been sent.",
    });
  };

  const handlePressExpired = () => {
    if (!pendingPress) return;

    setPresses(prev => prev.map(p => 
      p.id === pendingPress.id 
        ? { ...p, status: 'expired' as const }
        : p
    ));

    setShowNotificationModal(false);
    setPendingPress(null);

    toast({
      title: "Press Expired",
      description: "The press expired due to no response.",
    });
  };

  const getEligiblePlayers = () => {
    return players.filter(player => 
      player.id !== currentUserId && 
      Math.abs(player.currentHole - currentHole) <= 1
    );
  };

  const getStatusColor = (status: Press['status']) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activePresses = presses.filter(p => 
    (p.initiatorId === currentUserId || p.targetId === currentUserId) &&
    ['pending', 'accepted', 'active'].includes(p.status)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Press Wagering</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {getEligiblePlayers().map(player => (
                <Button
                  key={player.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleInitiatePress(player)}
                  className="text-xs"
                >
                  Press {player.name}
                </Button>
              ))}
            </div>

            {activePresses.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Active Presses</h4>
                {activePresses.map(press => {
                  const isInitiator = press.initiatorId === currentUserId;
                  const opponent = players.find(p => p.id === (isInitiator ? press.targetId : press.initiatorId));
                  
                  return (
                    <div key={press.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="text-sm">
                        <span className="font-medium">
                          {isInitiator ? 'vs' : 'from'} {opponent?.name}
                        </span>
                        <span className="text-gray-600 ml-2">${press.amount}</span>
                      </div>
                      <Badge className={getStatusColor(press.status)}>
                        {press.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PressInitiationModal
        isOpen={showInitiationModal}
        onClose={() => setShowInitiationModal(false)}
        targetPlayer={selectedPlayer}
        currentHole={currentHole}
        onSubmit={handleSubmitPress}
      />

      <PressNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        press={pendingPress}
        onAccept={handleAcceptPress}
        onDecline={handleDeclinePress}
        onCounter={handleCounterPress}
        timeRemaining={timeRemaining}
      />
    </div>
  );
};

export default PressManager;
