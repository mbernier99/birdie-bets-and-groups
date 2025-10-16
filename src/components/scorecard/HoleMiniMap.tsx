import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface HoleMiniMapProps {
  currentHole: number;
  completedHoles: number[];
  onSelectHole: (hole: number) => void;
  className?: string;
}

export const HoleMiniMap: React.FC<HoleMiniMapProps> = ({
  currentHole,
  completedHoles,
  onSelectHole,
  className
}) => {
  return (
    <div className={cn("bg-card rounded-lg border p-4", className)}>
      <h3 className="text-sm font-semibold mb-3">Quick Navigation</h3>
      
      {/* Front 9 */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground mb-2">Front 9</div>
        <div className="grid grid-cols-9 gap-1">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((hole) => {
            const isCompleted = completedHoles.includes(hole);
            const isCurrent = hole === currentHole;
            
            return (
              <Button
                key={hole}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectHole(hole)}
                className={cn(
                  "h-8 w-full p-0 text-xs relative",
                  isCompleted && !isCurrent && "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100",
                  isCurrent && "ring-2 ring-offset-1 ring-primary"
                )}
              >
                {hole}
                {isCompleted && !isCurrent && (
                  <Check className="absolute -top-1 -right-1 h-3 w-3 text-emerald-600" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Back 9 */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">Back 9</div>
        <div className="grid grid-cols-9 gap-1">
          {Array.from({ length: 9 }, (_, i) => i + 10).map((hole) => {
            const isCompleted = completedHoles.includes(hole);
            const isCurrent = hole === currentHole;
            
            return (
              <Button
                key={hole}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectHole(hole)}
                className={cn(
                  "h-8 w-full p-0 text-xs relative",
                  isCompleted && !isCurrent && "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100",
                  isCurrent && "ring-2 ring-offset-1 ring-primary"
                )}
              >
                {hole}
                {isCompleted && !isCurrent && (
                  <Check className="absolute -top-1 -right-1 h-3 w-3 text-emerald-600" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Progress: {completedHoles.length}/18</span>
          <span className="text-emerald-600 font-medium">
            {Math.round((completedHoles.length / 18) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
