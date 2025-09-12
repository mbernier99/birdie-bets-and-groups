import React, { useState, useMemo } from 'react';
import { Target, MapPin, Zap, Trophy, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import EnhancedARMeasurement, { EnhancedARMeasurement as EnhancedARMeasurementType } from './EnhancedARMeasurement';
import { useToast } from '@/components/ui/use-toast';

interface ReferencePoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  photoUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
  method?: 'enhanced-ar' | 'ar-camera' | 'gps-multi-sample' | 'gps-fallback';
  deviceOrientation?: {
    alpha: number;
    beta: number;
    gamma: number;
  };
}

interface EnhancedShotData {
  id: string;
  playerId: string;
  playerName: string;
  measurement: EnhancedARMeasurementType;
  distanceYards: number;
  timestamp: number;
  ranking: number;
}

interface EnhancedShotTrackerProps {
  referencePoints: {
    pin?: ReferencePoint;
    tee?: ReferencePoint;
    start?: ReferencePoint;
  };
  onShotRecorded: (shot: EnhancedShotData) => void;
  gameMode: 'ctp' | 'long-drive';
  playerId: string;
  playerName: string;
  recentShots?: EnhancedShotData[];
}

const EnhancedShotTracker: React.FC<EnhancedShotTrackerProps> = ({
  referencePoints,
  onShotRecorded,
  gameMode,
  playerId,
  playerName,
  recentShots = []
}) => {
  const [showARCapture, setShowARCapture] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const relevantReferencePoint = useMemo(() => {
    if (gameMode === 'ctp') return referencePoints.pin || referencePoints.start;
    if (gameMode === 'long-drive') return referencePoints.tee;
    return null;
  }, [gameMode, referencePoints]);

  const canRecordShot = useMemo(() => {
    return relevantReferencePoint !== null;
  }, [relevantReferencePoint]);

  const myRecentShots = useMemo(() => {
    return recentShots
      .filter(shot => shot.playerId === playerId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
  }, [recentShots, playerId]);

  const bestShot = useMemo(() => {
    if (myRecentShots.length === 0) return null;
    
    if (gameMode === 'ctp') {
      return myRecentShots.reduce((best, shot) => 
        shot.distanceYards < best.distanceYards ? shot : best
      );
    } else {
      return myRecentShots.reduce((best, shot) => 
        shot.distanceYards > best.distanceYards ? shot : best
      );
    }
  }, [myRecentShots, gameMode]);

  const calculateDistance = (
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleShotCapture = (measurement: EnhancedARMeasurementType) => {
    if (!relevantReferencePoint) return;

    const distanceMeters = calculateDistance(measurement, relevantReferencePoint);
    const distanceYards = distanceMeters * 1.09361; // Convert to yards

    const shotData: EnhancedShotData = {
      id: crypto.randomUUID(),
      playerId,
      playerName,
      measurement,
      distanceYards,
      timestamp: Date.now(),
      ranking: 0 // Will be calculated by parent component
    };

    onShotRecorded(shotData);
    setShowARCapture(false);

    const confidenceEmoji = measurement.confidence === 'high' ? '🎯' : 
                           measurement.confidence === 'medium' ? '👍' : '📍';
    
    toast({
      title: `Shot recorded! ${confidenceEmoji}`,
      description: `${distanceYards.toFixed(1)} yards • ${measurement.confidence.toUpperCase()} confidence`
    });
  };

  const getInstructions = () => {
    if (gameMode === 'ctp') {
      return "Align with your ball and capture for closest-to-pin measurement";
    } else {
      return "Align with your ball and capture for longest drive measurement";
    }
  };

  const getProgressValue = () => {
    if (!relevantReferencePoint) return 0;
    if (myRecentShots.length === 0) return 25;
    if (myRecentShots.length === 1) return 50;
    if (myRecentShots.length === 2) return 75;
    return 100;
  };

  if (showARCapture) {
    return (
      <EnhancedARMeasurement
        onCapture={handleShotCapture}
        onCancel={() => setShowARCapture(false)}
        targetType="shot"
        title={`Record ${gameMode === 'ctp' ? 'Closest to Pin' : 'Long Drive'} Shot`}
        instructions={getInstructions()}
        referencePoint={relevantReferencePoint}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Shot Recording Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Enhanced Shot Tracker
            <Badge variant="outline" className="text-xs">
              {gameMode === 'ctp' ? 'Closest to Pin' : 'Long Drive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reference Point Status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {gameMode === 'ctp' ? (
                <Target className="h-5 w-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-orange-600" />
              )}
              <div>
                <div className="font-medium">
                  {gameMode === 'ctp' ? 'Pin Location' : 'Tee Location'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {relevantReferencePoint 
                    ? `Set • ${relevantReferencePoint.confidence?.toUpperCase() || 'MEDIUM'} accuracy`
                    : 'Not set by host'
                  }
                </div>
              </div>
            </div>
            {relevantReferencePoint && (
              <Badge variant="secondary">
                ±{relevantReferencePoint.accuracy?.toFixed(1) || '5.0'}m
              </Badge>
            )}
          </div>

          {/* Shot Recording Button */}
          <Button
            onClick={() => setShowARCapture(true)}
            disabled={!canRecordShot || isRecording}
            className="w-full h-14 text-lg"
            size="lg"
          >
            {!canRecordShot ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                Waiting for Host Setup
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6" />
                Record Enhanced Shot
              </div>
            )}
          </Button>

          {/* Progress Indicator */}
          {canRecordShot && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Shots Recorded</span>
                <span>{myRecentShots.length}/3</span>
              </div>
              <Progress value={getProgressValue()} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Shots */}
      {myRecentShots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Your Recent Shots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Best Shot Highlight */}
            {bestShot && (
              <div className="p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-yellow-800">Best Shot</div>
                    <div className="text-sm text-yellow-700">
                      {bestShot.distanceYards.toFixed(1)} yards • {bestShot.measurement.confidence.toUpperCase()}
                    </div>
                  </div>
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            )}

            <Separator />

            {/* All Recent Shots */}
            {myRecentShots.map((shot, index) => (
              <div key={shot.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {shot.distanceYards.toFixed(1)} yards
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(shot.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    shot.measurement.confidence === 'high' ? 'default' : 
                    shot.measurement.confidence === 'medium' ? 'secondary' : 'outline'
                  } className="text-xs">
                    {shot.measurement.confidence.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {shot.measurement.method === 'enhanced-ar' ? 'Enhanced AR' : 
                     shot.measurement.method === 'ar-camera' ? 'AR Camera' : 'GPS'}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Features Info */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800 mb-1">Enhanced AR Features</div>
              <ul className="text-yellow-700 space-y-1">
                <li>• Multi-sample GPS averaging for better accuracy</li>
                <li>• Device sensor fusion (orientation, motion)</li>
                <li>• Outlier detection and measurement stabilization</li>
                <li>• Confidence scoring based on multiple factors</li>
                <li>• Visual photo overlays with measurement data</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedShotTracker;