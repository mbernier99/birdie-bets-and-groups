import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Camera, 
  MapPin, 
  Target, 
  Activity,
  Ruler
} from 'lucide-react';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { Shot } from '@/hooks/useGolfRound';

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

const EnhancedShotTracker: React.FC<EnhancedShotTrackerProps> = ({
  currentHole,
  onRecordShot,
  shots,
  roundId
}) => {
  const [shotType, setShotType] = useState<Shot['shot_type']>('drive');
  const [club, setClub] = useState<string>('');
  const [accuracy, setAccuracy] = useState<Shot['accuracy']>();
  const [distance, setDistance] = useState<number>();
  const [notes, setNotes] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  
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

  const handleRecordShot = async (withPhoto: boolean = false) => {
    if (!isLocationEnabled) {
      alert('Location services are required to record shots');
      return;
    }
    
    setIsRecording(true);
    try {
      const location = await getCurrentLocation();
      if (!location) {
        alert('Could not get current location');
        return;
      }
      
      let photoUrl;
      if (withPhoto) {
        photoUrl = await takePhoto();
      }
      
      await onRecordShot(
        currentHole,
        nextShotNumber,
        location.latitude,
        location.longitude,
        shotType,
        club || undefined,
        accuracy,
        distance,
        photoUrl || undefined,
        notes || undefined
      );
      
      // Reset form for next shot
      setNotes('');
      setDistance(undefined);
      setAccuracy(undefined);
      
    } catch (error) {
      console.error('Error recording shot:', error);
      alert('Failed to record shot');
    } finally {
      setIsRecording(false);
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

  return (
    <div className="space-y-4">
      {/* Shot Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Shot #{nextShotNumber} - Hole {currentHole}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shot Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Shot Type</label>
            <Select value={shotType} onValueChange={(value) => setShotType(value as Shot['shot_type'])}>
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
            <Select value={club} onValueChange={setClub}>
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

          {/* Accuracy */}
          <div>
            <label className="text-sm font-medium mb-2 block">Result</label>
            <Select value={accuracy || ''} onValueChange={(value) => setAccuracy(value as Shot['accuracy'] || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Select result" />
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

          {/* Distance */}
          <div>
            <label className="text-sm font-medium mb-2 block">Distance (yards)</label>
            <input
              type="number"
              value={distance || ''}
              onChange={(e) => setDistance(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full p-2 border border-input rounded-md"
              placeholder="Enter distance"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this shot..."
              rows={2}
            />
          </div>

          {/* Record Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleRecordShot(false)}
              disabled={isRecording || !isLocationEnabled}
              className="flex items-center"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {isRecording ? 'Recording...' : 'Record Shot'}
            </Button>
            
            <Button
              onClick={() => handleRecordShot(true)}
              disabled={isRecording || !isLocationEnabled}
              variant="outline"
              className="flex items-center"
            >
              <Camera className="h-4 w-4 mr-2" />
              With Photo
            </Button>
          </div>
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
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-orange-700">
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-sm">Location services are required for shot tracking</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedShotTracker;