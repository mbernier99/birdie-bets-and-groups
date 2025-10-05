export interface SnakeState {
  snakeType: 'front_nine' | 'back_nine' | 'overall';
  currentHolderId: string | null;
  lastHoleUpdated: number;
  amount: number;
  isFinal: boolean;
}

export interface HoleScoreForSnake {
  playerId: string;
  grossScore: number;
  holeNumber: number;
}

export const updateSnakeHolder = (
  currentState: SnakeState,
  holeScore: HoleScoreForSnake,
  allScores: HoleScoreForSnake[]
): SnakeState => {
  const { snakeType, amount } = currentState;

  // Determine if this hole is relevant for this snake type
  const isRelevantHole = 
    (snakeType === 'front_nine' && holeScore.holeNumber <= 9) ||
    (snakeType === 'back_nine' && holeScore.holeNumber >= 10) ||
    (snakeType === 'overall');

  if (!isRelevantHole) {
    return currentState;
  }

  // Find the highest gross score on this hole
  const holeScores = allScores.filter(s => s.holeNumber === holeScore.holeNumber);
  if (holeScores.length === 0) return currentState;

  const highestScore = Math.max(...holeScores.map(s => s.grossScore));
  const playersWithHighest = holeScores.filter(s => s.grossScore === highestScore);

  // If tie for highest, snake doesn't move
  if (playersWithHighest.length > 1) {
    return {
      ...currentState,
      lastHoleUpdated: holeScore.holeNumber
    };
  }

  // Check if round is complete for this snake type
  const isFinal = 
    (snakeType === 'front_nine' && holeScore.holeNumber === 9) ||
    (snakeType === 'back_nine' && holeScore.holeNumber === 18) ||
    (snakeType === 'overall' && holeScore.holeNumber === 18);

  return {
    snakeType,
    currentHolderId: playersWithHighest[0].playerId,
    lastHoleUpdated: holeScore.holeNumber,
    amount,
    isFinal
  };
};

export const initializeSnakes = (amount: number): SnakeState[] => {
  return [
    {
      snakeType: 'front_nine',
      currentHolderId: null,
      lastHoleUpdated: 0,
      amount,
      isFinal: false
    },
    {
      snakeType: 'back_nine',
      currentHolderId: null,
      lastHoleUpdated: 0,
      amount,
      isFinal: false
    },
    {
      snakeType: 'overall',
      currentHolderId: null,
      lastHoleUpdated: 0,
      amount: amount * 2, // Overall snake typically worth more
      isFinal: false
    }
  ];
};

export const calculateSnakeWinnings = (
  snakeStates: SnakeState[]
): Map<string, number> => {
  const winnings = new Map<string, number>();

  for (const snake of snakeStates) {
    if (snake.isFinal && snake.currentHolderId) {
      const current = winnings.get(snake.currentHolderId) || 0;
      winnings.set(snake.currentHolderId, current + snake.amount);
    }
  }

  return winnings;
};

export const formatSnakeStatus = (snake: SnakeState, playerName: string | null): string => {
  if (!snake.currentHolderId || !playerName) {
    return `${snake.snakeType.replace('_', ' ')} Snake: No holder`;
  }

  const snakeLabel = snake.snakeType === 'front_nine' ? 'Front 9' :
                     snake.snakeType === 'back_nine' ? 'Back 9' : 'Overall';

  if (snake.isFinal) {
    return `${snakeLabel} Snake Winner: ${playerName} - $${snake.amount}`;
  }

  return `${snakeLabel} Snake: ${playerName} (Hole ${snake.lastHoleUpdated})`;
};

export const getSnakeEmoji = (): string => '🐍';
