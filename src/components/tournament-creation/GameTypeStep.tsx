
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TournamentData } from '../CreateTournamentModal';

interface GameTypeStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const gameTypes = [
  // Team Games
  { id: 'best-ball', name: 'Best Ball', description: 'Teams of 2 or 4, lowest score on each hole counts', category: 'Team', minPlayers: 4, maxPlayers: 16 },
  { id: 'scramble', name: 'Scramble', description: 'Team scramble format - all play from best shot', category: 'Team', minPlayers: 4, maxPlayers: 16 },
  { id: 'alternate-shot', name: 'Alternate Shot', description: 'Partners alternate hitting the same ball', category: 'Team', minPlayers: 4, maxPlayers: 8 },
  { id: 'chapman', name: 'Chapman', description: 'Both tee off, play partner\'s ball for 2nd shot, then alternate', category: 'Team', minPlayers: 4, maxPlayers: 8 },
  { id: 'shamble', name: 'Shamble', description: 'All tee off, play own ball from best drive position', category: 'Team', minPlayers: 4, maxPlayers: 16 },
  
  // Individual Games
  { id: 'stroke-play', name: 'Stroke Play', description: 'Individual stroke play tournament', category: 'Individual', minPlayers: 2, maxPlayers: 32 },
  { id: 'stableford', name: 'Stableford', description: 'Points-based scoring system', category: 'Individual', minPlayers: 2, maxPlayers: 32 },
  
  // Match Play
  { id: 'match-play', name: 'Match Play', description: 'Head-to-head elimination format', category: 'Match Play', minPlayers: 2, maxPlayers: 8 },
  
  // Betting Games
  { id: 'wolf', name: 'Wolf', description: '4-player rotating partnership with betting strategy', category: 'Betting', minPlayers: 4, maxPlayers: 4 },
  { id: 'nassau', name: 'Nassau', description: 'Three separate bets: front 9, back 9, and overall', category: 'Betting', minPlayers: 2, maxPlayers: 8 },
  { id: 'skins', name: 'Skins', description: 'Hole-by-hole competition', category: 'Betting', minPlayers: 2, maxPlayers: 8 },
  { id: 'vegas', name: 'Vegas', description: 'Partners combine scores to create 2-digit number', category: 'Betting', minPlayers: 4, maxPlayers: 4 },
  { id: 'bingo-bango-bongo', name: 'Bingo Bango Bongo', description: 'Three points per hole: first on green, closest to pin, first in hole', category: 'Betting', minPlayers: 3, maxPlayers: 8 },
  { id: 'dots', name: 'Dots (Garbage)', description: 'Side bets for various achievements during round', category: 'Betting', minPlayers: 2, maxPlayers: 8 },
  { id: 'rabbit', name: 'Rabbit', description: 'Catch and hold the rabbit by winning holes', category: 'Betting', minPlayers: 3, maxPlayers: 8 },
  { id: 'snake', name: 'Snake', description: 'Penalty for three-putting, pass to next three-putter', category: 'Betting', minPlayers: 3, maxPlayers: 8 },
  { id: 'chicago', name: 'Chicago', description: 'Points system based on par performance', category: 'Betting', minPlayers: 2, maxPlayers: 8 },
  { id: 'aces-and-deuces', name: 'Aces and Deuces', description: 'Points for being closest/farthest from pin', category: 'Betting', minPlayers: 3, maxPlayers: 8 },
  { id: 'quota', name: 'Quota', description: 'Exceed your quota based on handicap', category: 'Individual', minPlayers: 2, maxPlayers: 16 },
  { id: 'defender', name: 'Defender', description: 'Defend holes by winning or halving them', category: 'Betting', minPlayers: 3, maxPlayers: 8 },
  { id: 'low-ball-high-ball', name: 'Low Ball High Ball', description: 'Points for lowest and highest scores in group', category: 'Betting', minPlayers: 3, maxPlayers: 8 }
];

