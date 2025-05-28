
import { useState, useEffect } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export const useMobileFeatures = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    checkIfMobile();
    requestLocationPermission();
  }, []);

  const checkIfMobile = async () => {
    try {
      const info = await Device.getInfo();
      setIsMobile(info.platform !== 'web');
    } catch (error) {
      console.log('Running on web platform');
      setIsMobile(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permission = await Geolocation.requestPermissions();
      setIsLocationEnabled(permission.location === 'granted');
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setIsLocationEnabled(false);
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    if (!isLocationEnabled) {
      await requestLocationPermission();
    }

    try {
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      setLocation(locationData);
      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      return image.base64String;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  };

  const saveToStorage = async (key: string, value: any) => {
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const getFromStorage = async (key: string) => {
    try {
      const result = await Preferences.get({ key });
      return result.value ? JSON.parse(result.value) : null;
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  };

  const watchLocation = (callback: (location: LocationData) => void) => {
    if (!isLocationEnabled) return null;

    return Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 30000
      },
      (position, error) => {
        if (error) {
          console.error('Error watching location:', error);
          return;
        }

        if (position) {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          setLocation(locationData);
          callback(locationData);
        }
      }
    );
  };

  return {
    location,
    isLocationEnabled,
    isMobile,
    getCurrentLocation,
    takePhoto,
    saveToStorage,
    getFromStorage,
    watchLocation,
    requestLocationPermission
  };
};
