
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { PressRequest, CourseHole } from '../../types/press';
import { validatePress, getGameTypeOptions, getWinConditionOptions } from '../../utils/pressValidation';

interface PressInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlayer: { id: string; name: string; currentHole: number } | null;
  currentHole: number;
  courseHoles: CourseHole[];
  onSubmit: (request: PressRequest) => void;
}

const PressInitiationModal: React.FC<PressInitiationModalProps> = ({
  isOpen,
  onClose,
  targetPlayer,
  currentHole,
  courseHoles,
  onSubmit
}) => {
  const [amount, setAmount] = useState<string>('');
  const [startHole, setStartHole] = useState<number>(Math.max(currentHole, targetPlayer?.currentHole || currentHole));
  const [gameType, setGameType] = useState<'total-strokes' | 'head-to-head' | 'this-hole' | 'remaining-holes'>('head-to-head');
  const [winCondition, setWinCondition] = useState<string>('');
  const [validation, setValidation] = useState<{ isValid: boolean; reason?: string; warning?: string }>({ isValid: true });

  useEffect(() => {
    if (targetPlayer) {
      const newStartHole = Math.max(currentHole, targetPlayer.currentHole);
      setStartHole(newStartHole);
      
      // Validate and set first available game type
      const availableTypes = getGameTypeOptions(currentHole, targetPlayer.currentHole, courseHoles);
      if (availableTypes.length > 0) {
        setGameType(availableTypes[0].value as any);
      }
    }
  }, [targetPlayer, currentHole, courseHoles]);

  useEffect(() => {
    if (targetPlayer) {
      const newValidation = validatePress(currentHole, targetPlayer.currentHole, gameType, courseHoles);
      setValidation(newValidation);
      
      // Auto-set win condition when game type changes
      const winOptions = getWinConditionOptions(gameType, currentHole, targetPlayer.currentHole);
      if (winOptions.length > 0) {
        setWinCondition(winOptions[0]);
      }
    }
  }, [gameType, targetPlayer, currentHole, courseHoles]);

  const handleSubmit = () => {
    if (!targetPlayer || !amount || !winCondition || !validation.isValid) return;

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

  if (!targetPlayer) return null;

  const availableGameTypes = getGameTypeOptions(currentHole, targetPlayer.currentHole, courseHoles);
  const availableWinConditions = getWinConditionOptions(gameType, currentHole, targetPlayer.currentHole);
  const holeDifference = Math.abs(currentHole - targetPlayer.currentHole);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Press {targetPlayer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Player Status */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>You: Hole {currentHole}</span>
              <span>{targetPlayer.name}: Hole {targetPlayer.currentHole}</span>
            </div>
            {holeDifference > 0 && (
              <div className="flex items-center mt-2">
                <Badge variant={holeDifference <= 1 ? "default" : "destructive"} className="text-xs">
                  {holeDifference} hole{holeDifference !== 1 ? 's' : ''} apart
                </Badge>
              </div>
            )}
          </div>

          {/* Validation Warning */}
          {validation.warning && (
            <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">{validation.warning}</span>
            </div>
          )}

          {/* Error Message */}
          {!validation.isValid && (
            <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{validation.reason}</span>
            </div>
          )}

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
            <Label>Game Type</Label>
            <Select value={gameType} onValueChange={(value: any) => setGameType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableGameTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
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
                {availableWinConditions.map((condition) => (
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
              disabled={!amount || !winCondition || !validation.isValid}
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
