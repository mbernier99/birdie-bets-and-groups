
export interface MatchPlayScore {
  teamId: string;
  holesWon: number;
  holesLost: number;
  holesHalved: number;
  matchStatus: 'active' | 'won' | 'lost' | 'halved';
  marginOfVictory?: number;
}

export interface TeamHoleScore {
  teamId: string;
  player1Score: number;
  player2Score: number;
  player1Strokes: number;
  player2Strokes: number;
  teamNetScore: number;
}

export const calculateTeamBestBall = (
  player1Gross: number,
  player2Gross: number,
  player1Strokes: number,
  player2Strokes: number
): number => {
  const player1Net = player1Gross - player1Strokes;
  const player2Net = player2Gross - player2Strokes;
  return Math.min(player1Net, player2Net);
};

export const determineHoleWinner = (
  team1Score: number,
  team2Score: number
): 'team1' | 'team2' | 'halved' => {
  if (team1Score < team2Score) return 'team1';
  if (team2Score < team1Score) return 'team2';
  return 'halved';
};

export const updateMatchScore = (
  currentScore: MatchPlayScore,
  holeResult: 'won' | 'lost' | 'halved'
): MatchPlayScore => {
  const updated = { ...currentScore };
  
  switch (holeResult) {
    case 'won':
      updated.holesWon++;
      break;
    case 'lost':
      updated.holesLost++;
      break;
    case 'halved':
      updated.holesHalved++;
      break;
  }

  return updated;
};

export const calculateMatchStatus = (
  score: MatchPlayScore,
  holesPlayed: number,
  totalHoles: number = 18
): MatchPlayScore => {
  const holesRemaining = totalHoles - holesPlayed;
  const scoreDifference = score.holesWon - score.holesLost;
  
  const updated = { ...score };
  
  if (scoreDifference > holesRemaining) {
    updated.matchStatus = 'won';
    updated.marginOfVictory = scoreDifference;
  } else if (scoreDifference < -holesRemaining) {
    updated.matchStatus = 'lost';
    updated.marginOfVictory = Math.abs(scoreDifference);
  } else if (holesPlayed === totalHoles) {
    if (scoreDifference > 0) {
      updated.matchStatus = 'won';
      updated.marginOfVictory = scoreDifference;
    } else if (scoreDifference < 0) {
      updated.matchStatus = 'lost';
      updated.marginOfVictory = Math.abs(scoreDifference);
    } else {
      updated.matchStatus = 'halved';
    }
  } else {
    updated.matchStatus = 'active';
  }

  return updated;
};

export const formatMatchScore = (score: MatchPlayScore): string => {
  const difference = score.holesWon - score.holesLost;
  
  if (score.matchStatus === 'active') {
    if (difference === 0) return 'All Square';
    return `${Math.abs(difference)} ${difference > 0 ? 'UP' : 'DOWN'}`;
  }
  
  if (score.matchStatus === 'halved') return 'Match Halved';
  
  if (score.marginOfVictory === 1) {
    return '1 UP';
  }
  
  const holesRemaining = 18 - (score.holesWon + score.holesLost + score.holesHalved);
  if (holesRemaining === 0) {
    return `${score.marginOfVictory} UP`;
  }
  
  return `${score.marginOfVictory} & ${holesRemaining}`;
};
