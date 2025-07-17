import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Target, Trophy, Bell, AlertCircle } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';
import { useTournamentParticipants } from '@/hooks/useTournamentParticipants';
import { usePress } from '@/hooks/usePress';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PressManager from './press/PressManager';
import LocationBasedBetModal from './press/LocationBasedBetModal';
import LiveBetNotification from './press/LiveBetNotification';
import { getCoursePosition } from '@/utils/gpsCalculations';

const LiveTournamentTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentHole, setCurrentHole] = useState(1);
  const [showLocationBetModal, setShowLocationBetModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; currentHole: number } | null>(null);
  
  // Hooks
  const { tournaments, loading: tournamentsLoading } = useTournaments();
  const { participants, loading: participantsLoading } = useTournamentParticipants(id);
  const { pressBets, createPressBet, loading: pressLoading } = usePress(id);
  const { location, isLocationEnabled, getCurrentLocation, watchLocation } = useMobileFeatures();
  
  const tournament = tournaments.find(t => t.id === id);
  
  // Mock course holes with GPS coordinates for demo
  const courseHoles = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: i % 3 === 0 ? 5 : i % 3 === 1 ? 4 : 3,
    yardage: 350 + (i * 10),
    handicapIndex: i + 1,
    teeLocation: {
      latitude: 40.7128 + (i * 0.001),
      longitude: -74.0060 + (i * 0.001)
    },
    pinLocation: {
      latitude: 40.7128 + (i * 0.001) + 0.0005,
      longitude: -74.0060 + (i * 0.001) + 0.0005
    }
  }));

  useEffect(() => {
    if (isLocationEnabled && !location) {
      getCurrentLocation();
    }
  }, [isLocationEnabled, location, getCurrentLocation]);

  // Filter players who are behind the current user's hole for notifications
  const getEligiblePlayersForBet = () => {
    if (!participants || !user) return [];
    
    return participants
      .filter(p => p.user_id !== user.id)
      .map(p => ({
        id: p.user_id,
        name: `${(p as any).profiles?.first_name || ''} ${(p as any).profiles?.last_name || ''}`.trim() || 'Unknown Player',
        currentHole: Math.floor(Math.random() * 18) + 1 // Mock current hole - would come from real data
      }))
      .filter(p => p.currentHole >= currentHole); // Only players on same hole or behind
  };

  const handleLocationBasedBet = (player: { id: string; name: string; currentHole: number }) => {
    if (!isLocationEnabled) {
      toast({
        title: "Location Required",
        description: "Enable location services to create location-based bets.",
        variant: "destructive"
      });
      return;
    }

    if (!location) {
      toast({
        title: "Getting Location",
        description: "Please wait while we get your GPS location...",
      });
      return;
    }

    setSelectedPlayer(player);
    setShowLocationBetModal(true);
  };

  const handleSubmitLocationBet = async (request: any) => {
    if (!user || !id) return;

    try {
      // Create location-based press bet
      await createPressBet({
        target_id: request.targetId,
        amount: request.amount,
        bet_type: request.gameType,
        description: request.winCondition,
        hole_number: currentHole,
        location_lat: location?.latitude,
        location_lng: location?.longitude,
        expires_at: new Date(Date.now() + 60000).toISOString() // 60 seconds
      });

      toast({
        title: "Location Bet Created!",
        description: `${request.gameType.replace('-', ' ')} bet sent to ${selectedPlayer?.name}`,
      });

      // Send notification to all eligible players (those behind current hole)
      notifyEligiblePlayers(request);
      
    } catch (error) {
      console.error('Failed to create location bet:', error);
      toast({
        title: "Failed to Create Bet",
        description: "There was an error creating your location-based bet.",
        variant: "destructive"
      });
    }
  };

  const notifyEligiblePlayers = (request: any) => {
    const eligiblePlayers = getEligiblePlayersForBet();
    
    // In a real app, this would send push notifications
    eligiblePlayers.forEach(player => {
      if (player.currentHole >= currentHole) {
        console.log(`Notifying ${player.name} about ${request.gameType} bet on hole ${currentHole}`);
        // This would trigger real-time notifications via Supabase realtime
      }
    });
  };

  const getCurrentPosition = () => {
    if (!location) return null;
    return getCoursePosition(location, currentHole, courseHoles);
  };

  const position = getCurrentPosition();
  const eligiblePlayers = getEligiblePlayersForBet();
  const activeBets = pressBets.filter(bet => bet.status === 'pending' || bet.status === 'accepted');

  if (tournamentsLoading || participantsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading tournament data...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tournament Not Found</h3>
        <p className="text-gray-600">The tournament you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Position & Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Live Position</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Hole */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Hole:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentHole(Math.max(1, currentHole - 1))}
                  disabled={currentHole <= 1}
                >
                  -
                </Button>
                <Badge variant="secondary" className="px-3">
                  Hole {currentHole}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentHole(Math.min(18, currentHole + 1))}
                  disabled={currentHole >= 18}
                >
                  +
                </Button>
              </div>
            </div>

            {/* GPS Position */}
            {position && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Position:</span>
                <div className="flex items-center space-x-2">
                  <Badge className={`${
                    position.area === 'tee' ? 'bg-blue-100 text-blue-800' :
                    position.area === 'fairway' ? 'bg-green-100 text-green-800' :
                    position.area === 'rough' ? 'bg-yellow-100 text-yellow-800' :
                    position.area === 'green' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {position.area.charAt(0).toUpperCase() + position.area.slice(1)}
                  </Badge>
                  {position.distanceToPin && (
                    <span className="text-sm text-gray-600">
                      {position.distanceToPin.toFixed(0)}m to pin
                    </span>
                  )}
                </div>
              </div>
            )}

            {!isLocationEnabled && (
              <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  Enable location services for GPS-based betting
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location-Based Betting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Location-Based Bets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Challenge players behind you with longest drive and closest to pin bets.
            </p>
            
            {eligiblePlayers.length > 0 ? (
              <div className="space-y-2">
                {eligiblePlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-sm font-medium">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{player.name}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          Hole {player.currentHole}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLocationBasedBet(player)}
                      disabled={!isLocationEnabled || !location}
                      className="text-xs"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Challenge
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No players available for location-based bets</p>
                <p className="text-xs">Players must be on your hole or behind</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Location Bets */}
      {activeBets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Active Bets</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeBets.map(bet => {
                const isInitiator = bet.initiator_id === user?.id;
                const opponent = participants?.find(p => 
                  p.user_id === (isInitiator ? bet.target_id : bet.initiator_id)
                );
                
                return (
                  <div key={bet.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {isInitiator ? 'Challenge to' : 'Challenge from'} {
                            opponent ? `${(opponent as any).profiles?.first_name || ''} ${(opponent as any).profiles?.last_name || ''}`.trim() : 'Unknown'
                          }
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          ${bet.amount}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {bet.bet_type?.replace('-', ' ')} • Hole {bet.hole_number}
                      </div>
                      {bet.description && (
                        <div className="text-xs text-gray-600 mt-1">
                          {bet.description}
                        </div>
                      )}
                    </div>
                    <Badge className={`${
                      bet.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      bet.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bet.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traditional Press Manager */}
      {participants && user && (
        <PressManager
          tournamentId={id!}
          currentUserId={user.id}
          currentHole={currentHole}
          players={participants.map(p => ({
            id: p.user_id,
            name: `${(p as any).profiles?.first_name || ''} ${(p as any).profiles?.last_name || ''}`.trim() || 'Unknown Player',
            currentHole: Math.floor(Math.random() * 18) + 1 // Mock - would come from real data
          }))}
        />
      )}

      {/* Location Bet Modal */}
      <LocationBasedBetModal
        isOpen={showLocationBetModal}
        onClose={() => setShowLocationBetModal(false)}
        targetPlayer={selectedPlayer}
        currentHole={currentHole}
        currentLocation={location}
        courseHoles={courseHoles}
        onSubmit={handleSubmitLocationBet}
      />

      {/* Live Bet Notifications */}
      <LiveBetNotification tournamentId={id!} />
    </div>
  );
};

export default LiveTournamentTracker;