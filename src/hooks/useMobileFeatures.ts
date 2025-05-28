
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

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
      setIsMobile(Capacitor.isNativePlatform());
      
      // Only import Device if we're on a native platform
      if (Capacitor.isNativePlatform()) {
        const { Device } = await import('@capacitor/device');
        const info = await Device.getInfo();
        setIsMobile(info.platform !== 'web');
      }
    } catch (error) {
      console.log('Running on web platform');
      setIsMobile(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permission = await Geolocation.requestPermissions();
        setIsLocationEnabled(permission.location === 'granted');
      } else {
        // For web, check if geolocation is available
        setIsLocationEnabled('geolocation' in navigator);
      }
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
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const position = await Geolocation.getCurrentPosition({
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
      } else {
        // Fallback to web geolocation API
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationData: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              };
              setLocation(locationData);
              resolve(locationData);
            },
            (error) => {
              console.error('Error getting location:', error);
              reject(null);
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const takePhoto = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera
        });

        return image.base64String;
      } else {
        console.log('Camera not available on web platform');
        return null;
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  };

  const saveToStorage = async (key: string, value: any) => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Preferences } = await import('@capacitor/preferences');
        await Preferences.set({
          key,
          value: JSON.stringify(value)
        });
      } else {
        // Fallback to localStorage on web
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const getFromStorage = async (key: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Preferences } = await import('@capacitor/preferences');
        const result = await Preferences.get({ key });
        return result.value ? JSON.parse(result.value) : null;
      } else {
        // Fallback to localStorage on web
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  };

  const watchLocation = (callback: (location: LocationData) => void) => {
    if (!isLocationEnabled) return null;

    if (Capacitor.isNativePlatform()) {
      import('@capacitor/geolocation').then(({ Geolocation }) => {
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
      });
    } else {
      // Fallback to web geolocation API
      return navigator.geolocation.watchPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocation(locationData);
          callback(locationData);
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        { enableHighAccuracy: true, timeout: 30000 }
      );
    }

    return null;
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
