import React, { useState } from 'react';
import { Navigation, Target, Camera, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOptimizedGPS, LocationData } from '../hooks/useOptimizedGPS';
import { getCoursePosition } from '../utils/gpsCalculations';
import LocationStatus from './LocationStatus';

interface ShotTrackerProps {
  currentHole: number;
  onRecordShot: () => void;
  onRecordShotWithPhoto: () => void;
  isLocationEnabled: boolean;
  location: LocationData | null;
}

const ShotTracker: React.FC<ShotTrackerProps> = ({
  currentHole,
  onRecordShot,
  onRecordShotWithPhoto,
  isLocationEnabled: propIsLocationEnabled,
  location: propLocation
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const { location: gpsLocation, isLocationEnabled } = useOptimizedGPS({ 
    accuracy: 'medium', 
    mode: isTracking ? 'tracking' : 'idle'
  });

  // Mock course data - would come from props in real implementation
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

  const startTracking = () => {
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  // Get current position for display
  const currentLocation = gpsLocation || propLocation;
  const currentPosition = currentLocation ? getCoursePosition(currentLocation, currentHole, courseHoles) : null;

  const getPositionColor = (area: string) => {
    switch (area) {
      case 'tee': return 'bg-blue-100 text-blue-800';
      case 'fairway': return 'bg-green-100 text-green-800';
      case 'rough': return 'bg-yellow-100 text-yellow-800';
      case 'green': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const locationEnabled = isLocationEnabled || propIsLocationEnabled;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Shot Tracker</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Hole</span>
          <select
            value={currentHole}
            onChange={() => {}} // This will be handled by parent
            className="border rounded px-2 py-1"
          >
            {Array.from({ length: 18 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      <LocationStatus isLocationEnabled={locationEnabled} location={currentLocation} />

      {/* Enhanced Position Display */}
      {currentPosition && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <span className="font-medium">Course Position</span>
            </div>
            <Badge className={getPositionColor(currentPosition.area)}>
              {currentPosition.area.charAt(0).toUpperCase() + currentPosition.area.slice(1)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            {currentPosition.distanceToTee && (
              <div>Tee: {currentPosition.distanceToTee.toFixed(0)}m</div>
            )}
            {currentPosition.distanceToPin && (
              <div>Pin: {currentPosition.distanceToPin.toFixed(0)}m</div>
            )}
          </div>
        </div>
      )}

      {/* Tracking Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          onClick={isTracking ? stopTracking : startTracking}
          disabled={!locationEnabled}
          className={`${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Button>

        <Button
          onClick={onRecordShot}
          disabled={!locationEnabled}
          variant="outline"
        >
          <Target className="h-4 w-4 mr-2" />
          Record Shot
        </Button>
      </div>

      {/* Enhanced Shot Recording */}
      <div className="space-y-2">
        <Button
          onClick={onRecordShotWithPhoto}
          disabled={!locationEnabled}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Camera className="h-4 w-4 mr-2" />
          Record Shot with Photo
        </Button>

        {currentLocation && currentPosition && (
          <div className="text-xs text-gray-500 text-center">
            GPS Accuracy: ±{currentLocation.accuracy.toFixed(0)}m
            {currentPosition.area === 'tee' && ' • Perfect for drive bets'}
            {currentPosition.area === 'green' && ' • Great for putting challenges'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShotTracker;