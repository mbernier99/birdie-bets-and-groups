
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold text-gray-900">Tournament Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="tournament-name">Tournament Name</Label>
          <Input
            id="tournament-name"
            value={data.basicInfo.name}
            onChange={(e) => handleBasicInfoChange('name', e.target.value)}
            placeholder="Sunday Morning Championship"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-players">Maximum Players</Label>
          <Input
            id="max-players"
            type="number"
            value={data.basicInfo.maxPlayers}
            onChange={(e) => handleBasicInfoChange('maxPlayers', parseInt(e.target.value))}
            min="2"
            max="144"
            className="w-full"
          />
        </div>
      </div>

      {/* Player Management */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <h4 className="text-md font-semibold text-gray-900">Add Players</h4>
          <Button
            type="button"
            onClick={addPlayer}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Player</span>
          </Button>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <p>No players added yet. Click "Add Player" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {players.map((player, index) => (
              <div key={player.id} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`player-name-${index}`}>Name</Label>
                    <Input
                      id={`player-name-${index}`}
                      value={player.name}
                      onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                      placeholder="Player Name"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`player-email-${index}`}>Email</Label>
                    <Input
                      id={`player-email-${index}`}
                      type="email"
                      value={player.email}
                      onChange={(e) => handlePlayerChange(index, 'email', e.target.value)}
                      placeholder="player@email.com"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`player-handicap-${index}`}>Handicap Index</Label>
                    <Input
                      id={`player-handicap-${index}`}
                      type="number"
                      step="0.1"
                      min="0"
                      max="54"
                      value={player.handicapIndex}
                      onChange={(e) => handlePlayerChange(index, 'handicapIndex', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => removePlayer(index)}
                      variant="outline"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p><strong>Players:</strong> {players.length} / {data.basicInfo.maxPlayers}</p>
          <p className="text-xs mt-1">You can add more players later in the Players & Teams step.</p>
        </div>
      </div>

      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
        <h4 className="font-medium text-emerald-900 mb-2">Ready to Continue?</h4>
        <p className="text-sm text-emerald-700 mb-3">
          Complete the tournament name and add at least one player to proceed to course setup.
        </p>
        <div className="text-xs text-emerald-600">
          Next: Configure your golf course details and hole information
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
