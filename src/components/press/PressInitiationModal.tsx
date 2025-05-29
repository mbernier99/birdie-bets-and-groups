
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PressRequest } from '../../types/press';

interface PressInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlayer: { id: string; name: string } | null;
  currentHole: number;
  onSubmit: (request: PressRequest) => void;
}

const PressInitiationModal: React.FC<PressInitiationModalProps> = ({
  isOpen,
  onClose,
  targetPlayer,
  currentHole,
  onSubmit
}) => {
  const [amount, setAmount] = useState<string>('');
  const [startHole, setStartHole] = useState<number>(currentHole);
  const [gameType, setGameType] = useState<'match-play' | 'stroke-play' | 'hole-only'>('match-play');
  const [winCondition, setWinCondition] = useState<string>('');

  const handleSubmit = () => {
    if (!targetPlayer || !amount || !winCondition) return;

    const request: PressRequest = {
      targetId: targetPlayer.id,
      amount: parseFloat(amount),
      startHole,
      gameType,
      winCondition
    };

    onSubmit(request);
    setAmount('');
    setWinCondition('');
    onClose();
  };

  const getWinConditionOptions = () => {
    switch (gameType) {
      case 'match-play':
        return [
          'Next 3 holes',
          'Next 6 holes',
          'Back 9',
          'Remaining holes'
        ];
      case 'stroke-play':
        return [
          'Lowest score next 3 holes',
          'Lowest score next 6 holes',
          'Lowest score back 9',
          'Lowest total remaining'
        ];
      case 'hole-only':
        return [
          'This hole only',
          'Next hole only'
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Press {targetPlayer?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Wager Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-hole">Starting Hole</Label>
            <Select value={startHole.toString()} onValueChange={(value) => setStartHole(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 18 }, (_, i) => i + 1).map((hole) => (
                  <SelectItem key={hole} value={hole.toString()}>
                    Hole {hole}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Game Type</Label>
            <Select value={gameType} onValueChange={(value: any) => setGameType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match-play">Match Play</SelectItem>
                <SelectItem value="stroke-play">Stroke Play</SelectItem>
                <SelectItem value="hole-only">Hole Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Win Condition</Label>
            <Select value={winCondition} onValueChange={setWinCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Select win condition" />
              </SelectTrigger>
              <SelectContent>
                {getWinConditionOptions().map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!amount || !winCondition}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Send Press
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PressInitiationModal;
