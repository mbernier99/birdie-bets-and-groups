import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Wifi, WifiOff } from 'lucide-react';
import { Press, PressRequest, PressCounter, CourseHole } from '../../types/press';
import PressInitiationModal from './PressInitiationModal';
import PressNotificationModal from './PressNotificationModal';
import { useToast } from '@/hooks/use-toast';
import { validatePress } from '../../utils/pressValidation';
import { useEnhancedPress } from '../../hooks/useEnhancedPress';
import LiveBetNotification from './LiveBetNotification';

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
  const [showInitiationModal, setShowInitiationModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; currentHole: number } | null>(null);
  const { toast } = useToast();
  
  // Use enhanced press hook with real-time capabilities
  const { 
    pressBets, 
    loading, 
    error, 
    notifications,
    isOnline,
    createPressBet, 
    acceptPressBet, 
    declinePressBet,
    clearNotification 
  } = useEnhancedPress(tournamentId);

  // Mock course data - in real app this would come from props/context
  const courseHoles: CourseHole[] = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: i % 3 === 0 ? 5 : i % 3 === 1 ? 4 : 3,
    yardage: 350 + (i * 10),
    handicapIndex: i + 1
  }));

  // Convert Supabase press bets to local Press format for compatibility
  const presses: Press[] = pressBets.map(bet => ({
    id: bet.id,
    tournamentId: bet.tournament_id,
    initiatorId: bet.initiator_id,
    targetId: bet.target_id,
    amount: Number(bet.amount),
    currency: 'USD',
    startHole: bet.hole_number || currentHole,
    gameType: bet.bet_type as any,
    winCondition: bet.description || bet.bet_type,
    status: bet.status as any,
    initiatedAt: new Date(bet.created_at).getTime(),
    isCounter: false,
    expiresAt: bet.expires_at ? new Date(bet.expires_at).getTime() : Date.now() + 60000,
    respondedAt: bet.completed_at ? new Date(bet.completed_at).getTime() : undefined
  }));

  const handleInitiatePress = (player: { id: string; name: string; currentHole: number }) => {
    setSelectedPlayer(player);
    setShowInitiationModal(true);
  };

  const handleSubmitPress = async (request: PressRequest) => {
    try {
      await createPressBet({
        target_id: request.targetId,
        amount: request.amount,
        bet_type: request.gameType,
        description: request.winCondition,
        hole_number: request.startHole,
        expires_at: new Date(Date.now() + 60000).toISOString() // 60 seconds
      });

      toast({
        title: "Press Sent!",
        description: `Press sent to ${selectedPlayer?.name}. They have 60 seconds to respond.`,
      });
    } catch (error) {
      console.error('Error creating press bet:', error);
    }
  };

  // These methods are now handled by the enhanced press hook

  const getEligiblePlayers = () => {
    return players
      .filter(player => player.id !== currentUserId)
      .map(player => {
        const validation = validatePress(currentHole, player.currentHole, 'head-to-head', courseHoles);
        return {
          ...player,
          isEligible: validation.isValid,
          reason: validation.reason,
          warning: validation.warning
        };
      });
  };

  const getStatusColor = (status: Press['status']) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'pushed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activePresses = presses.filter(p => 
    (p.initiatorId === currentUserId || p.targetId === currentUserId) &&
    ['pending', 'accepted', 'active'].includes(p.status)
  );

  const eligiblePlayers = getEligiblePlayers();

  return (
    <div className="space-y-4">
      {/* Live bet notifications */}
      <LiveBetNotification tournamentId={tournamentId} />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Press Wagering</span>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-gray-500">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Player List */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Available Players
              </h4>
              <div className="space-y-2">
                {eligiblePlayers.map(player => {
                  const holeDiff = Math.abs(currentHole - player.currentHole);
                  
                  return (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{player.name}</span>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          Hole {player.currentHole}
                        </div>
                        {holeDiff > 0 && (
                          <Badge 
                            variant={holeDiff <= 1 ? "secondary" : holeDiff <= 3 ? "outline" : "destructive"}
                            className="text-xs"
                          >
                            {holeDiff} apart
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={player.isEligible ? "outline" : "secondary"}
                        disabled={!player.isEligible}
                        onClick={() => handleInitiatePress(player)}
                        className="text-xs"
                      >
                        {player.isEligible ? 'Press' : 'Not Available'}
                      </Button>
                    </div>
                  );
                })}
              </div>
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
                        <div className="text-xs text-gray-500">
                          {press.gameType.replace('-', ' ')} • {press.winCondition}
                        </div>
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
        courseHoles={courseHoles}
        onSubmit={handleSubmitPress}
      />
      
      {/* Show notifications count */}
      {notifications.length > 0 && (
        <div className="fixed bottom-20 right-4 z-40">
          <Badge variant="destructive" className="animate-pulse">
            {notifications.length} new
          </Badge>
        </div>
      )}
    </div>
  );
};

export default PressManager;
