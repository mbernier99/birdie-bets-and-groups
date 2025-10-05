export interface SkinResult {
  holeNumber: number;
  winnerId: string | null;
  winnerScore: number | null;
  potAmount: number;
  isCarryover: boolean;
  tiedPlayers: string[];
}

export interface PlayerHoleScore {
  playerId: string;
  netScore: number;
  grossScore: number;
}

export const calculateSkinWinner = (
  holeScores: PlayerHoleScore[],
  basePotAmount: number = 1,
  previousCarryover: number = 0
): SkinResult => {
  if (holeScores.length === 0) {
    return {
      holeNumber: 0,
      winnerId: null,
      winnerScore: null,
      potAmount: basePotAmount + previousCarryover,
      isCarryover: true,
      tiedPlayers: []
    };
  }

  // Find the lowest net score
  const lowestScore = Math.min(...holeScores.map(s => s.netScore));
  const playersWithLowestScore = holeScores.filter(s => s.netScore === lowestScore);

  // If tie, carry over the pot
  if (playersWithLowestScore.length > 1) {
    return {
      holeNumber: 0,
      winnerId: null,
      winnerScore: lowestScore,
      potAmount: basePotAmount + previousCarryover,
      isCarryover: true,
      tiedPlayers: playersWithLowestScore.map(p => p.playerId)
    };
  }

  // Single winner
  const winner = playersWithLowestScore[0];
  return {
    holeNumber: 0,
    winnerId: winner.playerId,
    winnerScore: winner.netScore,
    potAmount: basePotAmount + previousCarryover,
    isCarryover: false,
    tiedPlayers: []
  };
};

export const calculateSkinsForRound = (
  playerScoresByHole: Map<number, PlayerHoleScore[]>,
  basePotPerHole: number = 1
): SkinResult[] => {
  const results: SkinResult[] = [];
  let carryoverPot = 0;

  const holes = Array.from(playerScoresByHole.keys()).sort((a, b) => a - b);

  for (const holeNumber of holes) {
    const holeScores = playerScoresByHole.get(holeNumber) || [];
    const result = calculateSkinWinner(holeScores, basePotPerHole, carryoverPot);
    result.holeNumber = holeNumber;

    if (result.isCarryover) {
      carryoverPot = result.potAmount;
    } else {
      carryoverPot = 0;
    }

    results.push(result);
  }

  return results;
};

export const calculatePlayerSkinWinnings = (
  skinResults: SkinResult[]
): Map<string, number> => {
  const winnings = new Map<string, number>();

  for (const result of skinResults) {
    if (result.winnerId && !result.isCarryover) {
      const currentWinnings = winnings.get(result.winnerId) || 0;
      winnings.set(result.winnerId, currentWinnings + result.potAmount);
    }
  }

  return winnings;
};

export const formatSkinsStatus = (
  skinResults: SkinResult[],
  currentHole: number
): string => {
  const recentResults = skinResults.filter(r => r.holeNumber <= currentHole);
  if (recentResults.length === 0) return "No skins yet";

  const latestResult = recentResults[recentResults.length - 1];
  
  if (latestResult.isCarryover) {
    return `Pot carries: $${latestResult.potAmount}`;
  }

  return `Last skin: Hole ${latestResult.holeNumber} - $${latestResult.potAmount}`;
};
