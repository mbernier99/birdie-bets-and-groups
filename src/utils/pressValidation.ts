
import { CourseHole, PressValidation } from '../types/press';

export const validatePress = (
  initiatorHole: number,
  targetHole: number,
  gameType: string,
  courseHoles: CourseHole[]
): PressValidation => {
  const holeDifference = Math.abs(initiatorHole - targetHole);
  
  // Basic rules
  if (holeDifference > 3) {
    return {
      isValid: false,
      reason: 'Players are too far apart (max 3 holes difference)'
    };
  }

  if (initiatorHole > 18 || targetHole > 18) {
    return {
      isValid: false,
      reason: 'Round is complete'
    };
  }

  // Game type specific validation
  switch (gameType) {
    case 'this-hole':
      if (initiatorHole !== targetHole) {
        return {
          isValid: false,
          reason: 'This-hole press requires both players on same hole'
        };
      }
      break;

    case 'head-to-head':
      if (holeDifference > 1) {
        return {
          isValid: false,
          reason: 'Head-to-head press requires players within 1 hole'
        };
      }
      if (holeDifference === 1) {
        return {
          isValid: true,
          warning: 'Different holes - will compare relative performance'
        };
      }
      break;

    case 'total-strokes':
      // More lenient for stroke play
      if (holeDifference > 2) {
        return {
          isValid: false,
          reason: 'Total strokes press requires players within 2 holes'
        };
      }
      break;

    case 'remaining-holes':
      // Always valid as long as both have holes left
      break;
  }

  return { isValid: true };
};

export const getGameTypeOptions = (
  initiatorHole: number,
  targetHole: number,
  courseHoles: CourseHole[]
) => {
  const options = [];
  
  // This hole - only if on same hole
  if (initiatorHole === targetHole) {
    options.push({
      value: 'this-hole',
      label: 'This Hole Only',
      description: `Hole ${initiatorHole} only`
    });
  }

  // Head-to-head - if within 1 hole
  if (Math.abs(initiatorHole - targetHole) <= 1) {
    options.push({
      value: 'head-to-head',
      label: 'Head-to-Head Match',
      description: 'Best relative score comparison'
    });
  }

  // Total strokes - if within 2 holes
  if (Math.abs(initiatorHole - targetHole) <= 2) {
    options.push({
      value: 'total-strokes',
      label: 'Total Strokes',
      description: 'Lowest total score wins'
    });
  }

  // Remaining holes - always available if holes left
  if (Math.max(initiatorHole, targetHole) < 18) {
    options.push({
      value: 'remaining-holes',
      label: 'Remaining Holes',
      description: 'All holes from current position'
    });
  }

  return options;
};

export const getWinConditionOptions = (
  gameType: string,
  initiatorHole: number,
  targetHole: number
) => {
  const startHole = Math.max(initiatorHole, targetHole);
  const holesRemaining = 18 - startHole + 1;

  switch (gameType) {
    case 'this-hole':
      return [`Hole ${startHole} only`];
    
    case 'head-to-head':
      return [
        'Better relative score',
        'Match play style (up/down)',
      ];
    
    case 'total-strokes':
      const options = ['Lowest total score'];
      if (holesRemaining >= 3) options.push('Next 3 holes total');
      if (holesRemaining >= 6) options.push('Next 6 holes total');
      return options;
    
    case 'remaining-holes':
      return [
        `All remaining holes (${holesRemaining} holes)`,
        holesRemaining >= 9 ? 'Back 9 equivalent' : 'Final stretch'
      ];
    
    default:
      return ['Custom'];
  }
};
