
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface TeamCapacity {
  current: number;
  max: number;
  isFull: boolean;
}

interface UnassignedPlayerCardProps {
  player: Player;
  optimalTeamCount: number;
  existingTeamCount: number;
  getTeamCapacity: (teamNumber: number) => TeamCapacity;
  onAddPlayerToTeam: (teamNumber: number, playerId: string) => void;
}

export const UnassignedPlayerCard: React.FC<UnassignedPlayerCardProps> = ({ 
  player, 
  optimalTeamCount, 
  existingTeamCount, 
  getTeamCapacity, 
  onAddPlayerToTeam 
}) => {
  return (
    <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
      <span>{player.name} (HCP: {player.handicapIndex})</span>
      <Select onValueChange={(teamNumber) => onAddPlayerToTeam(parseInt(teamNumber), player.id)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Add to team" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: Math.max(optimalTeamCount, existingTeamCount + 1) }, (_, i) => {
            const teamNumber = i + 1;
            const capacity = getTeamCapacity(teamNumber);
            return (
              <SelectItem 
                key={teamNumber} 
                value={teamNumber.toString()}
                disabled={capacity.isFull}
              >
                Team {teamNumber} ({capacity.current}/{capacity.max})
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
