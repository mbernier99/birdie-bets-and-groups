/**
 * Bet Resolution Testing & QA Utilities
 * 
 * This file contains comprehensive test scenarios to verify:
 * - Handicap calculations work correctly
 * - Bet resolution logic is accurate
 * - Wager tracking across all game types
 * - Team vs individual scenarios
 */

import { applyHandicapToScore, calculateNetScore, calculateCourseHandicap } from './handicapCalculations';

export interface TestScenario {
  name: string;
  description: string;
  player1: {
    name: string;
    handicap: number;
    scores: number[]; // hole scores
  };
  player2: {
    name: string;
    handicap: number;
    scores: number[];
  };
  betType: string;
  startHole: number;
  expectedWinner: string;
  courseSlope?: number;
}

/**
 * Test Scenarios for Bet Resolution
 */
export const betResolutionTestScenarios: TestScenario[] = [
  // This Hole - Even Handicaps
  {
    name: 'This Hole - Even Match',
    description: 'Both players same handicap, bet on hole 5',
    player1: {
      name: 'John',
      handicap: 10,
      scores: [4, 5, 3, 6, 4] // Hole 5 = 4
    },
    player2: {
      name: 'Mike',
      handicap: 10,
      scores: [5, 4, 4, 5, 5] // Hole 5 = 5
    },
    betType: 'this-hole',
    startHole: 5,
    expectedWinner: 'John',
    courseSlope: 113
  },

  // This Hole - Different Handicaps
  {
    name: 'This Hole - Handicap Advantage',
    description: 'Higher handicap player gets stroke advantage',
    player1: {
      name: 'Tom',
      handicap: 5,
      scores: [4, 5, 3, 6, 5] // Hole 5 = 5
    },
    player2: {
      name: 'Jerry',
      handicap: 15,
      scores: [5, 6, 4, 7, 6] // Hole 5 = 6, net 5 with handicap
    },
    betType: 'this-hole',
    startHole: 5,
    expectedWinner: 'Tie', // Both net 5
    courseSlope: 113
  },

  // Total Strokes - Full Round
  {
    name: 'Total Strokes - Full 18',
    description: 'Complete round with handicap applied',
    player1: {
      name: 'Alice',
      handicap: 8,
      scores: [4, 5, 3, 6, 4, 5, 4, 3, 5, 4, 4, 5, 6, 4, 5, 3, 6, 4] // Total: 80
    },
    player2: {
      name: 'Bob',
      handicap: 12,
      scores: [5, 6, 4, 7, 5, 6, 5, 4, 6, 5, 5, 6, 7, 5, 6, 4, 7, 5] // Total: 98
    },
    betType: 'total-strokes',
    startHole: 1,
    expectedWinner: 'Alice', // 80-8=72 vs 98-12=86
    courseSlope: 113
  },

  // Remaining Holes
  {
    name: 'Remaining Holes - Back 9',
    description: 'Bet starts on hole 10 through 18',
    player1: {
      name: 'Charlie',
      handicap: 10,
      scores: Array(9).fill(0).concat([4, 4, 5, 6, 4, 5, 3, 6, 4]) // Holes 10-18 = 41
    },
    player2: {
      name: 'Dave',
      handicap: 6,
      scores: Array(9).fill(0).concat([5, 5, 4, 5, 5, 4, 4, 5, 5]) // Holes 10-18 = 42
    },
    betType: 'remaining-holes',
    startHole: 10,
    expectedWinner: 'Dave', // With handicap: Charlie 41-5=36, Dave 42-3=39
    courseSlope: 113
  },

  // Head to Head - Close Match
  {
    name: 'Head to Head - Match Play Style',
    description: 'Head to head competition from hole 1',
    player1: {
      name: 'Eve',
      handicap: 15,
      scores: [5, 6, 4, 7, 5, 6, 5, 4, 6, 5, 5, 6, 7, 5, 6, 4, 7, 5] // Total: 103
    },
    player2: {
      name: 'Frank',
      handicap: 9,
      scores: [4, 5, 3, 6, 4, 5, 4, 3, 5, 4, 4, 5, 6, 4, 5, 3, 6, 4] // Total: 80
    },
    betType: 'head-to-head',
    startHole: 1,
    expectedWinner: 'Frank', // Even with handicap
    courseSlope: 113
  },

  // Edge Case - Scratch Golfer vs High Handicap
  {
    name: 'Scratch vs High Handicap',
    description: 'Zero handicap vs 24 handicap player',
    player1: {
      name: 'Pro',
      handicap: 0,
      scores: [4, 5, 3, 6, 4, 5, 4, 3, 5, 4, 4, 5, 6, 4, 5, 3, 6, 4] // Total: 80
    },
    player2: {
      name: 'Beginner',
      handicap: 24,
      scores: [6, 7, 5, 8, 6, 7, 6, 5, 7, 6, 6, 7, 8, 6, 7, 5, 8, 6] // Total: 116
    },
    betType: 'total-strokes',
    startHole: 1,
    expectedWinner: 'Pro', // 80 vs 116-24=92
    courseSlope: 113
  },

  // Edge Case - Partial Round
  {
    name: 'Partial Round - 6 Holes',
    description: 'Bet on first 6 holes with handicap',
    player1: {
      name: 'Sarah',
      handicap: 12,
      scores: [5, 6, 4, 5, 4, 6] // Total: 30
    },
    player2: {
      name: 'Tim',
      handicap: 8,
      scores: [4, 5, 5, 6, 5, 5] // Total: 30
    },
    betType: 'this-hole', // Testing first hole only
    startHole: 1,
    expectedWinner: 'Tim', // 4 vs 5
    courseSlope: 113
  },

  // Edge Case - Large Handicap Difference
  {
    name: 'Large Handicap Gap',
    description: '5 handicap vs 20 handicap over 9 holes',
    player1: {
      name: 'LowHandicap',
      handicap: 5,
      scores: [4, 5, 3, 4, 5, 4, 5, 3, 5] // Total: 38
    },
    player2: {
      name: 'HighHandicap',
      handicap: 20,
      scores: [6, 7, 5, 6, 7, 6, 7, 5, 7] // Total: 56
    },
    betType: 'remaining-holes',
    startHole: 1,
    expectedWinner: 'LowHandicap', // 38-3=35 vs 56-10=46
    courseSlope: 113
  }
];

