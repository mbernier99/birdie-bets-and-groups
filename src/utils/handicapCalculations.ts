
export interface CourseInfo {
  rating: number;
  slope: number;
  par: number;
}

export interface PlayerHandicap {
  handicapIndex: number;
  preferredTees: string;
}

export const calculateCourseHandicap = (
  handicapIndex: number,
  courseSlope: number,
  coursePar: number = 72
): number => {
  const courseHandicap = Math.round((handicapIndex * courseSlope) / 113);
  return Math.max(courseHandicap, 0);
};

export const calculateNetScore = (
  grossScore: number,
  courseHandicap: number
): number => {
  return grossScore - courseHandicap;
};

export const calculateStrokesReceived = (
  handicapIndex: number,
  courseSlope: number,
  holeHandicaps: number[]
): number[] => {
  const courseHandicap = calculateCourseHandicap(handicapIndex, courseSlope);
  
  return holeHandicaps.map(holeHandicap => {
    if (courseHandicap >= holeHandicap) {
      const extraStrokes = Math.floor((courseHandicap - holeHandicap) / 18);
      return 1 + extraStrokes;
    }
    return 0;
  });
};

export const calculateMatchPlayStrokes = (
  player1Handicap: number,
  player2Handicap: number,
  courseSlope: number
): { player1Strokes: number; player2Strokes: number } => {
  const p1CourseHandicap = calculateCourseHandicap(player1Handicap, courseSlope);
  const p2CourseHandicap = calculateCourseHandicap(player2Handicap, courseSlope);
  
  const difference = Math.abs(p1CourseHandicap - p2CourseHandicap);
  const strokesAdjustment = Math.round(difference * 0.75); // 75% of difference for match play
  
  if (p1CourseHandicap > p2CourseHandicap) {
    return { player1Strokes: strokesAdjustment, player2Strokes: 0 };
  } else {
    return { player1Strokes: 0, player2Strokes: strokesAdjustment };
  }
};

export const validateGHINNumber = (ghinNumber: string): boolean => {
  return /^\d{7}$/.test(ghinNumber);
};

export const formatHandicapIndex = (handicapIndex: number): string => {
  return handicapIndex >= 0 ? `+${handicapIndex.toFixed(1)}` : handicapIndex.toFixed(1);
};

/**
 * Apply handicap to a score proportionally based on holes played
 * @param grossScore - The total strokes
 * @param handicap - The player's handicap
 * @param holesPlayed - Number of holes completed
 * @param totalHoles - Total holes in the round (default 18)
 * @returns Adjusted score with handicap applied
 */
export const applyHandicapToScore = (
  grossScore: number,
  handicap: number,
  holesPlayed: number,
  totalHoles: number = 18
): number => {
  if (holesPlayed === 0) return grossScore;
  
  // Calculate proportional handicap based on holes played
  const proportionalHandicap = Math.round((handicap * holesPlayed) / totalHoles);
  
  // Return net score (gross - handicap)
  return grossScore - proportionalHandicap;
};
