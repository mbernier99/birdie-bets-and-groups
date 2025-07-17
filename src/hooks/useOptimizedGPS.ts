import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export type GPSAccuracy = 'low' | 'medium' | 'high';
export type GPSMode = 'idle' | 'tracking' | 'betting' | 'navigation';

interface GPSOptions {
  accuracy: GPSAccuracy;
  mode: GPSMode;
  interval?: number; // milliseconds between updates
  timeout?: number;
}

interface GPSSubscriber {
  id: string;
  callback: (location: LocationData) => void;
  options: GPSOptions;
}

// Global GPS manager singleton
class GPSManager {
  private subscribers: Map<string, GPSSubscriber> = new Map();
  private watchId: number | null = null;
  private lastLocation: LocationData | null = null;
  private lastUpdateTime: number = 0;
  private isWatching = false;
  private debounceTimer: NodeJS.Timeout | null = null;

  private getAccuracySettings(accuracy: GPSAccuracy) {
    switch (accuracy) {
      case 'low':
        return { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 };
      case 'medium':
        return { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 };
      case 'high':
        return { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 };
      default:
        return { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 };
    }
  }

  private getMinInterval(mode: GPSMode): number {
    switch (mode) {
      case 'idle':
        return 60000; // 1 minute for idle
      case 'tracking':
        return 10000; // 10 seconds for general tracking
      case 'betting':
        return 3000; // 3 seconds for active betting
      case 'navigation':
        return 5000; // 5 seconds for navigation
      default:
        return 10000;
    }
  }

  private shouldUpdate(options: GPSOptions): boolean {
    if (!this.lastLocation) return true;
    
    const now = Date.now();
    const minInterval = Math.max(
      options.interval || this.getMinInterval(options.mode),
      this.getMinInterval(options.mode)
    );
    
    return (now - this.lastUpdateTime) >= minInterval;
  }

  private async requestLocationPermission(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permission = await Geolocation.requestPermissions();
        return permission.location === 'granted';
      } else {
        return 'geolocation' in navigator;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  private async startWatching() {
    if (this.isWatching) return;
    
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) return;

    this.isWatching = true;

    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        // Use medium accuracy as default for watching
        const options = this.getAccuracySettings('medium');
        
        const watchResult = await Geolocation.watchPosition(
          options,
          (position, error) => {
            if (error) {
              console.error('GPS watch error:', error);
              return;
            }

            if (position) {
              this.handleLocationUpdate({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              });
            }
          }
        );
        this.watchId = typeof watchResult === 'string' ? parseInt(watchResult) : watchResult;
      } else {
        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            this.handleLocationUpdate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            });
          },
          (error) => console.error('GPS watch error:', error),
          this.getAccuracySettings('medium')
        );
      }
    } catch (error) {
      console.error('Error starting GPS watch:', error);
      this.isWatching = false;
    }
  }

  private stopWatching() {
    if (!this.isWatching || this.watchId === null) return;

    try {
      if (Capacitor.isNativePlatform()) {
        import('@capacitor/geolocation').then(({ Geolocation }) => {
          Geolocation.clearWatch({ id: this.watchId!.toString() });
        });
      } else {
        navigator.geolocation.clearWatch(this.watchId);
      }
    } catch (error) {
      console.error('Error stopping GPS watch:', error);
    }

    this.watchId = null;
    this.isWatching = false;
  }

  private handleLocationUpdate(location: LocationData) {
    // Debounce rapid updates to prevent excessive re-renders
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.lastLocation = location;
      this.lastUpdateTime = Date.now();

      // Notify subscribers based on their requirements
      this.subscribers.forEach((subscriber) => {
        if (this.shouldUpdate(subscriber.options)) {
          subscriber.callback(location);
        }
      });
    }, 200); // 200ms debounce
  }

  async getCurrentLocation(options: GPSOptions): Promise<LocationData | null> {
    // Return cached location if recent enough and not high accuracy
    if (this.lastLocation && options.accuracy !== 'high') {
      const age = Date.now() - this.lastLocation.timestamp;
      const maxAge = options.accuracy === 'low' ? 60000 : 30000; // 1 min for low, 30s for medium
      
      if (age < maxAge) {
        return this.lastLocation;
      }
    }

    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) return null;

    try {
      const settings = this.getAccuracySettings(options.accuracy);

      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const position = await Geolocation.getCurrentPosition(settings);

        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        this.lastLocation = locationData;
        this.lastUpdateTime = Date.now();
        return locationData;
      } else {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const locationData: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              };

              this.lastLocation = locationData;
              this.lastUpdateTime = Date.now();
              resolve(locationData);
            },
            () => resolve(null),
            settings
          );
        });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  subscribe(id: string, callback: (location: LocationData) => void, options: GPSOptions): () => void {
    this.subscribers.set(id, { id, callback, options });

    // Start watching if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.startWatching();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(id);
      
      // Stop watching if no more subscribers
      if (this.subscribers.size === 0) {
        this.stopWatching();
      }
    };
  }

  getLastKnownLocation(): LocationData | null {
    return this.lastLocation;
  }

  isLocationEnabled(): boolean {
    return this.isWatching || this.lastLocation !== null;
  }
}

// Global instance
const gpsManager = new GPSManager();

// React hook interface
export const useOptimizedGPS = (options: Partial<GPSOptions> = {}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const subscriberIdRef = useRef<string>(`gps-${Math.random().toString(36).substr(2, 9)}`);

  const defaultOptions: GPSOptions = {
    accuracy: 'medium',
    mode: 'tracking',
    ...options
  };

  useEffect(() => {
    const unsubscribe = gpsManager.subscribe(
      subscriberIdRef.current,
      (newLocation) => {
        setLocation(newLocation);
        setIsEnabled(true);
      },
      defaultOptions
    );

    // Check if we already have a location
    const lastKnown = gpsManager.getLastKnownLocation();
    if (lastKnown) {
      setLocation(lastKnown);
      setIsEnabled(true);
    }

    return unsubscribe;
  }, [defaultOptions.accuracy, defaultOptions.mode]);

  const getCurrentLocation = useCallback(
    async (customOptions?: Partial<GPSOptions>) => {
      const opts = { ...defaultOptions, ...customOptions };
      const result = await gpsManager.getCurrentLocation(opts);
      if (result) {
        setLocation(result);
        setIsEnabled(true);
      }
      return result;
    },
    [defaultOptions]
  );

  const requestPermission = useCallback(async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permission = await Geolocation.requestPermissions();
        const granted = permission.location === 'granted';
        setIsEnabled(granted);
        return granted;
      } else {
        const enabled = 'geolocation' in navigator;
        setIsEnabled(enabled);
        return enabled;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setIsEnabled(false);
      return false;
    }
  }, []);

  return {
    location,
    isLocationEnabled: isEnabled,
    getCurrentLocation,
    requestPermission,
    lastKnownLocation: gpsManager.getLastKnownLocation()
  };
};