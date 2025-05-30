
import { MatchPlayScore, TeamHoleScore, calculateTeamBestBall, determineHoleWinner, updateMatchScore, calculateMatchStatus } from './matchPlayCalculations';

export interface TeamMatch {
  matchId: string;
  team1Id: string;
  team2Id: string;
  team1Players: string[];
  team2Players: string[];
  team1Score: MatchPlayScore;
  team2Score: MatchPlayScore;
  currentHole: number;
  status: 'active' | 'completed';
}

export interface TeamScore {
  teamId: string;
  playerIds: string[];
  netScore: number;
}

export interface BestBallHoleResult {
  hole: number;
  team1BestScore: number;
  team2BestScore: number;
  team1PlayerUsed: string;
  team2PlayerUsed: string;
  winner: 'team1' | 'team2' | 'halved';
}

/**
 * Calculate best ball score for a team on a specific hole
 */
export const calculateTeamBestBallScore = (
  teamPlayers: Array<{
    id: string;
    scores: Array<{ hole: number; net: number; }>
  }>,
  hole: number
): { score: number; playerId: string } | null => {
  const holeScores = teamPlayers
    .map(player => {
      const score = player.scores.find(s => s.hole === hole);
      return score ? { score: score.net, playerId: player.id } : null;
    })
    .filter(result => result !== null) as Array<{ score: number; playerId: string }>;
  
  if (holeScores.length === 0) return null;
  
  // Find the best (lowest) score
  const bestResult = holeScores.reduce((best, current) => 
    current.score < best.score ? current : best
  );
  
  return bestResult;
};

/**
 * Calculate best ball score for a team (legacy function for compatibility)
 */
export const calculateTeamScore = (
  team: TeamScore,
  playerScores: Record<string, number>,
  playerHandicaps: Record<string, number>,
  holeIndex: number
): number => {
  // Default to max value if player scores aren't available
  const maxScore = 10;
  
  // Get each player's score for this hole
  const scores = team.playerIds.map(playerId => {
    const grossScore = playerScores[playerId] || maxScore;
    const strokes = (playerHandicaps[playerId] || [])[holeIndex - 1] || 0;
    return grossScore - strokes; // Net score
  });
  
  // Return the best (lowest) score
  return Math.min(...scores);
};

/**
 * Update match results after a hole is completed with best ball calculation
 */
export const updateTeamMatchWithBestBall = (
  match: TeamMatch,
  holeNumber: number,
  team1Players: Array<{
    id: string;
    scores: Array<{ hole: number; net: number; }>
  }>,
  team2Players: Array<{
    id: string;
    scores: Array<{ hole: number; net: number; }>
  }>
): { match: TeamMatch; holeResult: BestBallHoleResult } => {
  // Calculate best ball scores for each team
  const team1Result = calculateTeamBestBallScore(team1Players, holeNumber);
  const team2Result = calculateTeamBestBallScore(team2Players, holeNumber);
  
  // Default to high scores if no scores available
  const team1Score = team1Result?.score || 999;
  const team2Score = team2Result?.score || 999;
  
  // Determine who won the hole
  const holeWinner = determineHoleWinner(team1Score, team2Score);
  
  // Update the match scores
  let updatedTeam1Score: MatchPlayScore;
  let updatedTeam2Score: MatchPlayScore;
  
  if (holeWinner === 'team1') {
    updatedTeam1Score = updateMatchScore(match.team1Score, 'won');
    updatedTeam2Score = updateMatchScore(match.team2Score, 'lost');
  } else if (holeWinner === 'team2') {
    updatedTeam1Score = updateMatchScore(match.team1Score, 'lost');
    updatedTeam2Score = updateMatchScore(match.team2Score, 'won');
  } else {
    updatedTeam1Score = updateMatchScore(match.team1Score, 'halved');
    updatedTeam2Score = updateMatchScore(match.team2Score, 'halved');
  }
  
  // Check if the match is over or update status
  const holesPlayed = holeNumber;
  const finalTeam1Score = calculateMatchStatus(updatedTeam1Score, holesPlayed);
  const finalTeam2Score = calculateMatchStatus(updatedTeam2Score, holesPlayed);
  
  // Determine if match is completed
  const matchStatus = 
    finalTeam1Score.matchStatus !== 'active' || 
    finalTeam2Score.matchStatus !== 'active' || 
    holeNumber === 18 
      ? 'completed' 
      : 'active';

  const updatedMatch: TeamMatch = {
    ...match,
    team1Score: finalTeam1Score,
    team2Score: finalTeam2Score,
    currentHole: holeNumber + 1,
    status: matchStatus as 'active' | 'completed'
  };

  const holeResult: BestBallHoleResult = {
    hole: holeNumber,
    team1BestScore: team1Score,
    team2BestScore: team2Score,
    team1PlayerUsed: team1Result?.playerId || '',
    team2PlayerUsed: team2Result?.playerId || '',
    winner: holeWinner
  };

  return { match: updatedMatch, holeResult };
};

