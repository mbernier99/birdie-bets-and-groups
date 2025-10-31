import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Award, Users } from 'lucide-react';
import { Press } from '@/types/press';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ManualBetResolutionProps {
  press: Press;
  players: Array<{ id: string; name: string }>;
  onResolved: () => void;
}

export const ManualBetResolution: React.FC<ManualBetResolutionProps> = ({
  press,
  players,
  onResolved
}) => {
  const [open, setOpen] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [resolving, setResolving] = useState(false);

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Unknown';
  };

  const handleResolve = async () => {
    if (!selectedWinner) {
      toast({
        title: "Select a winner",
        description: "Please select who won this bet",
        variant: "destructive"
      });
      return;
    }

    setResolving(true);
    try {
      const { error } = await supabase
        .from('press_bets')
        .update({
          status: selectedWinner === 'tie' ? 'pushed' : 'completed',
          winner_id: selectedWinner === 'tie' ? null : selectedWinner,
          completed_at: new Date().toISOString()
        })
        .eq('id', press.id);

      if (error) throw error;

      toast({
        title: "Bet resolved",
        description: selectedWinner === 'tie' ? 'Bet marked as tie' : `Winner: ${getPlayerName(selectedWinner)}`
      });

      setOpen(false);
      onResolved();
    } catch (error: any) {
      console.error('Error resolving bet:', error);
      toast({
        title: "Resolution failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-1">
          <Award className="h-4 w-4" />
          <span>Resolve</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Bet Resolution</DialogTitle>
          <DialogDescription>
            {press.gameType === 'closest-to-pin' && 'Select who had their ball closest to the pin'}
            {press.gameType === 'longest-drive' && 'Select who had the longest drive'}
            {press.gameType === 'first-to-green' && 'Select who reached the green first'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Camera className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                ${press.amount} - Hole {press.startHole}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">
                {getPlayerName(press.initiatorId)} vs {getPlayerName(press.targetId)}
              </span>
            </div>
          </div>

          <RadioGroup value={selectedWinner} onValueChange={setSelectedWinner}>
            <div className="space-y-3">
              <div className="flex items-center space-between p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={press.initiatorId} id="player1" />
                <Label htmlFor="player1" className="ml-3 flex-1 cursor-pointer">
                  {getPlayerName(press.initiatorId)}
                </Label>
              </div>

              <div className="flex items-center space-between p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={press.targetId} id="player2" />
                <Label htmlFor="player2" className="ml-3 flex-1 cursor-pointer">
                  {getPlayerName(press.targetId)}
                </Label>
              </div>

              <div className="flex items-center space-between p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="tie" id="tie" />
                <Label htmlFor="tie" className="ml-3 flex-1 cursor-pointer">
                  Tie / Push (No money exchanges)
                </Label>
              </div>
            </div>
          </RadioGroup>

          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleResolve}
              disabled={!selectedWinner || resolving}
              className="flex-1"
            >
              {resolving ? 'Resolving...' : 'Confirm Winner'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={resolving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
