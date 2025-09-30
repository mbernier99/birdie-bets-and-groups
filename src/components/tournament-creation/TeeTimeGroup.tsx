import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface TeeTimeGroupProps {
  groupId: string;
  time: string;
  players: Player[];
  maxPlayers: number;
  onUpdateTime: (groupId: string, time: string) => void;
  onRemovePlayer: (groupId: string, playerId: string) => void;
}

export const TeeTimeGroup: React.FC<TeeTimeGroupProps> = ({
  groupId,
  time,
  players,
  maxPlayers,
  onUpdateTime,
  onRemovePlayer,
}) => {
  const isFull = players.length >= maxPlayers;

  return (
    <Card className={`p-4 ${isFull ? 'border-primary' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Input
          type="time"
          value={time}
          onChange={(e) => onUpdateTime(groupId, e.target.value)}
          className="w-32"
        />
        <span className="text-sm text-muted-foreground ml-auto">
          {players.length}/{maxPlayers} players
        </span>
      </div>

      <div className="space-y-2">
        {players.map(player => (
          <div
            key={player.id}
            className="flex items-center justify-between p-2 bg-accent/50 rounded"
          >
            <div>
              <p className="font-medium text-sm">{player.name}</p>
              <p className="text-xs text-muted-foreground">HCP: {player.handicapIndex}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemovePlayer(groupId, player.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {players.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Drag players here or swipe right
          </p>
        )}
      </div>
    </Card>
  );
};
