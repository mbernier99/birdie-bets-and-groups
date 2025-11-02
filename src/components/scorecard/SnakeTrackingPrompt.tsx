import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SnakeTrackingPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  holeNumber: number;
  players: Array<{ id: string; name: string; putts?: number }>;
  onComplete: () => void;
}

export function SnakeTrackingPrompt({
  open,
  onOpenChange,
  tournamentId,
  holeNumber,
  players,
  onComplete
}: SnakeTrackingPromptProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  // Auto-select players who 3-putted (if putt data exists)
  const threePutters = players.filter(p => p.putts && p.putts >= 3);
  
  const handleTogglePlayer = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedPlayers.size === 0) {
      // No 3-putts - snake holder stays the same
      onOpenChange(false);
      onComplete();
      return;
    }

    setSaving(true);

    try {
      // Get the last player selected (if multiple)
      const lastThreePutter = Array.from(selectedPlayers).pop()!;

      // Fetch current snake states
      const { data: snakes } = await supabase
        .from('snake_tracking')
        .select('*')
        .eq('tournament_id', tournamentId);

      if (snakes) {
        // Update each snake type appropriately
        for (const snake of snakes) {
          let shouldUpdate = false;
          if (snake.snake_type === 'front_9' && holeNumber <= 9) shouldUpdate = true;
          if (snake.snake_type === 'back_9' && holeNumber > 9) shouldUpdate = true;
          if (snake.snake_type === 'overall') shouldUpdate = true;

          if (shouldUpdate) {
            await supabase
              .from('snake_tracking')
              .update({
                current_holder_id: lastThreePutter,
                last_hole_updated: holeNumber,
                is_final: (snake.snake_type === 'front_9' && holeNumber === 9) ||
                          (snake.snake_type === 'back_9' && holeNumber === 18) ||
                          (snake.snake_type === 'overall' && holeNumber === 18)
              })
              .eq('id', snake.id);
          }
        }
      }

      toast.success('Snake tracking updated');
      onOpenChange(false);
      onComplete();
    } catch (error) {
      console.error('Error updating snake tracking:', error);
      toast.error('Failed to update snake tracking');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🐍</span>
            Snake Tracking - Hole {holeNumber}
          </DialogTitle>
          <DialogDescription>
            Who 3-putted on this hole? Last player selected gets the snake.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {players.map(player => (
            <div key={player.id} className="flex items-center space-x-3">
              <Checkbox
                id={player.id}
                checked={selectedPlayers.has(player.id)}
                onCheckedChange={() => handleTogglePlayer(player.id)}
              />
              <Label
                htmlFor={player.id}
                className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {player.name}
                {player.putts && player.putts >= 3 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({player.putts} putts)
                  </span>
                )}
              </Label>
            </div>
          ))}

          {threePutters.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No 3-putts detected - select manually or click "No 3-putts"
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedPlayers(new Set());
              handleSubmit();
            }}
            disabled={saving}
          >
            No 3-putts
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
