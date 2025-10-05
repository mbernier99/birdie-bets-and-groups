import { calculateSkinWinner, calculatePlayerSkinWinnings, SkinResult } from './skinsCalculations';
import { calculateWolfHole, calculateWolfWinnings, WolfHoleResult, WolfGameSettings } from './wolfCalculations';
import { updateSnakeHolder, calculateSnakeWinnings, SnakeState } from './snakeTracking';

export interface MultiGameScore {
  playerId: string;
  playerName: string;
  primaryGameScore: number;
  primaryGamePosition: number;
  skinsWinnings: number;
  wolfWinnings: number;
  snakeWinnings: number;
  pressWinnings: number;
  totalWinnings: number;
  totalOwed: number;
  netPosition: number;
}

export interface TournamentGameConfig {
  primaryGame: string; // 'stroke', 'match-play', 'stableford', etc.
  sideGames: string[]; // ['skins', 'snake', 'wolf']
  skinsAmount?: number;
  snakeAmount?: number;
  wolfSettings?: WolfGameSettings;
}

export interface PlayerHoleData {
  playerId: string;
  playerName: string;
  holeNumber: number;
  grossScore: number;
  netScore: number;
}

export const aggregateMultiGameScores = (
  playerHoleData: PlayerHoleData[],
  gameConfig: TournamentGameConfig,
  skinResults?: SkinResult[],
  wolfResults?: WolfHoleResult[],
  snakeStates?: SnakeState[],
  pressWinnings?: Map<string, number>
): MultiGameScore[] => {
  // Get unique players
  const playerIds = [...new Set(playerHoleData.map(d => d.playerId))];
  const playerNames = new Map<string, string>();
  playerHoleData.forEach(d => playerNames.set(d.playerId, d.playerName));

  // Calculate primary game scores
  const primaryScores = new Map<string, number>();
  playerIds.forEach(id => {
    const playerData = playerHoleData.filter(d => d.playerId === id);
    const total = gameConfig.primaryGame === 'stableford'
      ? playerData.reduce((sum, d) => sum + d.netScore, 0) // For stableford, netScore holds points
      : playerData.reduce((sum, d) => sum + d.grossScore, 0);
    primaryScores.set(id, total);
  });

  // Calculate side game winnings
  const skinsWinningsMap = skinResults 
    ? calculatePlayerSkinWinnings(skinResults)
    : new Map<string, number>();

  const wolfWinningsMap = wolfResults && gameConfig.wolfSettings
    ? calculateWolfWinnings(wolfResults, playerIds)
    : new Map<string, number>();

  const snakeWinningsMap = snakeStates
    ? calculateSnakeWinnings(snakeStates)
    : new Map<string, number>();

  // Aggregate everything
  const multiGameScores: MultiGameScore[] = playerIds.map(id => {
    const primaryScore = primaryScores.get(id) || 0;
    const skinsWin = skinsWinningsMap.get(id) || 0;
    const wolfWin = wolfWinningsMap.get(id) || 0;
    const snakeWin = snakeWinningsMap.get(id) || 0;
    const pressWin = pressWinnings?.get(id) || 0;

    const totalWinnings = skinsWin + wolfWin + snakeWin + 
      (pressWin > 0 ? pressWin : 0);
    const totalOwed = pressWin < 0 ? Math.abs(pressWin) : 0;
    const netPosition = totalWinnings - totalOwed;

    return {
      playerId: id,
      playerName: playerNames.get(id) || 'Unknown',
      primaryGameScore: primaryScore,
      primaryGamePosition: 0, // Will be calculated after sorting
      skinsWinnings: skinsWin,
      wolfWinnings: wolfWin,
      snakeWinnings: snakeWin,
      pressWinnings: pressWin,
      totalWinnings,
      totalOwed,
      netPosition
    };
  });

  // Sort by primary game score and assign positions
  const sortedByPrimary = [...multiGameScores].sort((a, b) => {
    // Lower is better for stroke play, higher for stableford
    return gameConfig.primaryGame === 'stableford'
      ? b.primaryGameScore - a.primaryGameScore
      : a.primaryGameScore - b.primaryGameScore;
  });

  sortedByPrimary.forEach((score, index) => {
    const player = multiGameScores.find(s => s.playerId === score.playerId);
    if (player) player.primaryGamePosition = index + 1;
  });

  return multiGameScores;
};

export const calculatePressWinnings = (
  pressBets: Array<{
    initiator_id: string;
    target_id: string;
    winner_id: string | null;
    amount: number;
    status: string;
  }>
): Map<string, number> => {
  const winnings = new Map<string, number>();

  for (const bet of pressBets) {
    if (bet.status !== 'completed' || !bet.winner_id) continue;

    const loserId = bet.winner_id === bet.initiator_id 
      ? bet.target_id 
      : bet.initiator_id;

    // Winner gets positive amount
    const currentWinner = winnings.get(bet.winner_id) || 0;
    winnings.set(bet.winner_id, currentWinner + bet.amount);

    // Loser gets negative amount
    const currentLoser = winnings.get(loserId) || 0;
    winnings.set(loserId, currentLoser - bet.amount);
  }

  return winnings;
};

export const formatMultiGamePosition = (
  score: MultiGameScore,
  gameType: string
): string => {
  const position = score.primaryGamePosition;
  const suffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';
  
  return `${position}${suffix} (${score.primaryGameScore})`;
};
