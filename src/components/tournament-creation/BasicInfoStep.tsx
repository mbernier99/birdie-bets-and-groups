
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, AlertCircle, UserPlus } from 'lucide-react';
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

      {/* Player Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="text-md font-semibold">Tournament Players</h4>
            <span className="text-destructive">*</span>
          </div>
          
          <PlayerManagementModal
            players={players}
            onPlayersChange={handlePlayersChange}
            maxPlayers={data.basicInfo.maxPlayers}
          >
            <Button 
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Manage Players
            </Button>
          </PlayerManagementModal>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">No players added yet</p>
            <PlayerManagementModal
              players={players}
              onPlayersChange={handlePlayersChange}
              maxPlayers={data.basicInfo.maxPlayers}
            >
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Player
              </Button>
            </PlayerManagementModal>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Player Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{players.length} / {data.basicInfo.maxPlayers} players</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{players.filter(p => p.name.trim()).length} with names</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{players.filter(p => p.email.trim()).length} with emails</span>
              </div>
            </div>

            {/* Quick Player Preview */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-sm">Player List Preview</h5>
                <Badge variant="secondary">
                  {players.filter(p => p.name.trim()).length} ready
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {players.slice(0, 6).map((player) => (
                  <div key={player.id} className="flex items-center justify-between text-sm">
                    <span className={player.name.trim() ? 'text-foreground' : 'text-muted-foreground italic'}>
                      {player.name.trim() || 'Unnamed Player'}
                    </span>
                    <Badge 
                      variant={player.email.trim() ? 'default' : 'outline'} 
                      className="text-xs"
                    >
                      {player.email.trim() ? 'Email' : 'No Email'}
                    </Badge>
                  </div>
                ))}
              </div>
              
              {players.length > 6 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{players.length - 6} more players
                </p>
              )}
            </div>
          </div>
        )}

        {!hasValidPlayers && players.length > 0 && (
          <div className="text-sm text-destructive bg-destructive/5 p-3 rounded-lg flex items-center space-x-2 border border-destructive/20">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>At least one player must have a name to proceed</span>
          </div>
        )}

        {players.some(p => p.email.trim()) && (
          <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
            📧 Email invitations will be sent automatically to players with email addresses when you create the tournament.
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
