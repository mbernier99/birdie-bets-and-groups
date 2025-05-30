
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface Team {
  id: string;
  name: string;
  playerIds: string[];
}

interface TeamCardProps {
  team: Team;
  players: Player[];
  playersPerTeam: number;
  onUpdateTeamName: (teamId: string, name: string) => void;
  onRemovePlayerFromTeam: (teamId: string, playerId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ 
  team, 
  players, 
  playersPerTeam, 
  onUpdateTeamName, 
  onRemovePlayerFromTeam 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <Input
          value={team.name}
          onChange={(e) => onUpdateTeamName(team.id, e.target.value)}
          className="font-medium"
        />
        <span className="text-sm text-gray-600">
          {team.playerIds.length}/{playersPerTeam} players
        </span>
      </div>
      
      <div className="space-y-2">
        {team.playerIds.map(playerId => {
          const player = players.find(p => p.id === playerId);
          return player ? (
            <div key={playerId} className="flex justify-between items-center p-2 bg-emerald-50 rounded">
              <span>{player.name} (HCP: {player.handicapIndex})</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onRemovePlayerFromTeam(team.id, playerId)}
              >
                Remove
              </Button>
            </div>
          ) : null;
        })}
        
        {team.playerIds.length === 0 && (
          <div className="text-gray-500 text-sm">No players assigned</div>
        )}
      </div>
    </div>
  );
};
