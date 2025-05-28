
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
  { id: 'stroke-play', name: 'Stroke Play', description: 'Individual stroke play tournament' },
  { id: 'match-play', name: 'Match Play', description: 'Head-to-head elimination format' },
  { id: 'best-ball', name: 'Best Ball', description: '2 or 4-person team format' },
  { id: 'scramble', name: 'Scramble', description: 'Team scramble format' },
  { id: 'wolf', name: 'Wolf', description: '4-player rotating partnership' },
  { id: 'nassau', name: 'Nassau', description: 'Front 9, Back 9, and Overall bets' },
  { id: 'skins', name: 'Skins', description: 'Hole-by-hole competition' },
  { id: 'stableford', name: 'Stableford', description: 'Points-based scoring system' }
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
            {gameTypes.map((gameType) => (
              <SelectItem key={gameType.id} value={gameType.id}>
                <div>
                  <div className="font-medium">{gameType.name}</div>
                  <div className="text-sm text-gray-500">{gameType.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedGameType && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">{selectedGameType.name}</h4>
          <p className="text-sm text-blue-700">{selectedGameType.description}</p>
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
