import React from 'react';
import { Trophy, Users, Shuffle, Star, Grid3x3, Flame, Zap, Target, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GameFormat {
  id: string;
  name: string;
  description: string;
  icon: 'trophy' | 'users' | 'shuffle' | 'star' | 'grid' | 'flame' | 'zap' | 'target';
  hasRules?: boolean;
}

interface GameFormatCardProps {
  format: GameFormat;
  isSelected: boolean;
  onSelect: () => void;
  onShowRules?: () => void;
}

const iconMap = {
  trophy: Trophy,
  users: Users,
  shuffle: Shuffle,
  star: Star,
  grid: Grid3x3,
  flame: Flame,
  zap: Zap,
  target: Target,
};

const GameFormatCard: React.FC<GameFormatCardProps> = ({ format, isSelected, onSelect, onShowRules }) => {
  const Icon = iconMap[format.icon];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative flex-shrink-0 w-36 h-40 p-4 rounded-2xl border-2 transition-all",
        "flex flex-col items-center justify-center gap-3 active:scale-95",
        isSelected 
          ? "bg-primary text-primary-foreground border-primary shadow-lg" 
          : "bg-card border-border hover:border-primary/50"
      )}
    >
      {format.hasRules && onShowRules && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowRules();
          }}
          className={cn(
            "absolute top-2 right-2 p-1 rounded-full transition-colors",
            isSelected ? "hover:bg-primary-foreground/20" : "hover:bg-accent"
          )}
        >
          <Info className="h-4 w-4" />
        </button>
      )}
      
      <Icon className="h-10 w-10" />
      <div className="text-center">
        <div className="font-semibold text-sm">{format.name}</div>
        {isSelected && (
          <div className="text-xs opacity-90 mt-1 line-clamp-2">{format.description}</div>
        )}
      </div>
    </button>
  );
};

export default GameFormatCard;
