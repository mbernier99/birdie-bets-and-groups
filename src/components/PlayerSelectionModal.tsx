import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  handicap?: number;
  currentHole: number;
  thru: number;
  toPar: number;
}

interface PlayerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  title?: string;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  isOpen,
  onClose,
  players,
  onSelectPlayer,
  title = "Select Player to Challenge"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>(players);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPlayers(
        players.filter(p => 
          p.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, players]);

  const handleSelectPlayer = (player: Player) => {
    onSelectPlayer(player);
    onClose();
    setSearchQuery('');
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Player List */}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No players found</p>
              </div>
            ) : (
              filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 transition-all text-left",
                    "hover:border-emerald-500 hover:bg-emerald-50/50",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-emerald-200">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{player.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Thru {player.thru} holes
                          {player.handicap !== undefined && ` • HCP ${player.handicap}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-lg font-bold",
                        player.toPar < 0 && "text-blue-600",
                        player.toPar > 0 && "text-red-600",
                        player.toPar === 0 && "text-gray-900"
                      )}>
                        {player.toPar > 0 ? '+' : ''}{player.toPar}
                      </div>
                      {player.currentHole <= 18 && (
                        <Badge variant="secondary" className="text-xs">
                          Hole {player.currentHole}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="pt-2 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerSelectionModal;
