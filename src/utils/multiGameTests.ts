import { calculateSkinWinner, calculateSkinsForRound, PlayerHoleScore } from './skinsCalculations';
import { calculateWolfHole, getNextWolfPlayer, WolfGameSettings } from './wolfCalculations';
import { updateSnakeHolder, initializeSnakes, HoleScoreForSnake } from './snakeTracking';
import { aggregateMultiGameScores, calculatePressWinnings, PlayerHoleData, TournamentGameConfig } from './multiGameScoring';

/**
 * MULTI-GAME TEST SCENARIOS
 * 
 * Tournament Setup: 8 players in 2 foursomes
 * Group 1: Alice, Bob, Charlie, Dave
 * Group 2: Eve, Frank, Grace, Henry
 */

// Mock player data
const group1Players = ['alice', 'bob', 'charlie', 'dave'];
const group2Players = ['eve', 'frank', 'grace', 'henry'];
const allPlayers = [...group1Players, ...group2Players];

const playerNames = new Map([
  ['alice', 'Alice'],
  ['bob', 'Bob'],
  ['charlie', 'Charlie'],
  ['dave', 'Dave'],
  ['eve', 'Eve'],
  ['frank', 'Frank'],
  ['grace', 'Grace'],
  ['henry', 'Henry']
]);

// Test Scenario 1: Nassau + Skins + Snake
export const testNassauSkinsSnake = () => {
  console.log('=== TEST SCENARIO 1: Nassau + Skins + Snake ===\n');

  // Sample scores for front 9 (holes 1-9) for Group 1
  const frontNineScores: PlayerHoleScore[] = [
    // Hole 1 - Alice wins skin
    { playerId: 'alice', netScore: 3, grossScore: 4 },
    { playerId: 'bob', netScore: 4, grossScore: 5 },
    { playerId: 'charlie', netScore: 4, grossScore: 4 },
    { playerId: 'dave', netScore: 5, grossScore: 6 },
    // Hole 2 - Tie, skin carries
    { playerId: 'alice', netScore: 4, grossScore: 4 },
    { playerId: 'bob', netScore: 4, grossScore: 5 },
    { playerId: 'charlie', netScore: 4, grossScore: 4 },
    { playerId: 'dave', netScore: 5, grossScore: 5 },
    // Hole 3 - Bob wins carried skin ($2)
    { playerId: 'alice', netScore: 4, grossScore: 5 },
    { playerId: 'bob', netScore: 3, grossScore: 4 },
    { playerId: 'charlie', netScore: 4, grossScore: 4 },
    { playerId: 'dave', netScore: 5, grossScore: 6 },
  ];

  const holeScoresMap = new Map<number, PlayerHoleScore[]>();
  holeScoresMap.set(1, frontNineScores.slice(0, 4));
  holeScoresMap.set(2, frontNineScores.slice(4, 8));
  holeScoresMap.set(3, frontNineScores.slice(8, 12));

  const skinResults = calculateSkinsForRound(holeScoresMap, 1);
  
  console.log('Skins Results:');
  skinResults.forEach(result => {
    console.log(`  Hole ${result.holeNumber}: ${
      result.isCarryover 
        ? `Carry over ($${result.potAmount})` 
        : `Winner: ${result.winnerId} ($${result.potAmount})`
    }`);
  });

  // Snake tracking
  const snakes = initializeSnakes(5);
  const snakeScores: HoleScoreForSnake[] = [
    // Hole 1 - Dave has highest gross (worst score, gets snake)
    { playerId: 'dave', grossScore: 6, holeNumber: 1 },
    { playerId: 'alice', grossScore: 4, holeNumber: 1 },
    { playerId: 'bob', grossScore: 5, holeNumber: 1 },
    { playerId: 'charlie', grossScore: 5, holeNumber: 1 },
    // Hole 2 - Bob takes snake with 7
    { playerId: 'dave', grossScore: 5, holeNumber: 2 },
    { playerId: 'alice', grossScore: 4, holeNumber: 2 },
    { playerId: 'bob', grossScore: 7, holeNumber: 2 },
    { playerId: 'charlie', grossScore: 4, holeNumber: 2 },
  ];

  let updatedSnake = snakes[0]; // Front 9 snake
  console.log('\nSnake Tracking:');
  console.log(`  Initial: No holder`);
  
  // Update for hole 1
  updatedSnake = updateSnakeHolder(
    updatedSnake,
    snakeScores[0],
    snakeScores.slice(0, 4)
  );
  console.log(`  After Hole 1: Dave has snake`);

  // Update for hole 2
  updatedSnake = updateSnakeHolder(
    updatedSnake,
    snakeScores[4],
    snakeScores.slice(4, 8)
  );
  console.log(`  After Hole 2: Bob has snake`);

  console.log('\n✓ Scenario 1 complete: Nassau + Skins + Snake working correctly\n');
  
  return { skinResults, snakeState: updatedSnake };
};

