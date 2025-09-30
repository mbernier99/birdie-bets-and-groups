
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, UserPlus } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';
import PlayerManagementModal from './PlayerManagementModal';

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

  const handlePlayersChange = (players: any[]) => {
    onDataChange('players', players);
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

      {/* Add Players */}
      <div className="space-y-4">
        <PlayerManagementModal
          players={players}
          onPlayersChange={handlePlayersChange}
          maxPlayers={data.basicInfo.maxPlayers}
        >
          <Button 
            type="button"
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Add Players
          </Button>
        </PlayerManagementModal>

        {!hasValidPlayers && (
          <div className="text-sm text-destructive bg-destructive/5 p-3 rounded-lg flex items-center space-x-2 border border-destructive/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>At least one player must have a name to proceed</span>
          </div>
        )}
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
