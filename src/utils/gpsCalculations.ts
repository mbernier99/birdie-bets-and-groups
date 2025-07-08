
import { LocationData } from '../hooks/useMobileFeatures';
import { CourseHole } from '../types/press';

export interface CoursePosition {
  hole: number;
  area: 'tee' | 'fairway' | 'rough' | 'green' | 'unknown';
  distanceToPin?: number;
  distanceToTee?: number;
}

// Haversine formula to calculate distance between two GPS coordinates
export const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const determineCurrentHole = (
  currentLocation: LocationData,
  courseHoles: CourseHole[]
): number | null => {
  let closestHole = null;
  let closestDistance = Infinity;

  for (const hole of courseHoles) {
    if (hole.teeLocation) {
      const distance = calculateDistance(currentLocation, hole.teeLocation);
      if (distance < closestDistance && distance < 200) { // Within 200m of tee
        closestDistance = distance;
        closestHole = hole.number;
      }
    }
  }

  return closestHole;
};

export const getCoursePosition = (
  currentLocation: LocationData,
  holeNumber: number,
  courseHoles: CourseHole[]
): CoursePosition => {
  const hole = courseHoles.find(h => h.number === holeNumber);
  
  if (!hole) {
    return {
      hole: holeNumber,
      area: 'unknown'
    };
  }

  const position: CoursePosition = {
    hole: holeNumber,
    area: 'unknown'
  };

  // Calculate distances to key locations
  if (hole.teeLocation) {
    position.distanceToTee = calculateDistance(currentLocation, hole.teeLocation);
    
    // If within 50m of tee, consider on tee
    if (position.distanceToTee <= 50) {
      position.area = 'tee';
    }
  }

  if (hole.pinLocation) {
    position.distanceToPin = calculateDistance(currentLocation, hole.pinLocation);
    
    // If within 30m of pin, consider on green
    if (position.distanceToPin <= 30) {
      position.area = 'green';
    }
  }

  // If we're not on tee or green, determine fairway vs rough
  if (position.area === 'unknown') {
    // This is simplified - in reality you'd use course boundary data
    if (hole.teeLocation && hole.pinLocation) {
      const teeToPin = calculateDistance(hole.teeLocation, hole.pinLocation);
      const teeToPlayer = position.distanceToTee || 0;
      const playerToPin = position.distanceToPin || 0;
      
      // Simple fairway detection: if player is roughly in line between tee and pin
      const angleDifference = Math.abs(teeToPin - (teeToPlayer + playerToPin));
      position.area = angleDifference < 50 ? 'fairway' : 'rough';
    }
  }

  return position;
};

export const isValidBettingPosition = (
  position: CoursePosition,
  betType: 'closest-to-pin' | 'longest-drive' | 'first-to-green'
): boolean => {
  switch (betType) {
    case 'longest-drive':
      return position.area === 'tee';
    case 'closest-to-pin':
      return position.area === 'fairway' || position.area === 'rough' || position.area === 'green';
    case 'first-to-green':
      return position.area !== 'green';
    default:
      return false;
  }
};

export const calculateClosestToPin = (
  shots: Array<{
    playerId: string;
    location: { latitude: number; longitude: number };
  }>,
  pinLocation: { latitude: number; longitude: number }
): { playerId: string; distance: number }[] => {
  return shots
    .map(shot => ({
      playerId: shot.playerId,
      distance: calculateDistance(shot.location, pinLocation)
    }))
    .sort((a, b) => a.distance - b.distance);
};

export const calculateLongestDrive = (
  shots: Array<{
    playerId: string;
    location: { latitude: number; longitude: number };
  }>,
  teeLocation: { latitude: number; longitude: number }
): { playerId: string; distance: number }[] => {
  return shots
    .map(shot => ({
      playerId: shot.playerId,
      distance: calculateDistance(shot.location, teeLocation)
    }))
    .sort((a, b) => b.distance - a.distance);
};