/**
 * Update match results after a hole is completed (legacy function)
 */
export const updateTeamMatch = (
  match: TeamMatch,
  holeNumber: number,
  team1Score: number,
  team2Score: number
): TeamMatch => {
  // Determine who won the hole
  const holeResult = determineHoleWinner(team1Score, team2Score);
  
  // Update the match scores
  let updatedTeam1Score: MatchPlayScore;
  let updatedTeam2Score: MatchPlayScore;
  
  if (holeResult === 'team1') {
    updatedTeam1Score = updateMatchScore(match.team1Score, 'won');
    updatedTeam2Score = updateMatchScore(match.team2Score, 'lost');
  } else if (holeResult === 'team2') {
    updatedTeam1Score = updateMatchScore(match.team1Score, 'lost');
    updatedTeam2Score = updateMatchScore(match.team2Score, 'won');
  } else {
    updatedTeam1Score = updateMatchScore(match.team1Score, 'halved');
    updatedTeam2Score = updateMatchScore(match.team2Score, 'halved');
  }
  
  // Check if the match is over or update status
  const holesPlayed = holeNumber;
  const finalTeam1Score = calculateMatchStatus(updatedTeam1Score, holesPlayed);
  const finalTeam2Score = calculateMatchStatus(updatedTeam2Score, holesPlayed);
  
  // Determine if match is completed
  const matchStatus = 
    finalTeam1Score.matchStatus !== 'active' || 
    finalTeam2Score.matchStatus !== 'active' || 
    holeNumber === 18 
      ? 'completed' 
      : 'active';

  return {
    ...match,
    team1Score: finalTeam1Score,
    team2Score: finalTeam2Score,
    currentHole: holeNumber + 1,
    status: matchStatus as 'active' | 'completed'
  };
};

/**
 * Create a new match between two teams
 */
export const createTeamMatch = (
  matchId: string,
  team1Id: string,
  team2Id: string,
  team1Players: string[],
  team2Players: string[]
): TeamMatch => {
  const initialScore: MatchPlayScore = {
    teamId: '',
    holesWon: 0,
    holesLost: 0,
    holesHalved: 0,
    matchStatus: 'active'
  };
  
  return {
    matchId,
    team1Id,
    team2Id,
    team1Players,
    team2Players,
    team1Score: { ...initialScore, teamId: team1Id },
    team2Score: { ...initialScore, teamId: team2Id },
    currentHole: 1,
    status: 'active'
  };
};

/**
 * Format match score for display
 */
export const getMatchDisplayStatus = (match: TeamMatch): string => {
  if (match.status === 'completed') {
    if (match.team1Score.holesWon > match.team2Score.holesWon) {
      return `Team 1 wins ${match.team1Score.marginOfVictory} UP`;
    } else if (match.team2Score.holesWon > match.team1Score.holesWon) {
      return `Team 2 wins ${match.team2Score.marginOfVictory} UP`;
    } else {
      return "Match Halved";
    }
  }
  
  // Active match
  const scoreDiff = match.team1Score.holesWon - match.team1Score.holesLost;
  
  if (scoreDiff === 0) {
    return "All Square";
  } else if (scoreDiff > 0) {
    return `Team 1: ${scoreDiff} UP`;
  } else {
    return `Team 2: ${Math.abs(scoreDiff)} UP`;
  }
};

/**
 * Calculate team totals for leaderboard display
 */
export const calculateTeamLeaderboardStats = (
  teamPlayers: Array<{
    id: string;
    name: string;
    scores: Array<{ hole: number; net: number; gross: number; }>
  }>
): {
  totalNet: number;
  totalGross: number;
  holesCompleted: number;
  averageScore: number;
} => {
  const completedHoles = Array.from({ length: 18 }, (_, i) => i + 1)
    .map(hole => {
      const result = calculateTeamBestBallScore(teamPlayers, hole);
      return result ? { hole, score: result.score } : null;
    })
    .filter(result => result !== null) as Array<{ hole: number; score: number }>;
  
  const totalNet = completedHoles.reduce((sum, result) => sum + result.score, 0);
  const holesCompleted = completedHoles.length;
  const averageScore = holesCompleted > 0 ? totalNet / holesCompleted : 0;
  
  // For gross total, we'd need to track gross scores too
  const totalGross = totalNet; // Simplified for now
  
  return {
    totalNet,
    totalGross,
    holesCompleted,
    averageScore
  };
};
