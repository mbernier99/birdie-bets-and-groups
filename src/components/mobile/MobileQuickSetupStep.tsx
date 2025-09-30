import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Minus, Users, Calendar, Trophy, Target, MapPin } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface MobileQuickSetupStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const gameTypes = [
  { id: 'strokePlay', name: 'Stroke Play', icon: Target, description: 'Lowest total score wins' },
  { id: 'matchPlay', name: 'Match Play', icon: Trophy, description: 'Win individual holes' },
  { id: 'skins', name: 'Skins', icon: Target, description: 'Win money per hole' },
  { id: 'scramble', name: 'Scramble', icon: Users, description: 'Team plays best shot' },
  { id: 'bestBall', name: 'Best Ball', icon: Users, description: 'Best score per hole' },
];

const MobileQuickSetupStep: React.FC<MobileQuickSetupStepProps> = ({ data, onDataChange }) => {
  const { triggerImpact } = useHapticFeedback();
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleBasicInfoChange = (field: string, value: any) => {
    onDataChange('basicInfo', { ...data.basicInfo, [field]: value });
  };

  const handleGameTypeSelect = (gameType: string) => {
    triggerImpact('light');
    const isTeamGame = ['scramble', 'bestBall', 'alternateShot', 'fourball', 'chapman'].includes(gameType);
    onDataChange('gameType', {
      type: gameType,
      rules: {
        teamSize: isTeamGame ? 2 : 0,
        matchFormat: gameType === 'matchPlay' ? 'matchPlay' : 'strokePlay',
      },
    });
  };

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    
    triggerImpact('light');
    const newPlayer = {
      id: `player-${Date.now()}`,
      name: newPlayerName.trim(),
      email: '',
      handicapIndex: 15,
      status: 'accepted' as const,
    };

    onDataChange('players', [...data.players, newPlayer]);
    setNewPlayerName('');
  };

  const removePlayer = (playerId: string) => {
    triggerImpact('light');
    onDataChange('players', data.players.filter(p => p.id !== playerId));
  };

  const adjustMaxPlayers = (delta: number) => {
    triggerImpact('light');
    const newMax = Math.max(2, Math.min(24, data.basicInfo.maxPlayers + delta));
    handleBasicInfoChange('maxPlayers', newMax);
  };

  return (
    <div className="space-y-6">
      {/* Tournament Name */}
      <div className="space-y-2">
        <Label htmlFor="tournament-name" className="text-base font-semibold">
          Tournament Name
        </Label>
        <Input
          id="tournament-name"
          placeholder="Sunday Morning Game"
          value={data.basicInfo.name}
          onChange={(e) => handleBasicInfoChange('name', e.target.value)}
          className="h-12 text-base"
          autoFocus
        />
      </div>

      {/* Max Players */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Max Players
        </Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustMaxPlayers(-1)}
            className="h-11 w-11"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex-1 h-11 flex items-center justify-center font-semibold text-lg border rounded-md">
            {data.basicInfo.maxPlayers}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjustMaxPlayers(1)}
            className="h-11 w-11"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Game Type Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Game Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {gameTypes.map((game) => {
            const Icon = game.icon;
            const isSelected = data.gameType.type === game.id;
            
            return (
              <Card
                key={game.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleGameTypeSelect(game.id)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="font-semibold text-sm">{game.name}</div>
                  <div className="text-xs text-muted-foreground leading-tight">
                    {game.description}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Course Name (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="course-name" className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Course Name (Optional)
        </Label>
        <Input
          id="course-name"
          placeholder="Pebble Beach Golf Links"
          value={data.course.name}
          onChange={(e) => onDataChange('course', { ...data.course, name: e.target.value })}
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">You can add detailed course info later</p>
      </div>

      {/* Add Players */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Players</Label>
        
        <div className="flex gap-2">
          <Input
            placeholder="Player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            className="h-11"
          />
          <Button onClick={addPlayer} size="icon" className="h-11 w-11 flex-shrink-0">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {data.players.length > 0 && (
          <div className="space-y-2">
            {data.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePlayer(player.id)}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {data.players.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Add players to get started
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileQuickSetupStep;
