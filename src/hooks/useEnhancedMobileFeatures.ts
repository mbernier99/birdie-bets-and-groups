import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';
import { Device } from '@capacitor/device';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface EnhancedLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface DeviceSensorData {
  orientation?: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  motion?: {
    acceleration: { x: number; y: number; z: number };
    accelerationIncludingGravity: { x: number; y: number; z: number };
    rotationRate: { alpha: number; beta: number; gamma: number };
  };
  compass?: {
    magneticHeading: number;
    trueHeading?: number;
    headingAccuracy?: number;
  };
}

export interface EnhancedCameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
  saveToGallery?: boolean;
  width?: number;
  height?: number;
}

const useEnhancedMobileFeatures = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [sensorData, setSensorData] = useState<DeviceSensorData>({});
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    checkIfMobile();
    initializeSensors();
  }, []);

  const checkIfMobile = async () => {
    const mobile = Capacitor.isNativePlatform();
    setIsMobile(mobile);
    
    if (mobile) {
      try {
        const info = await Device.getInfo();
        setDeviceInfo(info);
      } catch (error) {
        console.error('Error getting device info:', error);
      }
    }
  };

  const initializeSensors = () => {
    // Device Orientation (Compass + Tilt)
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        setSensorData(prev => ({
          ...prev,
          orientation: {
            alpha: event.alpha || 0, // Compass heading
            beta: event.beta || 0,   // Front-to-back tilt
            gamma: event.gamma || 0  // Left-to-right tilt
          }
        }));
      };

      // Request permission for iOS 13+
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }

    // Device Motion (Accelerometer + Gyroscope)
    if ('DeviceMotionEvent' in window) {
      const handleMotion = (event: DeviceMotionEvent) => {
        if (event.acceleration && event.rotationRate) {
          setSensorData(prev => ({
            ...prev,
            motion: {
              acceleration: event.acceleration as { x: number; y: number; z: number },
              accelerationIncludingGravity: event.accelerationIncludingGravity as { x: number; y: number; z: number },
              rotationRate: event.rotationRate as { alpha: number; beta: number; gamma: number }
            }
          }));
        }
      };

      // Request permission for iOS 13+
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        (DeviceMotionEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (isMobile) {
        const permissions = await Geolocation.requestPermissions();
        const granted = permissions.location === 'granted';
        setLocationPermission(granted ? 'granted' : 'denied');
        return granted;
      } else {
        // Web browser
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(permission.state as any);
        return permission.state === 'granted';
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission('denied');
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (isMobile) {
        // Camera permission is handled automatically by Capacitor when taking photos
        setCameraPermission('granted');
        return true;
      } else {
        // Web browser
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setCameraPermission('granted');
          return true;
        } catch {
          setCameraPermission('denied');
          return false;
        }
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setCameraPermission('denied');
      return false;
    }
  };

  const getEnhancedLocation = async (options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<EnhancedLocationData | null> => {
    try {
      if (locationPermission !== 'granted') {
        const granted = await requestLocationPermission();
        if (!granted) return null;
      }

      if (isMobile) {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
          maximumAge: options?.maximumAge ?? 5000
        });

        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          timestamp: position.timestamp
        };
      } else {
        // Web browser
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude || undefined,
                altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
                heading: position.coords.heading || undefined,
                speed: position.coords.speed || undefined,
                timestamp: position.timestamp
              });
            },
            (error) => {
              console.error('Web geolocation error:', error);
              reject(error);
            },
            {
              enableHighAccuracy: options?.enableHighAccuracy ?? true,
              timeout: options?.timeout ?? 10000,
              maximumAge: options?.maximumAge ?? 5000
            }
          );
        });
      }
    } catch (error) {
      console.error('Error getting enhanced location:', error);
      return null;
    }
  };

  const takeEnhancedPhoto = async (options?: EnhancedCameraOptions): Promise<string | null> => {
    try {
      if (cameraPermission !== 'granted') {
        const granted = await requestCameraPermission();
        if (!granted) return null;
      }

      if (isMobile) {
        const image = await Camera.getPhoto({
          quality: options?.quality ?? 90,
          allowEditing: options?.allowEditing ?? false,
          resultType: options?.resultType ?? CameraResultType.DataUrl,
          source: options?.source ?? CameraSource.Camera,
          saveToGallery: options?.saveToGallery ?? false,
          width: options?.width,
          height: options?.height
        });

        return image.dataUrl || image.webPath || null;
      } else {
        // Web browser - simplified photo capture
        console.log('Web photo capture not implemented - would use getUserMedia');
        return null;
      }
    } catch (error) {
      console.error('Error taking enhanced photo:', error);
      return null;
    }
  };

  const saveToEnhancedStorage = async (key: string, value: any): Promise<boolean> => {
    try {
      if (isMobile) {
        await Preferences.set({
          key,
          value: JSON.stringify(value)
        });
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Error saving to enhanced storage:', error);
      return false;
    }
  };

  const getFromEnhancedStorage = async (key: string): Promise<any | null> => {
    try {
      if (isMobile) {
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      } else {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      console.error('Error getting from enhanced storage:', error);
      return null;
    }
  };

  const triggerHapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> => {
    try {
      if (isMobile) {
        const impactStyle = style === 'light' ? ImpactStyle.Light :
                           style === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Medium;
        await Haptics.impact({ style: impactStyle });
      } else {
        // Web vibration API fallback
        if ('vibrate' in navigator) {
          const duration = style === 'light' ? 50 : style === 'heavy' ? 200 : 100;
          navigator.vibrate(duration);
        }
      }
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  };

  const watchEnhancedLocation = useCallback((
    callback: (location: EnhancedLocationData) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }
  ) => {
    if (isMobile) {
      let watchId: string;
      
      Geolocation.watchPosition(
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
          maximumAge: options?.maximumAge ?? 5000
        },
        (position) => {
          if (position) {
            callback({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              timestamp: position.timestamp
            });
          }
        }
      ).then((id) => {
        watchId = id;
      });

      return () => {
        if (watchId) {
          Geolocation.clearWatch({ id: watchId });
        }
      };
    } else {
      // Web browser
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp
          });
        },
        (error) => console.error('Web location watch error:', error),
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 10000,
          maximumAge: options?.maximumAge ?? 5000
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [isMobile]);

  return {
    // Device info
    isMobile,
    deviceInfo,
    sensorData,
    
    // Permissions
    locationPermission,
    cameraPermission,
    requestLocationPermission,
    requestCameraPermission,
    
    // Enhanced location services
    getEnhancedLocation,
    watchEnhancedLocation,
    
    // Enhanced camera
    takeEnhancedPhoto,
    
    // Enhanced storage
    saveToEnhancedStorage,
    getFromEnhancedStorage,
    
    // Haptic feedback
    triggerHapticFeedback
  };
};

export default useEnhancedMobileFeatures;