const GameTypeStep: React.FC<GameTypeStepProps> = ({ data, onDataChange }) => {
  const handleGameTypeChange = (field: string, value: any) => {
    onDataChange('gameType', {
      ...data.gameType,
      [field]: value
    });
  };

  const handleRuleChange = (rule: string, value: any) => {
    handleGameTypeChange('rules', {
      ...data.gameType.rules,
      [rule]: value
    });
  };

  const selectedGameType = gameTypes.find(gt => gt.id === data.gameType.type);

  const renderGameSpecificRules = () => {
    switch (data.gameType.type) {
      case 'best-ball':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Team Size</Label>
              <Select value={data.gameType.rules.teamSize || '2'} onValueChange={(value) => handleRuleChange('teamSize', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2-Person Teams</SelectItem>
                  <SelectItem value="4">4-Person Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="handicap-allowed"
                checked={data.gameType.rules.handicapAllowed || false}
                onCheckedChange={(checked) => handleRuleChange('handicapAllowed', checked)}
              />
              <Label htmlFor="handicap-allowed">Allow Handicaps</Label>
            </div>
          </div>
        );

      case 'vegas':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="point-value">Point Value</Label>
              <Input
                id="point-value"
                type="number"
                value={data.gameType.rules.pointValue || 1}
                onChange={(e) => handleRuleChange('pointValue', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="flip-allowed"
                checked={data.gameType.rules.flipAllowed || true}
                onCheckedChange={(checked) => handleRuleChange('flipAllowed', checked)}
              />
              <Label htmlFor="flip-allowed">Allow Score Flipping</Label>
            </div>
          </div>
        );

      case 'bingo-bango-bongo':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bingo-points">Bingo Points (First on Green)</Label>
                <Input
                  id="bingo-points"
                  type="number"
                  value={data.gameType.rules.bingoPoints || 1}
                  onChange={(e) => handleRuleChange('bingoPoints', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bango-points">Bango Points (Closest to Pin)</Label>
                <Input
                  id="bango-points"
                  type="number"
                  value={data.gameType.rules.bangoPoints || 1}
                  onChange={(e) => handleRuleChange('bangoPoints', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bongo-points">Bongo Points (First in Hole)</Label>
                <Input
                  id="bongo-points"
                  type="number"
                  value={data.gameType.rules.bongoPoints || 1}
                  onChange={(e) => handleRuleChange('bongoPoints', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        );

      case 'dots':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sandies"
                  checked={data.gameType.rules.sandies || true}
                  onCheckedChange={(checked) => handleRuleChange('sandies', checked)}
                />
                <Label htmlFor="sandies">Sandies (Sand Save)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="birdies"
                  checked={data.gameType.rules.birdies || true}
                  onCheckedChange={(checked) => handleRuleChange('birdies', checked)}
                />
                <Label htmlFor="birdies">Birdies</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="greenies"
                  checked={data.gameType.rules.greenies || true}
                  onCheckedChange={(checked) => handleRuleChange('greenies', checked)}
                />
                <Label htmlFor="greenies">Greenies (GIR Closest)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="polies"
                  checked={data.gameType.rules.polies || true}
                  onCheckedChange={(checked) => handleRuleChange('polies', checked)}
                />
                <Label htmlFor="polies">Polies (Longest Putt)</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dot-value">Value per Dot</Label>
              <Input
                id="dot-value"
                type="number"
                value={data.gameType.rules.dotValue || 1}
                onChange={(e) => handleRuleChange('dotValue', parseInt(e.target.value))}
              />
            </div>
          </div>
        );

      case 'wolf':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wolf-points">Points per Hole</Label>
              <Input
                id="wolf-points"
                type="number"
                value={data.gameType.rules.pointsPerHole || 1}
                onChange={(e) => handleRuleChange('pointsPerHole', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lone-wolf-allowed"
                checked={data.gameType.rules.loneWolfAllowed || true}
                onCheckedChange={(checked) => handleRuleChange('loneWolfAllowed', checked)}
              />
              <Label htmlFor="lone-wolf-allowed">Allow Lone Wolf</Label>
            </div>
          </div>
        );

      case 'nassau':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="front-bet">Front 9 Bet</Label>
                <Input
                  id="front-bet"
                  type="number"
                  value={data.gameType.rules.frontBet || 10}
                  onChange={(e) => handleRuleChange('frontBet', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="back-bet">Back 9 Bet</Label>
                <Input
                  id="back-bet"
                  type="number"
                  value={data.gameType.rules.backBet || 10}
                  onChange={(e) => handleRuleChange('backBet', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overall-bet">Overall Bet</Label>
                <Input
                  id="overall-bet"
                  type="number"
                  value={data.gameType.rules.overallBet || 10}
                  onChange={(e) => handleRuleChange('overallBet', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="press-allowed"
                checked={data.gameType.rules.pressAllowed || true}
                onCheckedChange={(checked) => handleRuleChange('pressAllowed', checked)}
              />
              <Label htmlFor="press-allowed">Allow Automatic Press</Label>
            </div>
          </div>
        );

      case 'skins':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skin-value">Value per Skin</Label>
              <Input
                id="skin-value"
                type="number"
                value={data.gameType.rules.skinValue || 5}
                onChange={(e) => handleRuleChange('skinValue', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="carryover-enabled"
                checked={data.gameType.rules.carryoverEnabled || true}
                onCheckedChange={(checked) => handleRuleChange('carryoverEnabled', checked)}
              />
              <Label htmlFor="carryover-enabled">Enable Carryover for Ties</Label>
            </div>
          </div>
        );

      case 'stableford':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eagle-points">Eagle Points</Label>
                <Input
                  id="eagle-points"
                  type="number"
                  value={data.gameType.rules.eaglePoints || 4}
                  onChange={(e) => handleRuleChange('eaglePoints', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birdie-points">Birdie Points</Label>
                <Input
                  id="birdie-points"
                  type="number"
                  value={data.gameType.rules.birdiePoints || 3}
                  onChange={(e) => handleRuleChange('birdiePoints', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="par-points">Par Points</Label>
                <Input
                  id="par-points"
                  type="number"
                  value={data.gameType.rules.parPoints || 2}
                  onChange={(e) => handleRuleChange('parPoints', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bogey-points">Bogey Points</Label>
                <Input
                  id="bogey-points"
                  type="number"
                  value={data.gameType.rules.bogeyPoints || 1}
                  onChange={(e) => handleRuleChange('bogeyPoints', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        );

      case 'chicago':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quota-base">Quota Base (Points for Par)</Label>
              <Input
                id="quota-base"
                type="number"
                value={data.gameType.rules.quotaBase || 36}
                onChange={(e) => handleRuleChange('quotaBase', parseInt(e.target.value))}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="handicap-allowed-default"
              checked={data.gameType.rules.handicapAllowed || false}
              onCheckedChange={(checked) => handleRuleChange('handicapAllowed', checked)}
            />
            <Label htmlFor="handicap-allowed-default">Allow Handicaps</Label>
          </div>
        );
    }
  };

  // Group games by category
  const gamesByCategory = gameTypes.reduce((acc, game) => {
    if (!acc[game.category]) acc[game.category] = [];
    acc[game.category].push(game);
    return acc;
  }, {} as Record<string, typeof gameTypes>);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Game Type & Rules</h3>
      
      <div className="space-y-2">
        <Label>Game Format</Label>
        <Select value={data.gameType.type} onValueChange={(value) => handleGameTypeChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a game format" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(gamesByCategory).map(([category, games]) => (
              <div key={category}>
                <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                  {category}
                </div>
                {games.map((gameType) => (
                  <SelectItem key={gameType.id} value={gameType.id}>
                    <div>
                      <div className="font-medium">{gameType.name}</div>
                      <div className="text-sm text-gray-500">{gameType.description}</div>
                      <div className="text-xs text-gray-400">
                        {gameType.minPlayers === gameType.maxPlayers 
                          ? `${gameType.minPlayers} players` 
                          : `${gameType.minPlayers}-${gameType.maxPlayers} players`}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGameType && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">{selectedGameType.name}</h4>
          <p className="text-sm text-blue-700">{selectedGameType.description}</p>
          <p className="text-xs text-blue-600 mt-1">
            {selectedGameType.minPlayers === selectedGameType.maxPlayers 
              ? `Requires exactly ${selectedGameType.minPlayers} players` 
              : `Requires ${selectedGameType.minPlayers}-${selectedGameType.maxPlayers} players`}
          </p>
        </div>
      )}

      {data.gameType.type && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Game-Specific Rules</h4>
          {renderGameSpecificRules()}
        </div>
      )}
    </div>
  );
};

export default GameTypeStep;
