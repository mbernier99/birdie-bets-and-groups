import React from 'react';
import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface DraggablePlayerCardProps {
  player: Player;
  isDragging?: boolean;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  style?: React.CSSProperties;
}

export const DraggablePlayerCard: React.FC<DraggablePlayerCardProps> = ({
  player,
  isDragging,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  style,
}) => {
  return (
    <Card
      className={`
        p-4 touch-none transition-all duration-200 min-h-[56px] flex items-center gap-3
        ${isDragging ? 'shadow-lg scale-105 opacity-90 z-50' : 'shadow-sm hover:shadow-md'}
      `}
      style={style}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{player.name}</p>
        <p className="text-sm text-muted-foreground">HCP: {player.handicapIndex}</p>
      </div>
    </Card>
  );
};
