import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  MapPin, 
  Target, 
  Activity,
  Ruler,
  Navigation,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useMobileFeatures, LocationData } from '@/hooks/useMobileFeatures';
import { Shot } from '@/hooks/useGolfRound';
import { calculateDistance } from '@/utils/gpsCalculations';

interface EnhancedShotTrackerProps {
  currentHole: number;
  onRecordShot: (
    holeNumber: number,
    shotNumber: number,
    latitude: number,
    longitude: number,
    shotType: Shot['shot_type'],
    club?: string,
    accuracy?: Shot['accuracy'],
    distanceYards?: number,
    photoUrl?: string,
    notes?: string
  ) => void;
  shots: Shot[];
  roundId?: string;
}

const CLUBS = [
  'Driver', '3 Wood', '5 Wood', '3 Hybrid', '4 Hybrid', '5 Hybrid',
  '3 Iron', '4 Iron', '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron',
  'PW', 'AW', 'SW', 'LW', 'Putter'
];

const SHOT_TYPES: Array<{ value: Shot['shot_type']; label: string }> = [
  { value: 'drive', label: 'Drive' },
  { value: 'approach', label: 'Approach' },
  { value: 'chip', label: 'Chip' },
  { value: 'putt', label: 'Putt' },
  { value: 'penalty', label: 'Penalty' }
];

const ACCURACY_OPTIONS: Array<{ value: Shot['accuracy']; label: string }> = [
  { value: 'fairway', label: 'Fairway' },
  { value: 'rough', label: 'Rough' },
  { value: 'bunker', label: 'Bunker' },
  { value: 'water', label: 'Water' },
  { value: 'green', label: 'Green' },
  { value: 'pin', label: 'Pin' }
];

type ShotTrackingState = 'setup' | 'capturing-start' | 'ready-to-hit' | 'capturing-end' | 'complete';

