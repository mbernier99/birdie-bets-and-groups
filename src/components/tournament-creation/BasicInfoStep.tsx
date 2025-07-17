
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, AlertCircle } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';

interface BasicInfoStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onDataChange }) => {
  const handleBasicInfoChange = (field: string, value: any) => {
    onDataChange('basicInfo', {
      ...data.basicInfo,
      [field]: value
    });
  };

  const handlePlayerChange = (index: number, field: string, value: any) => {
    const updatedPlayers = [...(data.players || [])];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [field]: field === 'handicapIndex' ? parseFloat(value) : value
    };
    onDataChange('players', updatedPlayers);
  };

  const addPlayer = () => {
    const newPlayer = {
      id: `player-${Date.now()}`,
      name: '',
      email: '',
      handicapIndex: 18.0,
      status: 'invited' as const
    };
    onDataChange('players', [...(data.players || []), newPlayer]);
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = [...(data.players || [])];
    updatedPlayers.splice(index, 1);
    onDataChange('players', updatedPlayers);
  };

  const players = data.players || [];
  const hasValidPlayers = players.some(p => p.name.trim());
  const isComplete = data.basicInfo.name.trim() && hasValidPlayers;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tournament-name" className="flex items-center space-x-1">
              <span>Tournament Name</span>
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tournament-name"
              value={data.basicInfo.name}
              onChange={(e) => handleBasicInfoChange('name', e.target.value)}
              placeholder="Sunday Morning Championship"
              className={`${!data.basicInfo.name.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
            />
            {!data.basicInfo.name.trim() && (
              <p className="text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>Tournament name is required</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-players">Number of Players</Label>
            <Input
              id="max-players"
              type="number"
              value={data.basicInfo.maxPlayers}
              onChange={(e) => handleBasicInfoChange('maxPlayers', parseInt(e.target.value))}
              min="2"
              max="144"
            />
          </div>
        </div>
      </div>

      {/* Player Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="text-md font-semibold text-gray-900">Add Players</h4>
            <span className="text-red-500">*</span>
          </div>
          <Button
            type="button"
            onClick={addPlayer}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Player</span>
          </Button>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-red-200">
            <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm">No players added yet. Click "Add Player" to get started.</p>
            <p className="text-xs text-red-600 mt-1">At least one player with a name is required</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {players.map((player, index) => (
              <div key={player.id} className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end">
                  <div className="space-y-1">
                    <Label htmlFor={`player-name-${index}`} className="text-xs flex items-center space-x-1">
                      <span>Name</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`player-name-${index}`}
                      value={player.name}
                      onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                      placeholder="Player Name"
                      className={`h-8 ${!player.name.trim() ? 'border-red-300' : ''}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`player-email-${index}`} className="text-xs flex items-center space-x-1">
                      <span>Email</span>
                      <span className="text-blue-600 text-[10px]">(for invitation)</span>
                    </Label>
                    <Input
                      id={`player-email-${index}`}
                      type="email"
                      value={player.email}
                      onChange={(e) => handlePlayerChange(index, 'email', e.target.value)}
                      placeholder="player@email.com"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`player-handicap-${index}`} className="text-xs">Handicap</Label>
                    <Input
                      id={`player-handicap-${index}`}
                      type="number"
                      step="0.1"
                      min="0"
                      max="54"
                      value={player.handicapIndex}
                      onChange={(e) => handlePlayerChange(index, 'handicapIndex', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs opacity-0">Remove</Label>
                    <Button
                      type="button"
                      onClick={() => removePlayer(index)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-full text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!hasValidPlayers && players.length > 0 && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>At least one player must have a name to proceed</span>
          </div>
        )}

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg space-y-2">
          <p><strong>Players:</strong> {players.length} / {data.basicInfo.maxPlayers}</p>
          {players.some(p => p.email.trim()) && (
            <p className="text-blue-700">
              📧 Email invitations will be sent automatically to players with email addresses when you create the tournament.
            </p>
          )}
        </div>
      </div>

      <div className={`p-3 rounded-lg border ${isComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className={`text-sm ${isComplete ? 'text-emerald-700' : 'text-yellow-700'}`}>
          {isComplete 
            ? '✓ Ready to continue to Course Setup'
            : 'Complete tournament name and add at least one player to continue'
          }
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
