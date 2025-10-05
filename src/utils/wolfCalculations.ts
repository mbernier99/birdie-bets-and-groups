export interface WolfHoleResult {
  holeNumber: number;
  wolfPlayerId: string;
  partnerId: string | null;
  isLoneWolf: boolean;
  wolfTeamScore: number;
  opponentsScore: number;
  result: 'wolf_win' | 'opponents_win' | 'tie';
  amount: number;
}

export interface WolfGameSettings {
  baseAmount: number;
  loneWolfMultiplier: number; // typically 2x
  rotationOrder: string[]; // player IDs in wolf rotation order
}

export const calculateWolfHole = (
  wolfPlayerId: string,
  partnerId: string | null,
  playerScores: Map<string, number>, // playerId -> net score
  settings: WolfGameSettings
): WolfHoleResult => {
  const isLoneWolf = partnerId === null;
  const amount = isLoneWolf 
    ? settings.baseAmount * settings.loneWolfMultiplier 
    : settings.baseAmount;

  // Get wolf team score
  let wolfTeamScore: number;
  if (isLoneWolf) {
    wolfTeamScore = playerScores.get(wolfPlayerId) || 999;
  } else {
    const wolfScore = playerScores.get(wolfPlayerId) || 999;
    const partnerScore = playerScores.get(partnerId) || 999;
    wolfTeamScore = Math.min(wolfScore, partnerScore); // best ball
  }

  // Get opponents' best score
  const opponentIds = Array.from(playerScores.keys()).filter(
    id => id !== wolfPlayerId && id !== partnerId
  );
  const opponentScores = opponentIds.map(id => playerScores.get(id) || 999);
  const opponentsScore = Math.min(...opponentScores);

  // Determine result
  let result: 'wolf_win' | 'opponents_win' | 'tie';
  if (wolfTeamScore < opponentsScore) {
    result = 'wolf_win';
  } else if (wolfTeamScore > opponentsScore) {
    result = 'opponents_win';
  } else {
    result = 'tie';
  }

  return {
    holeNumber: 0,
    wolfPlayerId,
    partnerId,
    isLoneWolf,
    wolfTeamScore,
    opponentsScore,
    result,
    amount
  };
};

export const getNextWolfPlayer = (
  currentHole: number,
  rotationOrder: string[]
): string => {
  const wolfIndex = (currentHole - 1) % rotationOrder.length;
  return rotationOrder[wolfIndex];
};

export const calculateWolfWinnings = (
  holeResults: WolfHoleResult[],
  playerIds: string[]
): Map<string, number> => {
  const winnings = new Map<string, number>();

  // Initialize all players to 0
  playerIds.forEach(id => winnings.set(id, 0));

  for (const result of holeResults) {
    if (result.result === 'tie') continue;

    const wolfIds = result.isLoneWolf 
      ? [result.wolfPlayerId]
      : [result.wolfPlayerId, result.partnerId!];
    
    const opponentIds = playerIds.filter(
      id => !wolfIds.includes(id)
    );

    if (result.result === 'wolf_win') {
      // Wolf team wins from opponents
      const amountPerWinner = result.amount / wolfIds.length;
      const amountPerLoser = result.amount / opponentIds.length;

      wolfIds.forEach(id => {
        const current = winnings.get(id) || 0;
        winnings.set(id, current + amountPerWinner);
      });

      opponentIds.forEach(id => {
        const current = winnings.get(id) || 0;
        winnings.set(id, current - amountPerLoser);
      });
    } else {
      // Opponents win from wolf team
      const amountPerWinner = result.amount / opponentIds.length;
      const amountPerLoser = result.amount / wolfIds.length;

      opponentIds.forEach(id => {
        const current = winnings.get(id) || 0;
        winnings.set(id, current + amountPerWinner);
      });

      wolfIds.forEach(id => {
        const current = winnings.get(id) || 0;
        winnings.set(id, current - amountPerLoser);
      });
    }
  }

  return winnings;
};

export const formatWolfStatus = (
  currentHole: number,
  wolfPlayerId: string,
  playerName: string,
  partnerId: string | null
): string => {
  if (partnerId) {
    return `Wolf: ${playerName} (with partner)`;
  }
  return `Lone Wolf: ${playerName}`;
};
