
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Press, PressCounter } from '../../types/press';
import { Timer } from 'lucide-react';

interface PressNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  press: Press | null;
  onAccept: () => void;
  onDecline: () => void;
  onCounter: (counter: PressCounter) => void;
  timeRemaining: number;
}

const PressNotificationModal: React.FC<PressNotificationModalProps> = ({
  isOpen,
  onClose,
  press,
  onAccept,
  onDecline,
  onCounter,
  timeRemaining
}) => {
  const [showCounter, setShowCounter] = useState(false);
  const [counterAmount, setCounterAmount] = useState<string>('');
  const [counterGameType, setCounterGameType] = useState<string>('');
  const [counterWinCondition, setCounterWinCondition] = useState<string>('');

  if (!press) return null;

  const handleCounter = () => {
    const counter: PressCounter = {
      pressId: press.id,
      ...(counterAmount && { amount: parseFloat(counterAmount) }),
      ...(counterGameType && { gameType: counterGameType as any }),
      ...(counterWinCondition && { winCondition: counterWinCondition })
    };

    onCounter(counter);
    setShowCounter(false);
    setCounterAmount('');
    setCounterGameType('');
    setCounterWinCondition('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Press Challenge!</span>
            <div className="flex items-center text-sm text-orange-600">
              <Timer className="h-4 w-4 mr-1" />
              {formatTime(timeRemaining)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <p className="font-medium text-emerald-900">
              Press Details
            </p>
            <div className="text-sm text-emerald-700 mt-2 space-y-1">
              <p>Amount: ${press.amount}</p>
              <p>Start: Hole {press.startHole}</p>
              <p>Game: {press.gameType.replace('-', ' ')}</p>
              <p>Condition: {press.winCondition}</p>
            </div>
          </div>

          {!showCounter ? (
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={onAccept}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Accept Press
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowCounter(true)}
              >
                Counter Press
              </Button>
              <Button 
                variant="outline"
                onClick={onDecline}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Decline
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium">Counter Press</h4>
              
              <div className="space-y-2">
                <Label>New Amount (optional)</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  placeholder={`Current: $${press.amount}`}
                />
              </div>

              <div className="space-y-2">
                <Label>Game Type (optional)</Label>
                <Select value={counterGameType} onValueChange={setCounterGameType}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Current: ${press.gameType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match-play">Match Play</SelectItem>
                    <SelectItem value="stroke-play">Stroke Play</SelectItem>
                    <SelectItem value="hole-only">Hole Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Win Condition (optional)</Label>
                <Input
                  value={counterWinCondition}
                  onChange={(e) => setCounterWinCondition(e.target.value)}
                  placeholder={`Current: ${press.winCondition}`}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCounter(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleCounter}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Send Counter
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PressNotificationModal;
