
import React from 'react';
import { MapPin } from 'lucide-react';
import { LocationData } from '../hooks/useMobileFeatures';

interface LocationStatusProps {
  isLocationEnabled: boolean;
  location: LocationData | null;
}

const LocationStatus: React.FC<LocationStatusProps> = ({ isLocationEnabled, location }) => {
  return (
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
  );
};

export default LocationStatus;
