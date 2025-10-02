import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SideGameChipProps {
  name: string;
  onRemove: () => void;
  onClick: () => void;
}

const SideGameChip: React.FC<SideGameChipProps> = ({ name, onRemove, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-secondary text-secondary-foreground border border-border",
        "hover:bg-secondary/80 transition-colors text-sm font-medium"
      )}
    >
      <span>{name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </button>
  );
};

export default SideGameChip;
