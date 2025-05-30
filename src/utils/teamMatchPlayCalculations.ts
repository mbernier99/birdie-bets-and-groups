
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

/**
 * Calculate best ball score for a team
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
 * Update match results after a hole is completed
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
      return `Team 1 wins ${match.team1Score.holesWon} & ${match.team1Score.holesHalved}`;
    } else if (match.team2Score.holesWon > match.team1Score.holesWon) {
      return `Team 2 wins ${match.team2Score.holesWon} & ${match.team2Score.holesHalved}`;
    } else {
      return "Match Halved";
    }
  }
  
  // Active match
  const scoreDiff = match.team1Score.holesWon - match.team2Score.holesWon;
  
  if (scoreDiff === 0) {
    return "All Square";
  } else if (scoreDiff > 0) {
    return `Team 1 up by ${scoreDiff}`;
  } else {
    return `Team 2 up by ${Math.abs(scoreDiff)}`;
  }
};
