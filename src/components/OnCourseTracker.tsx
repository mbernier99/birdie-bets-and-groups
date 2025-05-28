
import React, { useState, useEffect } from 'react';
import { MapPin, Camera, Target, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobileFeatures, LocationData } from '../hooks/useMobileFeatures';

interface Shot {
  id: string;
  hole: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  photo?: string;
  distance?: number;
}

const OnCourseTracker = () => {
  const {
    location,
    isLocationEnabled,
    isMobile,
    getCurrentLocation,
    takePhoto,
    saveToStorage,
    getFromStorage,
    watchLocation
  } = useMobileFeatures();

  const [currentHole, setCurrentHole] = useState(1);
  const [shots, setShots] = useState<Shot[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    loadSavedShots();
  }, []);

  const loadSavedShots = async () => {
    const savedShots = await getFromStorage('golf-shots');
    if (savedShots) {
      setShots(savedShots);
    }
  };

  const saveShots = async (newShots: Shot[]) => {
    await saveToStorage('golf-shots', newShots);
  };

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
      // Clear the watch ID
      if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      setWatchId(null);
    }
  };

  const recordShot = async () => {
    const currentLocation = await getCurrentLocation();
    if (!currentLocation) return;

    const shot: Shot = {
      id: Date.now().toString(),
      hole: currentHole,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      timestamp: currentLocation.timestamp
    };

    const newShots = [...shots, shot];
    setShots(newShots);
    await saveShots(newShots);
  };

  const recordShotWithPhoto = async () => {
    const photo = await takePhoto();
    const currentLocation = await getCurrentLocation();
    
    if (!currentLocation) return;

    const shot: Shot = {
      id: Date.now().toString(),
      hole: currentHole,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      timestamp: currentLocation.timestamp,
      photo: photo || undefined
    };

    const newShots = [...shots, shot];
    setShots(newShots);
    await saveShots(newShots);
  };

  const calculateDistance = (shot1: Shot, shot2: Shot): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (shot1.latitude * Math.PI) / 180;
    const φ2 = (shot2.latitude * Math.PI) / 180;
    const Δφ = ((shot2.latitude - shot1.latitude) * Math.PI) / 180;
    const Δλ = ((shot2.longitude - shot1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  if (!isMobile) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">On-course tracking is available in the mobile app</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">On-Course Tracker</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Hole</span>
          <select
            value={currentHole}
            onChange={(e) => setCurrentHole(Number(e.target.value))}
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

      {/* Location Status */}
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className={`h-5 w-5 ${isLocationEnabled ? 'text-green-600' : 'text-red-600'}`} />
        <span className={`text-sm ${isLocationEnabled ? 'text-green-600' : 'text-red-600'}`}>
          {isLocationEnabled ? 'GPS Active' : 'GPS Disabled'}
        </span>
        {location && (
          <span className="text-xs text-gray-500">
            Accuracy: {location.accuracy.toFixed(0)}m
          </span>
        )}
      </div>

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
          onClick={async () => {
            const currentLocation = await getCurrentLocation();
            if (!currentLocation) return;

            const shot: Shot = {
              id: Date.now().toString(),
              hole: currentHole,
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              timestamp: currentLocation.timestamp
            };

            const newShots = [...shots, shot];
            setShots(newShots);
            await saveShots(newShots);
          }}
          disabled={!isLocationEnabled}
          variant="outline"
        >
          <Target className="h-4 w-4 mr-2" />
          Record Shot
        </Button>
      </div>

      {/* Photo Shot */}
      <Button
        onClick={async () => {
          const photo = await takePhoto();
          const currentLocation = await getCurrentLocation();
          
          if (!currentLocation) return;

          const shot: Shot = {
            id: Date.now().toString(),
            hole: currentHole,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: currentLocation.timestamp,
            photo: photo || undefined
          };

          const newShots = [...shots, shot];
          setShots(newShots);
          await saveShots(newShots);
        }}
        disabled={!isLocationEnabled}
        className="w-full mb-6 bg-blue-600 hover:bg-blue-700"
      >
        <Camera className="h-4 w-4 mr-2" />
        Record Shot with Photo
      </Button>

      {/* Shot History */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Recent Shots</h3>
        {shots.filter(shot => shot.hole === currentHole).slice(-3).map((shot, index, arr) => {
          const calculateDistance = (shot1: Shot, shot2: Shot): number => {
            const R = 6371e3; // Earth's radius in meters
            const φ1 = (shot1.latitude * Math.PI) / 180;
            const φ2 = (shot2.latitude * Math.PI) / 180;
            const Δφ = ((shot2.latitude - shot1.latitude) * Math.PI) / 180;
            const Δλ = ((shot2.longitude - shot1.longitude) * Math.PI) / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c; // Distance in meters
          };

          return (
            <div key={shot.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Shot {index + 1} - Hole {shot.hole}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(shot.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {index > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  Distance: {calculateDistance(arr[index - 1], shot).toFixed(0)}m
                </div>
              )}
              {shot.photo && (
                <div className="mt-2">
                  <img
                    src={`data:image/jpeg;base64,${shot.photo}`}
                    alt="Shot"
                    className="w-16 h-16 rounded object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnCourseTracker;
