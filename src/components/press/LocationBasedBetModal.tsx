
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Target, Timer, Trophy } from 'lucide-react';
import { PressRequest } from '../../types/press';
import { LocationData } from '../../hooks/useMobileFeatures';
import { CoursePosition, getCoursePosition, isValidBettingPosition } from '../../utils/gpsCalculations';

interface LocationBasedBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlayer: { id: string; name: string; currentHole: number } | null;
  currentHole: number;
  currentLocation: LocationData | null;
  courseHoles: any[];
  onSubmit: (request: PressRequest) => void;
}

const LocationBasedBetModal: React.FC<LocationBasedBetModalProps> = ({
  isOpen,
  onClose,
  targetPlayer,
  currentHole,
  currentLocation,
  courseHoles,
  onSubmit
}) => {
  const [amount, setAmount] = useState<string>('');
  const [betType, setBetType] = useState<'closest-to-pin' | 'longest-drive' | 'first-to-green'>('closest-to-pin');
  const [winCondition, setWinCondition] = useState<string>('');
  const [position, setPosition] = useState<CoursePosition | null>(null);
  const [isValidPosition, setIsValidPosition] = useState(false);

  useEffect(() => {
    if (currentLocation && courseHoles.length > 0) {
      const pos = getCoursePosition(currentLocation, currentHole, courseHoles);
      setPosition(pos);
      setIsValidPosition(isValidBettingPosition(pos, betType));
    }
  }, [currentLocation, currentHole, courseHoles, betType]);

  useEffect(() => {
    // Auto-set win condition based on bet type
    switch (betType) {
      case 'closest-to-pin':
        setWinCondition('Closest shot to the pin wins');
        break;
      case 'longest-drive':
        setWinCondition('Longest drive from tee wins');
        break;
      case 'first-to-green':
        setWinCondition('First player to reach the green wins');
        break;
    }
  }, [betType]);

  const handleSubmit = () => {
    if (!targetPlayer || !amount || !currentLocation || !isValidPosition) return;

    const hole = courseHoles.find(h => h.number === currentHole);
    if (!hole) return;

    let targetLocation;
    if (betType === 'closest-to-pin' && hole.pinLocation) {
      targetLocation = {
        latitude: hole.pinLocation.latitude,
        longitude: hole.pinLocation.longitude,
        hole: currentHole,
        type: 'pin' as const
      };
    } else if (betType === 'longest-drive' && hole.teeLocation) {
      targetLocation = {
        latitude: hole.teeLocation.latitude,
        longitude: hole.teeLocation.longitude,
        hole: currentHole,
        type: 'tee' as const
      };
    }

    const request: PressRequest = {
      targetId: targetPlayer.id,
      amount: parseFloat(amount),
      startHole: currentHole,
      gameType: betType as any,
      winCondition,
      requiresGPS: true,
      targetLocation
    };

    onSubmit(request);
    setAmount('');
    onClose();
  };

  const getBetTypeDescription = (type: string) => {
    switch (type) {
      case 'closest-to-pin':
        return 'Bet on who gets their shot closest to the pin';
      case 'longest-drive':
        return 'Bet on who hits the longest drive from the tee';
      case 'first-to-green':
        return 'Bet on who reaches the green first';
      default:
        return '';
    }
  };

  const getPositionColor = (area: string) => {
    switch (area) {
      case 'tee': return 'bg-blue-100 text-blue-800';
      case 'fairway': return 'bg-green-100 text-green-800';
      case 'rough': return 'bg-yellow-100 text-yellow-800';
      case 'green': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!targetPlayer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Location-Based Bet</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Position */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Position</span>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Hole {currentHole}</span>
              </div>
            </div>
            {position && (
              <div className="flex items-center justify-between">
                <Badge className={getPositionColor(position.area)}>
                  {position.area.charAt(0).toUpperCase() + position.area.slice(1)}
                </Badge>
                {position.distanceToPin && (
                  <span className="text-xs text-gray-500">
                    {position.distanceToPin.toFixed(0)}m to pin
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Validation Warning */}
          {!isValidPosition && position && (
            <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <Timer className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                Move to a valid position for {betType.replace('-', ' ')} betting
              </span>
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
            <Label>Bet Type</Label>
            <Select value={betType} onValueChange={(value: any) => setBetType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="closest-to-pin">
                  <div>
                    <div className="font-medium">Closest to Pin</div>
                    <div className="text-xs text-gray-500">Most accurate shot wins</div>
                  </div>
                </SelectItem>
                <SelectItem value="longest-drive">
                  <div>
                    <div className="font-medium">Longest Drive</div>
                    <div className="text-xs text-gray-500">Furthest tee shot wins</div>
                  </div>
                </SelectItem>
                <SelectItem value="first-to-green">
                  <div>
                    <div className="font-medium">First to Green</div>
                    <div className="text-xs text-gray-500">First to reach green wins</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">{getBetTypeDescription(betType)}</p>
          </div>

          <div className="space-y-2">
            <Label>Win Condition</Label>
            <Input
              value={winCondition}
              onChange={(e) => setWinCondition(e.target.value)}
              placeholder="Define win condition"
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!amount || !winCondition || !isValidPosition}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Create Bet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationBasedBetModal;
