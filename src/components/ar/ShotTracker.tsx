import React, { useState } from 'react';
import { Target, MapPin, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ARMeasurement, { ARMeasurement as ARMeasurementType } from './ARMeasurement';
import { calculateDistance } from '@/utils/gpsCalculations';

interface ReferencePoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  photoUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
  method?: 'ar-camera' | 'gps-fallback';
  deviceOrientation?: {
    alpha: number;
    beta: number;
    gamma: number;
  };
}

interface ShotTrackerProps {
  referencePoints: {
    pin?: ReferencePoint;
    tee?: ReferencePoint;
  };
  onShotRecorded: (shot: ARMeasurementType & { distanceYards?: number }) => void;
  gameMode: 'ctp' | 'long-drive';
}

const ShotTracker: React.FC<ShotTrackerProps> = ({
  referencePoints,
  onShotRecorded,
  gameMode
}) => {
  const [showARCapture, setShowARCapture] = useState(false);
  const [recentShots, setRecentShots] = useState<Array<ARMeasurementType & { distanceYards?: number }>>([]);

  const handleShotCapture = (measurement: ARMeasurementType) => {
    // Calculate distance based on game mode
    let distanceYards: number | undefined;
    
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

    const shotWithDistance = { ...measurement, distanceYards };
    setRecentShots(prev => [shotWithDistance, ...prev.slice(0, 4)]); // Keep last 5 shots
    onShotRecorded(shotWithDistance);
    setShowARCapture(false);
  };

  const canRecordShot = () => {
    if (gameMode === 'ctp') return Boolean(referencePoints.pin);
    if (gameMode === 'long-drive') return Boolean(referencePoints.tee);
    return false;
  };

  const getInstructions = () => {
    if (gameMode === 'ctp') {
      return "Align your camera with your golf ball position and capture for precise distance to pin measurement";
    }
    return "Align your camera with your golf ball's final position and capture for precise drive distance measurement";
  };

  const getMissingReferenceMessage = () => {
    if (gameMode === 'ctp' && !referencePoints.pin) {
      return "Waiting for host to set pin location";
    }
    if (gameMode === 'long-drive' && !referencePoints.tee) {
      return "Waiting for host to set tee location";
    }
    return null;
  };

  if (showARCapture) {
    return (
      <ARMeasurement
        onCapture={handleShotCapture}
        onCancel={() => setShowARCapture(false)}
        targetType="shot"
        title="Record Your Shot"
        instructions={getInstructions()}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Shot Recording */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Shot Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {getMissingReferenceMessage() ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{getMissingReferenceMessage()}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {gameMode === 'ctp' 
                  ? 'Record where your ball lands for closest to pin measurement'
                  : 'Record your ball\'s final position for drive distance measurement'
                }
              </div>
              <Button
                onClick={() => setShowARCapture(true)}
                disabled={!canRecordShot()}
                className="w-full h-12"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                Record My Shot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Shots */}
      {recentShots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Your Recent Shots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentShots.map((shot, index) => (
              <div key={shot.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                    #{index + 1}
                  </Badge>
                  <div className="text-sm">
                    <div className="font-medium">
                      {shot.distanceYards ? `${shot.distanceYards.toFixed(1)} yds` : 'Calculating...'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {shot.confidence.toUpperCase()} accuracy
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(shot.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reference Points Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Reference Points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {gameMode === 'ctp' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">Pin Location</span>
              </div>
              <Badge variant={referencePoints.pin ? 'default' : 'secondary'}>
                {referencePoints.pin ? 'Set' : 'Not Set'}
              </Badge>
            </div>
          )}
          {gameMode === 'long-drive' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary" />
                <span className="text-sm">Tee Location</span>
              </div>
              <Badge variant={referencePoints.tee ? 'default' : 'secondary'}>
                {referencePoints.tee ? 'Set' : 'Not Set'}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShotTracker;