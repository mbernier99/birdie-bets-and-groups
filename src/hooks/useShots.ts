
import { useState, useEffect } from 'react';
import { useMobileFeatures } from './useMobileFeatures';
import { useOfflineStorage } from './useOfflineStorage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Shot {
  id: string;
  hole: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  photo?: string;
  distance?: number;
  roundId?: string;
  shotNumber?: number;
  club?: string;
  shotType?: string;
}

export const useShots = (roundId?: string) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const { getCurrentLocation, takePhoto, saveToStorage, getFromStorage } = useMobileFeatures();
  const { isOnline, addToSyncQueue, getOfflineData, saveOfflineData } = useOfflineStorage();
  const { user } = useAuth();

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

  const recordShot = async (currentHole: number, options?: { club?: string; shotType?: string; shotNumber?: number }) => {
    const currentLocation = await getCurrentLocation();
    if (!currentLocation) return;

    const shotId = crypto.randomUUID();
    const shot: Shot = {
      id: shotId,
      hole: currentHole,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      timestamp: currentLocation.timestamp,
      roundId,
      shotNumber: options?.shotNumber || 1,
      club: options?.club,
      shotType: options?.shotType
    };

    const newShots = [...shots, shot];
    setShots(newShots);
    await saveShots(newShots);

    // Sync to Supabase if online, otherwise queue for later
    if (isOnline && roundId && user) {
      try {
        const { error } = await supabase
          .from('shots')
          .insert({
            id: shotId,
            round_id: roundId,
            hole_number: currentHole,
            shot_number: options?.shotNumber || 1,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: new Date(currentLocation.timestamp).toISOString(),
            club: options?.club,
            shot_type: options?.shotType
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error syncing shot:', error);
        // Queue for offline sync
        addToSyncQueue({
          type: 'shot',
          operation: 'create',
          data: {
            id: shotId,
            round_id: roundId,
            hole_number: currentHole,
            shot_number: options?.shotNumber || 1,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: new Date(currentLocation.timestamp).toISOString(),
            club: options?.club,
            shot_type: options?.shotType
          },
          roundId
        });
      }
    } else if (roundId) {
      // Queue for sync when back online
      addToSyncQueue({
        type: 'shot',
        operation: 'create',
        data: {
          id: shotId,
          round_id: roundId,
          hole_number: currentHole,
          shot_number: options?.shotNumber || 1,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: new Date(currentLocation.timestamp).toISOString(),
          club: options?.club,
          shot_type: options?.shotType
        },
        roundId
      });
    }

    return shot;
  };

  const recordShotWithPhoto = async (currentHole: number, options?: { club?: string; shotType?: string; shotNumber?: number }) => {
    const photo = await takePhoto();
    const currentLocation = await getCurrentLocation();
    
    if (!currentLocation) return;

    const shotId = crypto.randomUUID();
    const shot: Shot = {
      id: shotId,
      hole: currentHole,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      timestamp: currentLocation.timestamp,
      photo: photo || undefined,
      roundId,
      shotNumber: options?.shotNumber || 1,
      club: options?.club,
      shotType: options?.shotType
    };

    const newShots = [...shots, shot];
    setShots(newShots);
    await saveShots(newShots);

    // Sync to Supabase with photo URL
    if (isOnline && roundId && user) {
      try {
        const { error } = await supabase
          .from('shots')
          .insert({
            id: shotId,
            round_id: roundId,
            hole_number: currentHole,
            shot_number: options?.shotNumber || 1,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: new Date(currentLocation.timestamp).toISOString(),
            photo_url: photo,
            club: options?.club,
            shot_type: options?.shotType
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error syncing shot with photo:', error);
        // Queue for offline sync
        addToSyncQueue({
          type: 'shot',
          operation: 'create',
          data: {
            id: shotId,
            round_id: roundId,
            hole_number: currentHole,
            shot_number: options?.shotNumber || 1,
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: new Date(currentLocation.timestamp).toISOString(),
            photo_url: photo,
            club: options?.club,
            shot_type: options?.shotType
          },
          roundId
        });
      }
    } else if (roundId) {
      // Queue for sync when back online
      addToSyncQueue({
        type: 'shot',
        operation: 'create',
        data: {
          id: shotId,
          round_id: roundId,
          hole_number: currentHole,
          shot_number: options?.shotNumber || 1,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: new Date(currentLocation.timestamp).toISOString(),
          photo_url: photo,
          club: options?.club,
          shot_type: options?.shotType
        },
        roundId
      });
    }

    return shot;
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
