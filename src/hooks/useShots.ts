
import { useState, useEffect } from 'react';
import { useMobileFeatures } from './useMobileFeatures';

export interface Shot {
  id: string;
  hole: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  photo?: string;
  distance?: number;
}

export const useShots = () => {
  const [shots, setShots] = useState<Shot[]>([]);
  const { getCurrentLocation, takePhoto, saveToStorage, getFromStorage } = useMobileFeatures();

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

  const recordShot = async (currentHole: number) => {
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

  const recordShotWithPhoto = async (currentHole: number) => {
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

  return {
    shots,
    recordShot,
    recordShotWithPhoto,
    calculateDistance
  };
};
