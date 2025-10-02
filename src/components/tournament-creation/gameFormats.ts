import { GameFormat } from './GameFormatCard';

export const traditionalFormats: GameFormat[] = [
  {
    id: 'stroke-play',
    name: 'Stroke Play',
    description: 'Lowest total score wins',
    icon: 'trophy',
  },
  {
    id: 'match-play',
    name: 'Match Play',
    description: 'Win holes head-to-head',
    icon: 'users',
  },
  {
    id: 'scramble',
    name: 'Scramble',
    description: 'Teams play best shot',
    icon: 'shuffle',
  },
  {
    id: 'best-ball',
    name: 'Best Ball',
    description: 'Best score per team',
    icon: 'star',
  },
  {
    id: 'nassau',
    name: 'Nassau',
    description: 'Front 9, back 9, and total',
    icon: 'grid',
    hasRules: true,
  },
  {
    id: 'skins',
    name: 'Skins',
    description: 'Win holes outright',
    icon: 'flame',
    hasRules: true,
  },
  {
    id: 'wolf',
    name: 'Wolf',
    description: 'Choose your partner or go alone',
    icon: 'zap',
    hasRules: true,
  },
  {
    id: 'wolf-turd',
    name: 'Wolf Turd',
    description: 'Wolf with a twist',
    icon: 'target',
    hasRules: true,
  },
  {
    id: 'snake',
    name: 'Snake',
    description: 'Last 3-putt holder loses',
    icon: 'zap',
    hasRules: true,
  },
];

export const sideGames = [
  { id: 'bingo-bango-bongo', name: 'Bingo-Bango-Bongo' },
  { id: 'quota', name: 'Quota' },
  { id: 'sixes', name: 'Sixes / Hollywood' },
  { id: 'chicago', name: 'Chicago' },
  { id: 'rabbit', name: 'Rabbit' },
  { id: 'hammer', name: 'Hammer' },
  { id: 'vegas', name: 'Vegas' },
];

export const gameRules: Record<string, string[]> = {
  nassau: [
    'Nassau is three separate bets: front nine, back nine, and overall 18.',
    'Each bet is won by the player or team with the lowest score for that segment.',
    'Presses (additional bets) can be triggered automatically when down by 2 or more holes, or manually initiated.',
    'Presses create new bets that run alongside the original bets, allowing comebacks.',
  ],
  skins: [
    'Each hole is worth a set amount (a "skin").',
    'The player with the lowest score on a hole wins the skin.',
    'If two or more players tie for the lowest score, the skin carries over to the next hole.',
    'Carryovers can multiply the value, creating bigger payouts on subsequent holes.',
  ],
  wolf: [
    'Players rotate being the "Wolf" each hole, teeing off last.',
    'After each player tees off, the Wolf can choose them as a partner or pass.',
    'If the Wolf passes on all players, they play alone ("Lone Wolf") for double points.',
    'Partners score together. Lone Wolf scores are doubled. Points determine payouts.',
  ],
  'wolf-turd': [
    'Similar to Wolf, but with an added penalty.',
    'The player with the worst score on a hole becomes the "Turd."',
    'The Turd loses points or pays a penalty to the other players.',
    'Adds strategy and risk to Wolf gameplay.',
  ],
  snake: [
    'The "Snake" is passed to the last player who 3-putts.',
    'At the end of the round, whoever holds the Snake pays the pot or loses points.',
    'Optional: escalating pot where each 3-putt increases the penalty.',
    'Adds pressure to avoid 3-putts, especially late in the round.',
  ],
};

export interface GameConfigFields {
  [key: string]: {
    key: string;
    label: string;
    type: 'number' | 'toggle' | 'select';
    defaultValue: any;
    options?: { value: any; label: string }[];
    min?: number;
    max?: number;
    step?: number;
  }[];
}