/**
 * Run a single test scenario and return results
 */
export const runBetResolutionTest = (scenario: TestScenario): {
  passed: boolean;
  actualWinner: string;
  player1Net: number;
  player2Net: number;
  details: string;
} => {
  const courseSlope = scenario.courseSlope || 113;
  
  // Calculate scores for the bet range
  let player1Scores: number[];
  let player2Scores: number[];
  
  if (scenario.betType === 'this-hole') {
    player1Scores = [scenario.player1.scores[scenario.startHole - 1]];
    player2Scores = [scenario.player2.scores[scenario.startHole - 1]];
  } else if (scenario.betType === 'remaining-holes') {
    player1Scores = scenario.player1.scores.slice(scenario.startHole - 1);
    player2Scores = scenario.player2.scores.slice(scenario.startHole - 1);
  } else {
    player1Scores = scenario.player1.scores;
    player2Scores = scenario.player2.scores;
  }
  
  // Calculate gross scores
  const player1Gross = player1Scores.reduce((sum, score) => sum + score, 0);
  const player2Gross = player2Scores.reduce((sum, score) => sum + score, 0);
  
  // Calculate net scores with handicap
  const holesPlayed = player1Scores.length;
  const player1Net = applyHandicapToScore(player1Gross, scenario.player1.handicap, holesPlayed, 18);
  const player2Net = applyHandicapToScore(player2Gross, scenario.player2.handicap, holesPlayed, 18);
  
  // Determine winner
  let actualWinner: string;
  if (player1Net < player2Net) {
    actualWinner = scenario.player1.name;
  } else if (player2Net < player1Net) {
    actualWinner = scenario.player2.name;
  } else {
    actualWinner = 'Tie';
  }
  
  const passed = actualWinner === scenario.expectedWinner;
  
  const details = `
    ${scenario.player1.name}: Gross ${player1Gross}, Handicap ${scenario.player1.handicap}, Net ${player1Net}
    ${scenario.player2.name}: Gross ${player2Gross}, Handicap ${scenario.player2.handicap}, Net ${player2Net}
    Expected: ${scenario.expectedWinner}, Actual: ${actualWinner}
  `;
  
  return {
    passed,
    actualWinner,
    player1Net,
    player2Net,
    details
  };
};

/**
 * Run all bet resolution tests
 */
export const runAllBetResolutionTests = (): {
  totalTests: number;
  passed: number;
  failed: number;
  results: Array<{
    scenario: string;
    passed: boolean;
    details: string;
  }>;
} => {
  const results = betResolutionTestScenarios.map(scenario => {
    const result = runBetResolutionTest(scenario);
    return {
      scenario: scenario.name,
      passed: result.passed,
      details: result.details
    };
  });
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  
  return {
    totalTests: results.length,
    passed,
    failed,
    results
  };
};

/**
 * Handicap Calculation Verification
 */
export const verifyHandicapCalculations = (): {
  tests: Array<{
    name: string;
    input: { handicap: number; holes: number };
    expected: number;
    actual: number;
    passed: boolean;
  }>;
} => {
  const testCases = [
    { handicap: 10, holes: 18, expected: 10 },
    { handicap: 10, holes: 9, expected: 5 },
    { handicap: 18, holes: 18, expected: 18 },
    { handicap: 18, holes: 9, expected: 9 },
    { handicap: 5, holes: 6, expected: 2 }, // Should round: 5 * 6/18 = 1.67 -> 2
    { handicap: 0, holes: 18, expected: 0 },
    { handicap: 20, holes: 3, expected: 3 } // 20 * 3/18 = 3.33 -> 3
  ];
  
  const tests = testCases.map(test => {
    const grossScore = test.holes * 4; // Assume 4 strokes per hole
    const netScore = applyHandicapToScore(grossScore, test.handicap, test.holes, 18);
    const actualHandicapApplied = grossScore - netScore;
    
    return {
      name: `Handicap ${test.handicap} over ${test.holes} holes`,
      input: { handicap: test.handicap, holes: test.holes },
      expected: test.expected,
      actual: actualHandicapApplied,
      passed: actualHandicapApplied === test.expected
    };
  });
  
  return { tests };
};

/**
 * Wager Tracking Test
 * Verifies that wagers are correctly tracked across multiple bets
 */
export interface WagerTest {
  bets: Array<{
    amount: number;
    winnerId: string;
    userId: string;
  }>;
  userId: string;
  expectedWon: number;
  expectedLost: number;
  expectedNet: number;
}

export const verifyWagerTracking = (test: WagerTest): {
  passed: boolean;
  actualWon: number;
  actualLost: number;
  actualNet: number;
} => {
  let won = 0;
  let lost = 0;
  
  test.bets.forEach(bet => {
    if (bet.winnerId === test.userId) {
      won += bet.amount;
    } else if (bet.userId === test.userId) {
      lost += bet.amount;
    }
  });
  
  const net = won - lost;
  
  return {
    passed: won === test.expectedWon && lost === test.expectedLost && net === test.expectedNet,
    actualWon: won,
    actualLost: lost,
    actualNet: net
  };
};
