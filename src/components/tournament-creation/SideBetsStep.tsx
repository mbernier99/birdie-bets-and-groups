
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TournamentData } from '../CreateTournamentModal';

interface SideBetsStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const SideBetsStep: React.FC<SideBetsStepProps> = ({ data, onDataChange }) => {
  const handleSideBetChange = (field: string, value: any) => {
    onDataChange('sideBets', {
      ...data.sideBets,
      [field]: value
    });
  };

  const handleEnabledChange = (enabled: boolean) => {
    // When enabling, sync currency with wagering currency and set smart defaults
    const updates = { enabled };
    if (enabled) {
      updates.currency = data.wagering.currency;
      // Set smart defaults based on entry fee
      if (data.wagering.entryFee > 0) {
        updates.minBet = Math.max(1, Math.floor(data.wagering.entryFee * 0.1));
        updates.maxBet = Math.max(updates.minBet, Math.floor(data.wagering.entryFee * 0.5));
      }
    }
    
    onDataChange('sideBets', {
      ...data.sideBets,
      ...updates
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Side Bets Configuration</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label className="text-base font-medium">Enable Side Bets</Label>
            <p className="text-sm text-gray-500">
              Allow players to place side bets during the tournament (closest to pin, longest drive, etc.)
            </p>
          </div>
          <Switch
            checked={data.sideBets.enabled}
            onCheckedChange={handleEnabledChange}
          />
        </div>

        {data.sideBets.enabled && (
          <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-bet">Minimum Bet</Label>
                <Input
                  id="min-bet"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={data.sideBets.minBet}
                  onChange={(e) => handleSideBetChange('minBet', parseFloat(e.target.value) || 0)}
                  placeholder="5.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-bet">Maximum Bet</Label>
                <Input
                  id="max-bet"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={data.sideBets.maxBet}
                  onChange={(e) => handleSideBetChange('maxBet', parseFloat(e.target.value) || 0)}
                  placeholder="50.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={data.sideBets.currency} 
                  onValueChange={(value) => handleSideBetChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {data.sideBets.minBet >= data.sideBets.maxBet && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  Maximum bet must be greater than minimum bet.
                </p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Side Bet Examples</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Closest to the Pin (specific holes)</li>
                <li>• Longest Drive (designated holes)</li>
                <li>• First to Make Birdie</li>
                <li>• Lowest Score on Par 3s</li>
                <li>• Most Pars in a Round</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                Players can create these bets during the round within your set limits.
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Current Settings</h4>
              <div className="text-sm text-gray-700">
                <p>Bet Range: {data.sideBets.currency} {data.sideBets.minBet.toFixed(2)} - {data.sideBets.currency} {data.sideBets.maxBet.toFixed(2)}</p>
                {data.wagering.currency !== data.sideBets.currency && (
                  <p className="text-orange-600 mt-1">
                    ⚠️ Side bet currency differs from tournament currency ({data.wagering.currency})
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!data.sideBets.enabled && (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600">Side bets are disabled for this tournament.</p>
            <p className="text-sm text-gray-500 mt-1">
              Enable above to allow players to place side bets during play.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBetsStep;
