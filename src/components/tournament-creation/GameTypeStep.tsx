import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';

interface GameTypeStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const allGameTypes = [
  // Individual formats
  { id: 'stroke-play', name: 'Stroke Play', description: 'Lowest score wins', format: 'individual', icon: '🎯', minPlayers: 2, maxPlayers: 32 },
  { id: 'stableford', name: 'Stableford', description: 'Highest number of points wins', format: 'individual', icon: '123', minPlayers: 2, maxPlayers: 32 },
  { id: 'match-play', name: 'Match Play', description: 'Head to head matches with optional presses', format: 'individual', icon: '👥', minPlayers: 2, maxPlayers: 8 },
  { id: 'nassau', name: 'Nassau', description: 'Match Play with front, back, and overall wagers, plus optional presses', format: 'individual', icon: '💰', minPlayers: 2, maxPlayers: 8 },
  { id: 'skins', name: 'Skins', description: 'Earn a skin by beating the entire field on a given hole. Skins can also be added alongside any other game type.', format: 'individual', icon: '📊', minPlayers: 2, maxPlayers: 8 },
  { id: 'quota', name: 'Quota', description: 'Modified Stableford with a points target for each player', format: 'individual', icon: '🎲', minPlayers: 2, maxPlayers: 32 },
  
  // Team formats
  { id: 'best-ball', name: 'Best Ball', description: 'Combined total, best X out of Y balls', format: 'team', icon: '⭐', minPlayers: 4, maxPlayers: 16 },
  { id: 'best-ball-match-play', name: 'Best Ball Match Play', description: 'Head to head team matches with optional presses', format: 'team', icon: '👥', minPlayers: 4, maxPlayers: 16 },
  { id: 'team-nassau', name: 'Team Nassau', description: 'Match Play with front, back, and overall wagers, plus optional presses', format: 'team', icon: '💰', minPlayers: 4, maxPlayers: 16 },
  { id: 'scramble', name: 'Scramble', description: 'Everyone hits, pick the best shot and repeat', format: 'team', icon: '🎯', minPlayers: 4, maxPlayers: 16 },
  { id: 'chapman', name: 'Chapman / Pinehurst', description: 'Partners tee off, swap balls, hit second shots, pick a ball, play alt shot in', format: 'team', icon: '🔄', minPlayers: 4, maxPlayers: 16 },
  { id: 'alternate-shot', name: 'Alternate Shot', description: 'Partners alternate shots to produce a single team score', format: 'team', icon: '🔁', minPlayers: 4, maxPlayers: 16 },
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

  // Filter game types based on selected format
  const selectedFormat = data.gameType.format || 'individual';
  const gameTypes = allGameTypes.filter(gt => gt.format === selectedFormat);
  
  const selectedGameType = allGameTypes.find(gt => gt.id === data.gameType.type);
  const isComplete = !!data.gameType.type;

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

      case 'best-ball-match-play':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="handicap-allowed-bbmp"
                checked={data.gameType.rules.handicapAllowed || false}
                onCheckedChange={(checked) => handleRuleChange('handicapAllowed', checked)}
              />
              <Label htmlFor="handicap-allowed-bbmp">Allow Handicaps</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="match-length">Match Length</Label>
              <Select 
                value={data.gameType.rules.matchLength || '18'} 
                onValueChange={(value) => handleRuleChange('matchLength', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">9 Holes</SelectItem>
                  <SelectItem value="18">18 Holes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Team Format Rules</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Teams of exactly 2 players each</li>
                <li>• Both players play their own ball</li>
                <li>• Lower net score counts for the team on each hole</li>
                <li>• Teams compete hole-by-hole (win/lose/halve)</li>
                <li>• Match ends when one team cannot catch up</li>
              </ul>
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

  const formatTitle = selectedFormat === 'individual' ? 'Individual Games' : 'Team Games';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">{formatTitle}</h3>
        <p className="text-muted-foreground">Choose your game type</p>
      </div>

      <div className="space-y-3">
        {gameTypes.map((gameType) => {
          const isSelected = data.gameType.type === gameType.id;
          return (
            <div
              key={gameType.id}
              onClick={() => handleGameTypeChange('type', gameType.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full text-2xl ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-primary/10'
                }`}>
                  {gameType.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-foreground mb-1">{gameType.name}</h4>
                  <p className="text-sm text-muted-foreground">{gameType.description}</p>
                </div>
                <ChevronRight className={`h-5 w-5 mt-1 ${
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
            </div>
          );
        })}
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

      <div className={`p-4 rounded-lg border ${isComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h4 className={`font-medium mb-2 ${isComplete ? 'text-emerald-900' : 'text-yellow-900'}`}>
          {isComplete ? 'Game Format Selected!' : 'Select Game Format'}
        </h4>
        <p className={`text-sm mb-3 ${isComplete ? 'text-emerald-700' : 'text-yellow-700'}`}>
          {isComplete 
            ? 'Your game format has been selected. You can proceed to organize players and teams.'
            : 'Please select a game format to continue to the next step.'
          }
        </p>
        <div className={`text-xs ${isComplete ? 'text-emerald-600' : 'text-yellow-600'}`}>
          Next: Organize players and teams for your tournament
        </div>
      </div>
    </div>
  );
};

export default GameTypeStep;
