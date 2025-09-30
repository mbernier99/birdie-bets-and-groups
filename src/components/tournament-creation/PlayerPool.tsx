import React from 'react';
import SwipeableCard from '@/components/mobile/SwipeableCard';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface PlayerPoolProps {
  players: Player[];
  onSwipeRight?: (playerId: string) => void;
  onSwipeLeft?: (playerId: string) => void;
  onTap?: (playerId: string) => void;
}

export const PlayerPool: React.FC<PlayerPoolProps> = ({
  players,
  onSwipeRight,
  onSwipeLeft,
  onTap,
}) => {
  const { triggerSelection } = useHapticFeedback();

  const handleSwipeRight = (playerId: string) => {
    triggerSelection();
    onSwipeRight?.(playerId);
  };

  const handleSwipeLeft = (playerId: string) => {
    triggerSelection();
    onSwipeLeft?.(playerId);
  };

  return (
    <div className="space-y-2">
      {players.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          All players assigned
        </p>
      ) : (
        players.map(player => (
          <SwipeableCard
            key={player.id}
            onSwipeRight={() => handleSwipeRight(player.id)}
            onSwipeLeft={() => handleSwipeLeft(player.id)}
            className="p-4 cursor-pointer hover:bg-accent/50"
          >
            <div onClick={() => onTap?.(player.id)}>
              <p className="font-medium text-foreground">{player.name}</p>
              <p className="text-sm text-muted-foreground">HCP: {player.handicapIndex}</p>
            </div>
          </SwipeableCard>
        ))
      )}
    </div>
  );
};
