
import { TournamentData } from '../components/CreateTournamentModal';

export const validateBasicInfo = (data: TournamentData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.basicInfo.name.trim()) {
    errors.push('Tournament name is required');
  }
  
  if (data.players.length === 0) {
    errors.push('At least one player is required');
  }
  
  const playersWithNames = data.players.filter(p => p.name.trim());
  if (playersWithNames.length === 0) {
    errors.push('At least one player must have a name');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCourseSetup = (data: TournamentData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.course.name.trim()) {
    errors.push('Course name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateGameType = (data: TournamentData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.gameType.type) {
    errors.push('Game type selection is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCourseAndGame = (data: TournamentData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.course.name.trim()) {
    errors.push('Course name is required');
  }
  
  if (!data.gameType.type) {
    errors.push('Game type selection is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateFormatSelection = (data: TournamentData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.gameType.format) {
    errors.push('Format selection is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStep = (stepIndex: number, data: TournamentData): { isValid: boolean; errors: string[] } => {
  switch (stepIndex) {
    case 0:
      return validateBasicInfo(data);
    case 1:
      return validateCourseSetup(data);
    case 2:
      return validateFormatSelection(data);
    case 3:
      return validateGameType(data);
    case 4:
      // Players & Teams - optional validation
      return { isValid: true, errors: [] };
    case 5:
      // Final review
      return validateCourseAndGame(data);
    default:
      return { isValid: true, errors: [] };
  }
};
