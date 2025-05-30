
import React, { useState } from 'react';
import { Navigation, Target, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobileFeatures, LocationData } from '../hooks/useMobileFeatures';
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
  isLocationEnabled,
  location
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { watchLocation } = useMobileFeatures();

  const startTracking = () => {
    if (!isLocationEnabled) return;

    setIsTracking(true);
    const id = watchLocation((location: LocationData) => {
      console.log('Location updated:', location);
    });
    
    if (id && typeof id === 'number') {
      setWatchId(id);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (watchId) {
      if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      setWatchId(null);
    }
  };

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

      <LocationStatus isLocationEnabled={isLocationEnabled} location={location} />

      {/* Tracking Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          onClick={isTracking ? stopTracking : startTracking}
          disabled={!isLocationEnabled}
          className={`${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </Button>

        <Button
          onClick={onRecordShot}
          disabled={!isLocationEnabled}
          variant="outline"
        >
          <Target className="h-4 w-4 mr-2" />
          Record Shot
        </Button>
      </div>

      {/* Photo Shot */}
      <Button
        onClick={onRecordShotWithPhoto}
        disabled={!isLocationEnabled}
        className="w-full mb-6 bg-blue-600 hover:bg-blue-700"
      >
        <Camera className="h-4 w-4 mr-2" />
        Record Shot with Photo
      </Button>
    </div>
  );
};

export default ShotTracker;
