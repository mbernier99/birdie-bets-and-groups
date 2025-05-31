
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TournamentData } from '../CreateTournamentModal';

interface SideBetsStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const SideBetsStep: React.FC<SideBetsStepProps> = ({ data, onDataChange }) => {
  const handleEnabledChange = (enabled: boolean) => {
    onDataChange('sideBets', {
      enabled
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
                Players can create and manage these bets during the round with amounts they agree upon.
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg">
              <h4 className="font-medium text-emerald-800 mb-2">How It Works</h4>
              <div className="text-sm text-emerald-700 space-y-2">
                <p>• Players can propose side bets during play</p>
                <p>• Bet amounts and terms are agreed upon by participants</p>
                <p>• Results are tracked and settled at the end of the round</p>
                <p>• All side bets are separate from the main tournament prize</p>
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