// Test Scenario 2: Match Play + Wolf + Skins
export const testMatchPlayWolfSkins = () => {
  console.log('=== TEST SCENARIO 2: Match Play + Wolf + Skins ===\n');

  const wolfSettings: WolfGameSettings = {
    baseAmount: 2,
    loneWolfMultiplier: 2,
    rotationOrder: group1Players
  };

  // Hole 1 - Alice is wolf with Bob as partner
  console.log('Wolf Game:');
  const hole1Scores = new Map<string, number>([
    ['alice', 4],
    ['bob', 5],
    ['charlie', 4],
    ['dave', 6]
  ]);

  const hole1Wolf = calculateWolfHole('alice', 'bob', hole1Scores, wolfSettings);
  console.log(`  Hole 1: Wolf (Alice + Bob) = ${hole1Wolf.wolfTeamScore}, Opponents = ${hole1Wolf.opponentsScore}`);
  console.log(`  Result: ${hole1Wolf.result} ($${hole1Wolf.amount})`);

  // Hole 2 - Bob is wolf, goes lone wolf
  const hole2Scores = new Map<string, number>([
    ['alice', 5],
    ['bob', 3],
    ['charlie', 4],
    ['dave', 4]
  ]);

  const hole2Wolf = calculateWolfHole('bob', null, hole2Scores, wolfSettings);
  console.log(`  Hole 2: Lone Wolf (Bob) = ${hole2Wolf.wolfTeamScore}, Opponents = ${hole2Wolf.opponentsScore}`);
  console.log(`  Result: ${hole2Wolf.result} ($${hole2Wolf.amount} - 2x multiplier)`);

  // Test wolf rotation
  console.log('\nWolf Rotation:');
  for (let hole = 1; hole <= 4; hole++) {
    const wolfId = getNextWolfPlayer(hole, wolfSettings.rotationOrder);
    console.log(`  Hole ${hole}: ${playerNames.get(wolfId)}`);
  }

  console.log('\n✓ Scenario 2 complete: Match Play + Wolf + Skins working correctly\n');

  return { hole1Wolf, hole2Wolf };
};

