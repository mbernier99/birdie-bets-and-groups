import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface DropZoneProps {
  id: string;
  title: string;
  children: ReactNode;
  isHighlighted?: boolean;
  capacity?: { current: number; max: number };
  onDrop?: (draggedId: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  title,
  children,
  isHighlighted,
  capacity,
}) => {
  const isFull = capacity && capacity.current >= capacity.max;

  return (
    <Card
      className={`
        p-4 min-h-[120px] transition-all duration-200
        ${isHighlighted && !isFull ? 'ring-2 ring-primary bg-primary/5' : ''}
        ${isFull ? 'opacity-50' : ''}
      `}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium text-foreground">{title}</h4>
        {capacity && (
          <span className={`text-sm ${isFull ? 'text-destructive' : 'text-muted-foreground'}`}>
            {capacity.current}/{capacity.max}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </Card>
  );
};
