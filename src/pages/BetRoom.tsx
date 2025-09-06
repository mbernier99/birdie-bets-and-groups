import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, MapPin, Target, TrendingUp, Users, Zap } from 'lucide-react';
import { usePress } from '@/hooks/usePress';
import { useAuth } from '@/contexts/AuthContext';
import ReferencePointManager from '@/components/ar/ReferencePointManager';
import ShotTracker from '@/components/ar/ShotTracker';
import { ARMeasurement } from '@/components/ar/ARMeasurement';
import { calculateDistance } from '@/utils/gpsCalculations';

interface LocationRef {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  photoUrl?: string;
  confidence: 'high' | 'medium' | 'low';
  method: 'ar-camera' | 'gps-fallback';
  deviceOrientation?: any;
}

interface Shot {
  id: string;
  playerId: string;
  playerName: string;
  location: LocationRef;
  distanceYards?: number;
  timestamp: number;
}

const BetRoom: React.FC = () => {
  const { betId } = useParams<{ betId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { pressBets, acceptPressBet, declinePressBet, resolvePressBet } = usePress();
  
  const [name, setName] = useState(user?.email?.split('@')[0] || '');
  const [shots, setShots] = useState<Shot[]>([]);
  const [referencePoints, setReferencePoints] = useState<{
    pin?: LocationRef;
    tee?: LocationRef;
    start?: LocationRef;
  }>({});
  const [betAccepted, setBetAccepted] = useState(false);

  const bet = pressBets.find(b => b.id === betId);
  const isHost = bet?.initiator_id === user?.id;
  const isTarget = bet?.target_id === user?.id;
  const isParticipant = isHost || isTarget;
  
  const gameMode = bet?.bet_type === 'closest-to-pin' ? 'ctp' : 'long-drive';

  useEffect(() => {
    if (bet && bet.status === 'accepted') {
      setBetAccepted(true);
    }
  }, [bet]);

  useEffect(() => {
    document.title = `Bet Room • ${bet?.bet_type || 'Loading...'}`;
  }, [bet]);

  const handleAcceptBet = async () => {
    if (!betId || !isTarget) return;
    
    try {
      await acceptPressBet(betId);
      setBetAccepted(true);
      toast({
        title: "Bet accepted!",
        description: "You can now start recording your shots."
      });
    } catch (error) {
      console.error('Error accepting bet:', error);
    }
  };

  const handleDeclineBet = async () => {
    if (!betId || !isTarget) return;
    
    try {
      await declinePressBet(betId);
      toast({
        title: "Bet declined",
        description: "You have declined this bet."
      });
      navigate('/bet');
    } catch (error) {
      console.error('Error declining bet:', error);
    }
  };

  const handleReferencePointSet = (type: 'pin' | 'tee' | 'start', measurement: ARMeasurement) => {
    const locationRef: LocationRef = {
      latitude: measurement.latitude,
      longitude: measurement.longitude,
      accuracy: measurement.accuracy,
      timestamp: measurement.timestamp,
      photoUrl: measurement.photoUrl,
      confidence: measurement.confidence as 'high' | 'medium' | 'low',
      method: measurement.method as 'ar-camera' | 'gps-fallback',
      deviceOrientation: measurement.deviceOrientation
    };

    setReferencePoints(prev => ({
      ...prev,
      [type]: locationRef
    }));

    toast({ 
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} location set`,
      description: `${measurement.confidence.toUpperCase()} accuracy measurement recorded`
    });
  };

  const handleShotRecorded = (measurement: ARMeasurement) => {
    if (!user) return;

    const locationRef: LocationRef = {
      latitude: measurement.latitude,
      longitude: measurement.longitude,
      accuracy: measurement.accuracy,
      timestamp: measurement.timestamp,
      photoUrl: measurement.photoUrl,
      confidence: measurement.confidence as 'high' | 'medium' | 'low',
      method: measurement.method as 'ar-camera' | 'gps-fallback',
      deviceOrientation: measurement.deviceOrientation
    };

    // Calculate distance based on game mode
    let distanceYards = 0;
    if (gameMode === 'ctp' && referencePoints.pin) {
      const distanceMeters = calculateDistance(
        { latitude: measurement.latitude, longitude: measurement.longitude },
        { latitude: referencePoints.pin.latitude, longitude: referencePoints.pin.longitude }
      );
      distanceYards = distanceMeters * 1.09361; // Convert to yards
    } else if (gameMode === 'long-drive' && referencePoints.tee) {
      const distanceMeters = calculateDistance(
        { latitude: referencePoints.tee.latitude, longitude: referencePoints.tee.longitude },
        { latitude: measurement.latitude, longitude: measurement.longitude }
      );
      distanceYards = distanceMeters * 1.09361; // Convert to yards
    }

    const newShot: Shot = {
      id: `shot_${Date.now()}`,
      playerId: user.id,
      playerName: name,
      location: locationRef,
      distanceYards,
      timestamp: Date.now()
    };

    setShots(prev => [...prev, newShot]);
    
    toast({ 
      title: "Shot recorded!",
      description: distanceYards > 0 
        ? `Distance: ${distanceYards.toFixed(1)} yards`
        : `${measurement.confidence.toUpperCase()} accuracy measurement`
    });
  };

  const leaderboard = useMemo(() => {
    if (gameMode === 'ctp') {
      return shots
        .filter(shot => shot.distanceYards !== undefined)
        .sort((a, b) => (a.distanceYards || 0) - (b.distanceYards || 0));
    } else {
      return shots
        .filter(shot => shot.distanceYards !== undefined)
        .sort((a, b) => (b.distanceYards || 0) - (a.distanceYards || 0));
    }
  }, [shots, gameMode]);

  const canRecordShots = betAccepted && isParticipant;
  const needsReferencePoints = gameMode === 'ctp' ? !referencePoints.pin : !referencePoints.tee;

  if (!bet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-lg font-semibold mb-2">Bet not found</div>
            <p className="text-muted-foreground mb-4">This bet may have expired or been cancelled.</p>
            <Button onClick={() => navigate('/bet')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Betting
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">      
      <div className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/bet')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge variant={bet.status === 'accepted' ? 'default' : 'secondary'}>
            {bet.status}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {gameMode === 'ctp' ? <Target className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              <div>
                <div>{gameMode === 'ctp' ? 'Closest to Pin' : 'Long Drive'}</div>
                <div className="text-sm font-normal text-muted-foreground">
                  ${bet.amount} • {bet.description}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">Host</div>
                  <div className="text-muted-foreground">
                    {isHost ? 'You' : 'Other Player'}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Challenger</div>
                  <div className="text-muted-foreground">
                    {isTarget ? 'You' : 'Other Player'}
                  </div>
                </div>
              </div>

              {!betAccepted && isTarget && bet.status === 'pending' && (
                <div className="flex gap-2">
                  <Button onClick={handleAcceptBet} className="flex-1">
                    Accept Bet
                  </Button>
                  <Button variant="outline" onClick={handleDeclineBet} className="flex-1">
                    Decline
                  </Button>
                </div>
              )}

              {bet.status === 'pending' && !isTarget && (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">
                    Waiting for challenger to accept...
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {betAccepted && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Your Name</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name for the leaderboard"
                />
              </CardContent>
            </Card>

            {isHost && (
              <ReferencePointManager
                gameMode={gameMode}
                referencePoints={referencePoints}
                onReferencePointSet={handleReferencePointSet}
                isHost={true}
              />
            )}

            {canRecordShots && !needsReferencePoints && (
              <ShotTracker
                referencePoints={referencePoints}
                onShotRecorded={handleShotRecorded}
                gameMode={gameMode}
              />
            )}

            {needsReferencePoints && !isHost && (
              <Card>
                <CardContent className="text-center py-8">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Waiting for setup</h3>
                  <p className="text-muted-foreground">
                    The host needs to set the {gameMode === 'ctp' ? 'pin' : 'tee'} location before you can record shots.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No shots recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((shot, index) => (
                      <div key={shot.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div className="flex items-center gap-3">
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            #{index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium">{shot.playerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(shot.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {shot.distanceYards?.toFixed(1)} yd
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {gameMode === 'ctp' ? 'to pin' : 'drive'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default BetRoom;