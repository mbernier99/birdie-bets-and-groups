import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TournamentData } from '../CreateTournamentModal';
import { Info } from 'lucide-react';

interface BetsStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const BetsStep: React.FC<BetsStepProps> = ({ data, onDataChange }) => {
  const handleWageringChange = (field: string, value: any) => {
    onDataChange('wagering', {
      ...data.wagering,
      [field]: value
    });
  };

  const handleGameTypeRulesChange = (field: string, value: any) => {
    onDataChange('gameType', {
      ...data.gameType,
      rules: {
        ...data.gameType.rules,
        [field]: value
      }
    });
  };

  const prizePool = data.wagering.entryFee * (data.players?.length || 0);
  const firstPlaceAmount = prizePool * ((data.wagering.firstPlacePercentage || 100) / 100);
  const secondPlaceAmount = data.wagering.secondPlaceEnabled ? prizePool * ((data.wagering.secondPlacePercentage || 0) / 100) : 0;
  const thirdPlaceAmount = data.wagering.thirdPlaceEnabled ? prizePool * ((data.wagering.thirdPlacePercentage || 0) / 100) : 0;
  const totalPercentage = (data.wagering.firstPlacePercentage || 100) + 
    (data.wagering.secondPlaceEnabled ? (data.wagering.secondPlacePercentage || 0) : 0) +
    (data.wagering.thirdPlaceEnabled ? (data.wagering.thirdPlacePercentage || 0) : 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4 px-6">
        {/* Entry Fee - Moved to Top */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Entry Fee</h3>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="entry-fee" className="text-sm">Amount</Label>
                <Input
                  id="entry-fee"
                  type="number"
                  min="0"
                  step="1"
                  value={data.wagering.entryFee}
                  onChange={(e) => handleWageringChange('entryFee', parseFloat(e.target.value) || 0)}
                  className="h-12 text-lg"
                  placeholder="0"
                />
              </div>
              <div className="w-32">
                <Label htmlFor="currency" className="text-sm">Currency</Label>
                <Select value={data.wagering.currency} onValueChange={(value) => handleWageringChange('currency', value)}>
                  <SelectTrigger id="currency" className="h-12">
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

            {data.wagering.entryFee > 0 && (
              <div className="rounded-lg bg-primary/5 p-4">
                <div className="text-sm font-medium mb-1">Total Prize Pool</div>
                <div className="text-2xl font-bold">
                  {data.wagering.currency} {prizePool.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on {data.players?.length || 0} players
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prize Distribution */}
        {data.wagering.entryFee > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Prize Distribution</h3>
            
            {totalPercentage !== 100 && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive font-medium">
                  Total must equal 100% (currently {totalPercentage}%)
                </p>
              </div>
            )}

            {/* First Place */}
            <div className="rounded-xl border-2 p-4 space-y-3">
              <div className="font-semibold text-lg">1st Place</div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor="first-percentage" className="text-sm">Percentage</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="first-percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="5"
                      value={data.wagering.firstPlacePercentage || 100}
                      onChange={(e) => handleWageringChange('firstPlacePercentage', parseFloat(e.target.value) || 100)}
                      className="h-12 text-lg"
                    />
                    <span className="text-lg">%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-sm">Payout</Label>
                  <div className="h-12 rounded-lg bg-muted flex items-center px-4 text-lg font-semibold">
                    {data.wagering.currency} {firstPlaceAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Second Place Toggle and Config */}
            <div className="rounded-xl border-2 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">2nd Place</div>
                <Switch
                  checked={data.wagering.secondPlaceEnabled || false}
                  onCheckedChange={(checked) => {
                    handleWageringChange('secondPlaceEnabled', checked);
                    if (checked && !data.wagering.secondPlacePercentage) {
                      handleWageringChange('secondPlacePercentage', 30);
                      handleWageringChange('firstPlacePercentage', 70);
                    } else if (!checked) {
                      handleWageringChange('firstPlacePercentage', 
                        100 - (data.wagering.thirdPlaceEnabled ? (data.wagering.thirdPlacePercentage || 0) : 0)
                      );
                    }
                  }}
                />
              </div>
              
              {data.wagering.secondPlaceEnabled && (
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="flex-1">
                    <Label htmlFor="second-percentage" className="text-sm">Percentage</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="second-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={data.wagering.secondPlacePercentage || 30}
                        onChange={(e) => handleWageringChange('secondPlacePercentage', parseFloat(e.target.value) || 30)}
                        className="h-12 text-lg"
                      />
                      <span className="text-lg">%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">Payout</Label>
                    <div className="h-12 rounded-lg bg-muted flex items-center px-4 text-lg font-semibold">
                      {data.wagering.currency} {secondPlaceAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Third Place Toggle and Config */}
            <div className="rounded-xl border-2 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">3rd Place</div>
                <Switch
                  checked={data.wagering.thirdPlaceEnabled || false}
                  onCheckedChange={(checked) => {
                    handleWageringChange('thirdPlaceEnabled', checked);
                    if (checked && !data.wagering.thirdPlacePercentage) {
                      handleWageringChange('thirdPlacePercentage', 20);
                      if (!data.wagering.secondPlaceEnabled) {
                        handleWageringChange('firstPlacePercentage', 80);
                      } else {
                        handleWageringChange('firstPlacePercentage', 50);
                        handleWageringChange('secondPlacePercentage', 30);
                      }
                    } else if (!checked) {
                      // When disabling 3rd place, redistribute percentages
                      if (!data.wagering.secondPlaceEnabled) {
                        handleWageringChange('firstPlacePercentage', 100);
                      } else {
                        handleWageringChange('firstPlacePercentage', 70);
                        handleWageringChange('secondPlacePercentage', 30);
                      }
                    }
                  }}
                />
              </div>
              
              {data.wagering.thirdPlaceEnabled && (
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="flex-1">
                    <Label htmlFor="third-percentage" className="text-sm">Percentage</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="third-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={data.wagering.thirdPlacePercentage || 20}
                        onChange={(e) => handleWageringChange('thirdPlacePercentage', parseFloat(e.target.value) || 20)}
                        className="h-12 text-lg"
                      />
                      <span className="text-lg">%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">Payout</Label>
                    <div className="h-12 rounded-lg bg-muted flex items-center px-4 text-lg font-semibold">
                      {data.wagering.currency} {thirdPlaceAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Handicaps */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Handicaps</h3>
          
          <div className="rounded-xl border-2 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="percent-handicaps" className="text-base">Percent Handicaps</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="percent-handicaps"
                  type="number"
                  min="0"
                  max="100"
                  value={data.gameType.rules?.handicapPercentage || 100}
                  onChange={(e) => handleGameTypeRulesChange('handicapPercentage', parseInt(e.target.value))}
                  className="w-24 h-10 text-center text-lg"
                />
                <span className="text-lg">%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="index-on-low" className="text-base">Index on Low</Label>
              <Switch
                id="index-on-low"
                checked={data.gameType.rules?.indexOnLow || false}
                onCheckedChange={(checked) => handleGameTypeRulesChange('indexOnLow', checked)}
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            All players' Playing Handicaps are equal to their Course Handicaps.
          </p>
        </div>

        {/* Match Wager */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Match Wager</h3>
          
          <button className="w-full p-4 rounded-xl border-2 hover:border-primary transition-colors text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Match Winner</div>
                <div className="text-2xl text-muted-foreground">
                  ${data.wagering.entryFee || 0}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Presses */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Presses</h3>
          
          <div className="rounded-xl border-2 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="allow-presses" className="text-base font-semibold">Allow Players to Press</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Players can initiate a press when down by 2+ holes
                </p>
              </div>
              <Switch
                id="allow-presses"
                checked={data.gameType.rules?.allowPresses || false}
                onCheckedChange={(checked) => handleGameTypeRulesChange('allowPresses', checked)}
              />
            </div>
          </div>

          {data.gameType.rules?.allowPresses && (
            <div className="rounded-lg bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Press</strong> - Any player or team that is at least 2 holes down can challenge their opponent to a new side bet. This creates an additional match that runs alongside the original bet, giving players a chance to recover losses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BetsStep;
