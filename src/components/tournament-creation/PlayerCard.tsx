
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface PlayerCardProps {
  player: Player;
  onUpdateStatus: (playerId: string, status: 'invited' | 'accepted' | 'declined') => void;
  onUpdateName: (playerId: string, newName: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  onUpdateStatus, 
  onUpdateName, 
  onRemovePlayer 
}) => {
  const [editingPlayer, setEditingPlayer] = useState<boolean>(false);
  const [editingName, setEditingName] = useState('');

  const startEditingPlayer = () => {
    setEditingPlayer(true);
    setEditingName(player.name);
  };

  const savePlayerName = () => {
    if (editingName.trim()) {
      onUpdateName(player.id, editingName.trim());
    }
    setEditingPlayer(false);
    setEditingName('');
  };

  const cancelEditingPlayer = () => {
    setEditingPlayer(false);
    setEditingName('');
  };

  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <div>
        <div className="flex items-center space-x-2">
          {editingPlayer ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="w-48"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') savePlayerName();
                  if (e.key === 'Escape') cancelEditingPlayer();
                }}
              />
              <Button size="sm" variant="ghost" onClick={savePlayerName}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEditingPlayer}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="font-medium">{player.name}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={startEditingPlayer}
                className="h-6 w-6 p-0"
              >
                <Edit2 className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600">{player.email}</div>
        <div className="text-sm text-gray-600">HCP: {player.handicapIndex}</div>
      </div>
      <div className="flex items-center space-x-2">
        <Select 
          value={player.status} 
          onValueChange={(value: 'invited' | 'accepted' | 'declined') => onUpdateStatus(player.id, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => onRemovePlayer(player.id)}>
          Remove
        </Button>
      </div>
    </div>
  );
};