export const gameConfigFields: GameConfigFields = {
  nassau: [
    { key: 'frontBet', label: 'Front 9 Bet ($)', type: 'number', defaultValue: 10, min: 1, max: 1000, step: 5 },
    { key: 'backBet', label: 'Back 9 Bet ($)', type: 'number', defaultValue: 10, min: 1, max: 1000, step: 5 },
    { key: 'overallBet', label: 'Overall Bet ($)', type: 'number', defaultValue: 10, min: 1, max: 1000, step: 5 },
    { 
      key: 'pressMode', 
      label: 'Press Mode', 
      type: 'select', 
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'manual', label: 'Manual' },
      ]
    },
    { key: 'pressDownBy', label: 'Auto Press When Down By', type: 'number', defaultValue: 2, min: 1, max: 5 },
    { key: 'pressCap', label: 'Max Presses', type: 'number', defaultValue: 3, min: 0, max: 10 },
  ],
  skins: [
    { key: 'holeValue', label: 'Value Per Hole ($)', type: 'number', defaultValue: 5, min: 1, max: 100, step: 1 },
    { key: 'carryovers', label: 'Enable Carryovers', type: 'toggle', defaultValue: true },
    { key: 'carryoverMultiplier', label: 'Carryover Multiplier', type: 'number', defaultValue: 1, min: 1, max: 5, step: 0.5 },
    { key: 'birdiesOnly', label: 'Birdies Only', type: 'toggle', defaultValue: false },
  ],
  wolf: [
    { 
      key: 'teeOrder', 
      label: 'Tee Order', 
      type: 'select', 
      defaultValue: 'rotate',
      options: [
        { value: 'rotate', label: 'Auto Rotate' },
        { value: 'custom', label: 'Custom' },
      ]
    },
    { key: 'loneWolfPoints', label: 'Lone Wolf Points', type: 'number', defaultValue: 4, min: 2, max: 10 },
    { key: 'partnerPoints', label: 'Partner Win Points', type: 'number', defaultValue: 2, min: 1, max: 5 },
    { key: 'stolenPoints', label: 'Stolen Wolf Points', type: 'number', defaultValue: 3, min: 1, max: 8 },
    { key: 'payoutMultiplier', label: 'Payout Per Point ($)', type: 'number', defaultValue: 1, min: 0.5, max: 10, step: 0.5 },
  ],
  'wolf-turd': [
    { 
      key: 'teeOrder', 
      label: 'Tee Order', 
      type: 'select', 
      defaultValue: 'rotate',
      options: [
        { value: 'rotate', label: 'Auto Rotate' },
        { value: 'custom', label: 'Custom' },
      ]
    },
    { key: 'loneWolfPoints', label: 'Lone Wolf Points', type: 'number', defaultValue: 4, min: 2, max: 10 },
    { key: 'partnerPoints', label: 'Partner Win Points', type: 'number', defaultValue: 2, min: 1, max: 5 },
    { key: 'turdPenalty', label: 'Turd Penalty Points', type: 'number', defaultValue: 2, min: 1, max: 5 },
    { key: 'payoutMultiplier', label: 'Payout Per Point ($)', type: 'number', defaultValue: 1, min: 0.5, max: 10, step: 0.5 },
  ],
  snake: [
    { key: 'potAmount', label: 'Total Pot ($)', type: 'number', defaultValue: 20, min: 5, max: 500, step: 5 },
    { key: 'escalating', label: 'Escalating Pot', type: 'toggle', defaultValue: false },
    { 
      key: 'settlement', 
      label: 'Settlement', 
      type: 'select', 
      defaultValue: 'end',
      options: [
        { value: 'end', label: 'End of Round' },
        { value: 'running', label: 'Running Total' },
      ]
    },
  ],
  'bingo-bango-bongo': [
    { key: 'bingoValue', label: 'Bingo (First on Green) $', type: 'number', defaultValue: 1, min: 1, max: 20 },
    { key: 'bangoValue', label: 'Bango (Closest to Pin) $', type: 'number', defaultValue: 1, min: 1, max: 20 },
    { key: 'bongoValue', label: 'Bongo (First in Hole) $', type: 'number', defaultValue: 1, min: 1, max: 20 },
  ],
  quota: [
    { key: 'baseQuota', label: 'Base Quota Points', type: 'number', defaultValue: 36, min: 18, max: 72 },
    { key: 'eaglePoints', label: 'Eagle Points', type: 'number', defaultValue: 8, min: 4, max: 20 },
    { key: 'birdiePoints', label: 'Birdie Points', type: 'number', defaultValue: 4, min: 2, max: 10 },
    { key: 'parPoints', label: 'Par Points', type: 'number', defaultValue: 2, min: 0, max: 5 },
  ],
  sixes: [
    { key: 'teamSize', label: 'Team Size', type: 'number', defaultValue: 2, min: 2, max: 4 },
    { key: 'rotationHoles', label: 'Rotate Partners Every X Holes', type: 'number', defaultValue: 6, min: 3, max: 9 },
    { key: 'betPerRotation', label: 'Bet Per Rotation ($)', type: 'number', defaultValue: 10, min: 1, max: 100, step: 5 },
  ],
  chicago: [
    { key: 'quotaBase', label: 'Quota Base', type: 'number', defaultValue: 39, min: 18, max: 72 },
    { key: 'entryFee', label: 'Entry Fee ($)', type: 'number', defaultValue: 5, min: 1, max: 50 },
  ],
  rabbit: [
    { key: 'rabbitValue', label: 'Rabbit Value ($)', type: 'number', defaultValue: 10, min: 1, max: 100, step: 5 },
    { key: 'holes', label: 'Holes to Win', type: 'number', defaultValue: 6, min: 3, max: 9 },
  ],
  hammer: [
    { key: 'startingValue', label: 'Starting Hammer Value ($)', type: 'number', defaultValue: 5, min: 1, max: 50 },
    { key: 'multiplier', label: 'Hammer Multiplier', type: 'number', defaultValue: 2, min: 1.5, max: 5, step: 0.5 },
  ],
  vegas: [
    { key: 'teamSize', label: 'Team Size', type: 'number', defaultValue: 2, min: 2, max: 2 },
    { key: 'pointValue', label: 'Point Value ($)', type: 'number', defaultValue: 1, min: 0.1, max: 10, step: 0.1 },
    { key: 'flipOption', label: 'Allow Score Flipping', type: 'toggle', defaultValue: true },
  ],
};