const EnhancedShotTracker: React.FC<EnhancedShotTrackerProps> = ({
  currentHole,
  onRecordShot,
  shots,
  roundId
}) => {
  const [shotType, setShotType] = useState<Shot['shot_type']>('drive');
  const [club, setClub] = useState<string>('');
  const [accuracy, setAccuracy] = useState<Shot['accuracy']>();
  const [notes, setNotes] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  
  // Enhanced tracking states
  const [trackingState, setTrackingState] = useState<ShotTrackingState>('setup');
  const [startLocation, setStartLocation] = useState<LocationData | null>(null);
  const [endLocation, setEndLocation] = useState<LocationData | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  
  const { getCurrentLocation, takePhoto, isLocationEnabled } = useMobileFeatures();
  
  const currentHoleShots = shots.filter(shot => shot.hole_number === currentHole);
  const nextShotNumber = currentHoleShots.length + 1;
  
  // Auto-suggest shot type based on shot number
  useEffect(() => {
    if (nextShotNumber === 1) {
      setShotType('drive');
      setClub('Driver');
    } else if (nextShotNumber > 1 && currentHoleShots.length > 0) {
      const lastShot = currentHoleShots[currentHoleShots.length - 1];
      if (lastShot.accuracy === 'green') {
        setShotType('putt');
        setClub('Putter');
      } else {
        setShotType('approach');
        setClub('');
      }
    }
  }, [nextShotNumber, currentHoleShots]);

  // Calculate distance when both locations are available
  useEffect(() => {
    if (startLocation && endLocation) {
      const distanceMeters = calculateDistance(startLocation, endLocation);
      const distanceYards = Math.round(distanceMeters * 1.09361); // Convert to yards
      setCalculatedDistance(distanceYards);
    }
  }, [startLocation, endLocation]);

  const handleCaptureStartLocation = async () => {
    if (!isLocationEnabled) {
      alert('Location services are required to record shots');
      return;
    }
    
    setTrackingState('capturing-start');
    try {
      const location = await getCurrentLocation();
      if (!location) {
        alert('Could not get current location');
        setTrackingState('setup');
        return;
      }
      
      setStartLocation(location);
      setTrackingState('ready-to-hit');
    } catch (error) {
      console.error('Error capturing start location:', error);
      alert('Failed to capture start location');
      setTrackingState('setup');
    }
  };

  const handleCaptureEndLocation = async (withPhoto: boolean = false) => {
    if (!startLocation) {
      alert('Please capture start location first');
      return;
    }
    
    setTrackingState('capturing-end');
    setIsRecording(true);
    
    try {
      const location = await getCurrentLocation();
      if (!location) {
        alert('Could not get current location');
        setTrackingState('ready-to-hit');
        setIsRecording(false);
        return;
      }
      
      setEndLocation(location);
      
      let photoUrl;
      if (withPhoto) {
        photoUrl = await takePhoto();
      }
      
      // Calculate distance for recording
      const distanceMeters = calculateDistance(startLocation, location);
      const distanceYards = Math.round(distanceMeters * 1.09361);
      
      await onRecordShot(
        currentHole,
        nextShotNumber,
        location.latitude,
        location.longitude,
        shotType,
        club || undefined,
        accuracy,
        distanceYards,
        photoUrl || undefined,
        notes || undefined
      );
      
      setTrackingState('complete');
      
      // Reset for next shot after a delay
      setTimeout(() => {
        resetForNextShot();
      }, 2000);
      
    } catch (error) {
      console.error('Error recording shot:', error);
      alert('Failed to record shot');
      setTrackingState('ready-to-hit');
    } finally {
      setIsRecording(false);
    }
  };

  const resetForNextShot = () => {
    setTrackingState('setup');
    setStartLocation(null);
    setEndLocation(null);
    setCalculatedDistance(null);
    setNotes('');
    setAccuracy(undefined);
  };

  const getTrackingStatePrompt = () => {
    switch (trackingState) {
      case 'setup':
        return {
          icon: <Target className="h-5 w-5" />,
          title: "Setup Your Shot",
          description: "Select your club and shot type, then capture your starting position",
          variant: "default" as const
        };
      case 'capturing-start':
        return {
          icon: <Navigation className="h-5 w-5 animate-pulse" />,
          title: "Capturing Start Position...",
          description: "Getting your current GPS location",
          variant: "default" as const
        };
      case 'ready-to-hit':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          title: "Ready to Hit!",
          description: "Take your shot, then capture the ball's final position",
          variant: "default" as const
        };
      case 'capturing-end':
        return {
          icon: <MapPin className="h-5 w-5 animate-pulse" />,
          title: "Recording Shot...",
          description: "Capturing ball position and calculating distance",
          variant: "default" as const
        };
      case 'complete':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          title: "Shot Recorded!",
          description: `Distance: ${calculatedDistance} yards`,
          variant: "default" as const
        };
    }
  };

  const getShotTypeColor = (type: Shot['shot_type']) => {
    switch (type) {
      case 'drive': return 'bg-blue-500';
      case 'approach': return 'bg-green-500';
      case 'chip': return 'bg-orange-500';
      case 'putt': return 'bg-purple-500';
      case 'penalty': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const prompt = getTrackingStatePrompt();

  return (
    <div className="space-y-4">
      {/* Tracking Status */}
      <Alert className={trackingState === 'complete' ? 'border-green-200 bg-green-50' : ''}>
        <div className="flex items-center">
          {prompt.icon}
          <AlertDescription className="ml-2">
            <div className="font-medium">{prompt.title}</div>
            <div className="text-sm text-muted-foreground">{prompt.description}</div>
          </AlertDescription>
        </div>
      </Alert>

      {/* Shot Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Shot #{nextShotNumber} - Hole {currentHole}
            </div>
            {startLocation && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Start Position Set
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shot Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Shot Type</label>
            <Select 
              value={shotType} 
              onValueChange={(value) => setShotType(value as Shot['shot_type'])}
              disabled={trackingState !== 'setup'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHOT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Club Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Club</label>
            <Select 
              value={club} 
              onValueChange={setClub}
              disabled={trackingState !== 'setup'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select club" />
              </SelectTrigger>
              <SelectContent>
                {CLUBS.map((clubName) => (
                  <SelectItem key={clubName} value={clubName}>
                    {clubName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Location Capture */}
          {trackingState === 'setup' && (
            <Button
              onClick={handleCaptureStartLocation}
              disabled={!isLocationEnabled}
              className="w-full flex items-center justify-center"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Capture Start Position
            </Button>
          )}

          {/* Distance Display */}
          {calculatedDistance && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center">
                <Ruler className="h-4 w-4 mr-2" />
                <span className="text-lg font-semibold">{calculatedDistance} yards</span>
              </div>
            </div>
          )}

          {/* Result and Notes (shown after ready to hit) */}
          {trackingState === 'ready-to-hit' && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Expected Result</label>
                <Select value={accuracy || ''} onValueChange={(value) => setAccuracy(value as Shot['accuracy'] || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expected result" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCURACY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this shot..."
                  rows={2}
                />
              </div>

              {/* End Location Capture Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleCaptureEndLocation(false)}
                  disabled={isRecording || !isLocationEnabled}
                  className="flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {isRecording ? 'Recording...' : 'Record Final Position'}
                </Button>
                
                <Button
                  onClick={() => handleCaptureEndLocation(true)}
                  disabled={isRecording || !isLocationEnabled}
                  variant="outline"
                  className="flex items-center"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  With Photo
                </Button>
              </div>
            </>
          )}

          {/* Reset Button */}
          {(trackingState === 'ready-to-hit' || trackingState === 'complete') && (
            <Button
              onClick={resetForNextShot}
              variant="outline"
              className="w-full"
            >
              Reset for Next Shot
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Shot History for Current Hole */}
      {currentHoleShots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Hole {currentHole} Shots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentHoleShots.map((shot, index) => (
                <div key={shot.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className={getShotTypeColor(shot.shot_type)}>
                      #{shot.shot_number}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {shot.club && `${shot.club} - `}{SHOT_TYPES.find(t => t.value === shot.shot_type)?.label}
                      </div>
                      {shot.accuracy && (
                        <div className="text-sm text-muted-foreground">
                          Result: {ACCURACY_OPTIONS.find(a => a.value === shot.accuracy)?.label}
                        </div>
                      )}
                      {shot.distance_yards && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Ruler className="h-3 w-3 mr-1" />
                          {shot.distance_yards} yards
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(shot.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {!isLocationEnabled && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Location services are required for shot tracking. Please enable location access.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedShotTracker;