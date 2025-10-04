import { GameFormat } from './GameFormatCard';

export const traditionalFormats: GameFormat[] = [
  {
    id: '2-man-best-ball',
    name: '2 Man Best Ball',
    description: 'Combined total',
    icon: 'users',
    hasRules: true,
  },
  {
    id: '2-man-better-ball',
    name: '2 Man Better Ball',
    description: 'Best of 2',
    icon: 'star',
    hasRules: true,
  },
  {
    id: 'match-play',
    name: 'Match Play',
    description: 'Win holes head-to-head',
    icon: 'target',
    hasRules: true,
  },
  {
    id: 'scramble',
    name: 'Scramble',
    description: 'Best shot, everyone plays from there',
    icon: 'users',
    hasRules: true,
  },
  {
    id: 'nassau',
    name: 'Nassau',
    description: 'Match play front, back and overall plus optional presses',
    icon: 'grid',
    hasRules: true,
  },
  {
    id: 'chapman',
    name: 'Chapman',
    description: 'Partners tee off, swap balls, hit second shots, pick a ball, play alt shot',
    icon: 'shuffle',
    hasRules: true,
  },
  {
    id: 'skins',
    name: 'Skins',
    description: 'Beat the field, earn a skin',
    icon: 'flame',
    hasRules: true,
  },
  {
    id: 'snake',
    name: 'Snake',
    description: '3 putt holds the bag of snakes',
    icon: 'zap',
    hasRules: true,
  },
  {
    id: 'wolf',
    name: 'Wolf',
    description: 'Tee off last, pick your partner',
    icon: 'star',
    hasRules: true,
  },
  {
    id: 'wolf-turd',
    name: 'Wolf Turd',
    description: 'Wolf hits first and must play with the worst shot',
    icon: 'star',
    hasRules: true,
  },
];

export const sideGames = [
  { id: 'skins', name: 'Skins', description: 'Beat the field, earn a skin', allowMultiple: true },
  { id: 'snake', name: 'Snake', description: '3 putt holds the bag of snakes', allowMultiple: true },
  { id: 'wolf', name: 'Wolf', description: 'Tee off last, pick your partner', allowMultiple: false },
  { id: 'wolf-turd', name: 'Wolf Turd', description: 'Wolf hits first and must play with the worst shot', allowMultiple: false },
];

export const gameRules: Record<string, string[]> = {
  '2-man-best-ball': [
    'Two-player teams compete against each other.',
    'Both players on each team play their own ball throughout the round.',
    'The combined total of both players scores is used for each hole.',
    'The team with the lowest combined score for the round wins.',
  ],
  '2-man-better-ball': [
    'Two-player teams compete against each other.',
    'Both players on each team play their own ball throughout the round.',
    'Only the best score from each team counts on each hole.',
    'The team with the lowest total using their best ball scores wins.',
  ],
  nassau: [
    'Nassau is three separate match play bets: front nine, back nine, and overall 18.',
    'Each bet is won by the player or team with the most holes won for that segment.',
    'Presses (additional bets) can be triggered automatically when down by 2 or more holes, or manually initiated.',
    'Presses create new bets that run alongside the original bets, allowing comebacks.',
  ],
  chapman: [
    'Partners both tee off on each hole.',
    'After tee shots, partners swap balls and hit their second shots.',
    'The team selects which ball to continue playing.',
    'Partners alternate shots with the selected ball until holed out.',
  ],
  'match-play': [
    'Play is hole-by-hole competition.',
    'The player or team with the lowest score on a hole wins that hole.',
    'Match is won when one side leads by more holes than remain to play.',
    'Can be played individually or in teams using best ball scoring.',
  ],
  scramble: [
    'All team members tee off on each hole.',
    'The team selects the best shot and all players hit their next shot from that spot.',
    'This process continues until the ball is holed.',
    'Typically played with 2-4 person teams, great for mixed skill levels.',
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
    'Wolf hits first instead of last.',
    'After all players tee off, Wolf must partner with the player who hit the worst tee shot.',
    'The player with the worst score on a hole becomes the "Turd" and loses points.',
    'Adds strategy and risk to Wolf gameplay with penalties.',
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
    type: 'number' | 'toggle' | 'select' | 'player-multiselect';
    defaultValue: any;
    options?: { value: any; label: string }[];
    min?: number;
    max?: number;
    step?: number;
  }[];
}

export const gameConfigFields: GameConfigFields = {
  '2-man-best-ball': [
    { key: 'betAmount', label: 'Bet Amount ($)', type: 'number', defaultValue: 20, min: 1, max: 1000, step: 5 },
    { key: 'useHandicaps', label: 'Use Handicaps', type: 'toggle', defaultValue: true },
  ],
  '2-man-better-ball': [
    { key: 'betAmount', label: 'Bet Amount ($)', type: 'number', defaultValue: 20, min: 1, max: 1000, step: 5 },
    { key: 'useHandicaps', label: 'Use Handicaps', type: 'toggle', defaultValue: true },
  ],
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
  chapman: [
    { key: 'betAmount', label: 'Bet Amount ($)', type: 'number', defaultValue: 20, min: 1, max: 1000, step: 5 },
    { key: 'useHandicaps', label: 'Use Handicaps', type: 'toggle', defaultValue: true },
    {
      key: 'format',
      label: 'Format',
      type: 'select',
      defaultValue: 'stroke',
      options: [
        { value: 'stroke', label: 'Stroke Play' },
        { value: 'match', label: 'Match Play' },
      ]
    },
  ],
  'match-play': [
    { key: 'betAmount', label: 'Bet Amount ($)', type: 'number', defaultValue: 20, min: 1, max: 1000, step: 5 },
    { key: 'useHandicaps', label: 'Use Handicaps', type: 'toggle', defaultValue: true },
    {
      key: 'teamFormat',
      label: 'Team Format',
      type: 'select',
      defaultValue: 'individual',
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'best-ball', label: 'Best Ball Teams' },
      ]
    },
    { key: 'holes', label: 'Number of Holes', type: 'number', defaultValue: 18, min: 9, max: 18, step: 9 },
  ],
  scramble: [
    { key: 'betAmount', label: 'Bet Amount ($)', type: 'number', defaultValue: 20, min: 1, max: 1000, step: 5 },
    { key: 'useHandicaps', label: 'Use Team Handicaps', type: 'toggle', defaultValue: true },
    { key: 'teamSize', label: 'Team Size', type: 'number', defaultValue: 2, min: 2, max: 4 },
    {
      key: 'driverLimit',
      label: 'Driver Limit Per Player',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 18,
    },
  ],
  skins: [
    { key: 'eligiblePlayers', label: 'Eligible Players', type: 'player-multiselect', defaultValue: [] },
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
    { key: 'eligiblePlayers', label: 'Eligible Players', type: 'player-multiselect', defaultValue: [] },
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
};
