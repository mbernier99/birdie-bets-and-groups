
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
  { id: 'stroke-play', name: 'Stroke Play', description: 'Individual stroke play tournament', minPlayers: 2, maxPlayers: 32 },
  { id: 'best-ball', name: 'Best Ball', description: 'Teams of 2, lowest score on each hole counts', minPlayers: 4, maxPlayers: 16 },
  { id: 'scramble', name: 'Scramble', description: 'Team scramble format - all play from best shot', minPlayers: 4, maxPlayers: 16 },
  { id: 'match-play', name: 'Match Play', description: 'Head-to-head elimination format', minPlayers: 2, maxPlayers: 8 },
  { id: 'nassau', name: 'Nassau', description: 'Three separate bets: front 9, back 9, and overall', minPlayers: 2, maxPlayers: 8 },
  { id: 'skins', name: 'Skins', description: 'Hole-by-hole competition', minPlayers: 2, maxPlayers: 8 },
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

      case 'nassau':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="front-bet">Front 9 Amount</Label>
                <Input
                  id="front-bet"
                  type="number"
                  value={data.gameType.rules.frontBet || 10}
                  onChange={(e) => handleRuleChange('frontBet', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="back-bet">Back 9 Amount</Label>
                <Input
                  id="back-bet"
                  type="number"
                  value={data.gameType.rules.backBet || 10}
                  onChange={(e) => handleRuleChange('backBet', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overall-bet">Overall Amount</Label>
                <Input
                  id="overall-bet"
                  type="number"
                  value={data.gameType.rules.overallBet || 10}
                  onChange={(e) => handleRuleChange('overallBet', parseInt(e.target.value))}
                />
              </div>
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
      <h3 className="text-lg font-semibold text-gray-900">Game Format</h3>
      
      <div className="space-y-2">
        <Label>Select Game Type</Label>
        <Select value={data.gameType.type} onValueChange={(value) => handleGameTypeChange('type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose your tournament format" />
          </SelectTrigger>
          <SelectContent>
            {gameTypes.map((gameType) => (
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
          <h4 className="font-medium text-gray-900">Game Settings</h4>
          {renderGameSpecificRules()}
        </div>
      )}
    </div>
  );
};

export default GameTypeStep;