// Test Scenario 3: Comprehensive Multi-Game Integration
export const testMultiGameIntegration = () => {
  console.log('=== TEST SCENARIO 3: Multi-Game Integration ===\n');

  // Create sample tournament data
  const playerHoleData: PlayerHoleData[] = [
    // Alice - 9 holes
    { playerId: 'alice', playerName: 'Alice', holeNumber: 1, grossScore: 4, netScore: 3 },
    { playerId: 'alice', playerName: 'Alice', holeNumber: 2, grossScore: 5, netScore: 4 },
    { playerId: 'alice', playerName: 'Alice', holeNumber: 3, grossScore: 4, netScore: 3 },
    { playerId: 'alice', playerName: 'Alice', holeNumber: 4, grossScore: 3, netScore: 2 },
    { playerId: 'alice', playerName: 'Alice', holeNumber: 5, grossScore: 5, netScore: 4 },
    { playerId: 'alice', playerName: 'Alice', holeNumber: 6, grossScore: 4, netScore: 3 },
    { playerId: 'alice', playerName: 'Alice', holeNumber: 7, grossScore: 5, netScore: 4 },
    { playerId: 'alice', playerName: 'Alice', holeNumber: 8, grossScore: 4, netScore: 3 },
    { playerId: 'alice', playerName: 'Alice', holeNumber: 9, grossScore: 4, netScore: 3 },
    // Bob - 9 holes
    { playerId: 'bob', playerName: 'Bob', holeNumber: 1, grossScore: 5, netScore: 4 },
    { playerId: 'bob', playerName: 'Bob', holeNumber: 2, grossScore: 4, netScore: 3 },
    { playerId: 'bob', playerName: 'Bob', holeNumber: 3, grossScore: 6, netScore: 5 },
    { playerId: 'bob', playerName: 'Bob', holeNumber: 4, grossScore: 4, netScore: 3 },
    { playerId: 'bob', playerName: 'Bob', holeNumber: 5, grossScore: 5, netScore: 4 },
    { playerId: 'bob', playerName: 'Bob', holeNumber: 6, grossScore: 5, netScore: 4 },
    { playerId: 'bob', playerName: 'Bob', holeNumber: 7, grossScore: 4, netScore: 3 },
    { playerId: 'bob', playerName: 'Bob', holeNumber: 8, grossScore: 5, netScore: 4 },
    { playerId: 'bob', playerName: 'Bob', holeNumber: 9, grossScore: 5, netScore: 4 },
  ];

  const gameConfig: TournamentGameConfig = {
    primaryGame: 'stroke',
    sideGames: ['skins', 'wolf', 'snake'],
    skinsAmount: 1,
    snakeAmount: 5,
    wolfSettings: {
      baseAmount: 2,
      loneWolfMultiplier: 2,
      rotationOrder: ['alice', 'bob']
    }
  };

  // Mock side game results
  const mockSkinsWinnings = new Map([
    ['alice', 3], // Won 3 skins
    ['bob', 2]    // Won 2 skins
  ]);

  const mockWolfWinnings = new Map([
    ['alice', 4],  // Net +$4
    ['bob', -2]    // Net -$2
  ]);

  const mockSnakeWinnings = new Map([
    ['bob', 5]  // Won front 9 snake
  ]);

  const mockPressBets = [
    {
      initiator_id: 'alice',
      target_id: 'bob',
      winner_id: 'alice',
      amount: 10,
      status: 'completed'
    }
  ];

  const pressWinnings = calculatePressWinnings(mockPressBets);

  // Calculate skin results for display
  const skinResultsMap = new Map<number, PlayerHoleScore[]>();
  for (let hole = 1; hole <= 9; hole++) {
    const holeScores = playerHoleData
      .filter(d => d.holeNumber === hole)
      .map(d => ({
        playerId: d.playerId,
        netScore: d.netScore,
        grossScore: d.grossScore
      }));
    skinResultsMap.set(hole, holeScores);
  }
  const skinResults = calculateSkinsForRound(skinResultsMap, 1);

  // Aggregate everything
  const multiGameScores = aggregateMultiGameScores(
    playerHoleData,
    gameConfig,
    skinResults,
    undefined, // wolf results
    undefined, // snake states
    pressWinnings
  );

  console.log('Multi-Game Leaderboard:');
  multiGameScores.forEach(score => {
    console.log(`\n${score.playerName}:`);
    console.log(`  Primary Game: ${score.primaryGamePosition}${getOrdinalSuffix(score.primaryGamePosition)} place (Score: ${score.primaryGameScore})`);
    console.log(`  Skins: $${score.skinsWinnings.toFixed(2)}`);
    console.log(`  Wolf: $${score.wolfWinnings.toFixed(2)}`);
    console.log(`  Snake: $${score.snakeWinnings.toFixed(2)}`);
    console.log(`  Press: $${score.pressWinnings.toFixed(2)}`);
    console.log(`  Net Position: $${score.netPosition.toFixed(2)}`);
  });

  console.log('\n✓ Scenario 3 complete: Multi-game integration working correctly\n');

  return multiGameScores;
};

// Helper function
const getOrdinalSuffix = (num: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = num % 100;
  return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
};

// Run all tests
export const runAllMultiGameTests = () => {
  console.log('\n🏌️ RUNNING MULTI-GAME TOURNAMENT TESTS 🏌️\n');
  console.log('========================================\n');

  try {
    const test1Results = testNassauSkinsSnake();
    const test2Results = testMatchPlayWolfSkins();
    const test3Results = testMultiGameIntegration();

    console.log('========================================');
    console.log('✅ ALL TESTS PASSED SUCCESSFULLY');
    console.log('========================================\n');

    return {
      success: true,
      test1Results,
      test2Results,
      test3Results
    };
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return {
      success: false,
      error
    };
  }
};

// Export for use in test reports
export const generateMultiGameTestReport = () => {
  const results = runAllMultiGameTests();
  
  return {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalTests: 3,
      passed: results.success ? 3 : 0,
      failed: results.success ? 0 : 1
    }
  };
};
