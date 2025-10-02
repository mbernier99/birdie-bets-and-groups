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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
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
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">Presses</h3>
            <button className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-4 w-4 text-primary" />
            </button>
          </div>
          
          <div className="rounded-xl border-2 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-press" className="text-base">Automatic Press</Label>
              <Switch
                id="auto-press"
                checked={data.gameType.rules?.automaticPress || false}
                onCheckedChange={(checked) => handleGameTypeRulesChange('automaticPress', checked)}
              />
            </div>

            {data.gameType.rules?.automaticPress && (
              <>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label className="text-base">Down By</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      max="9"
                      value={data.gameType.rules?.pressDownBy || 2}
                      onChange={(e) => handleGameTypeRulesChange('pressDownBy', parseInt(e.target.value))}
                      className="w-20 h-10 text-center"
                    />
                    <span className="text-muted-foreground">Holes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Label htmlFor="closeout" className="text-base">Closeout</Label>
                  <Switch
                    id="closeout"
                    checked={data.gameType.rules?.closeout || false}
                    onCheckedChange={(checked) => handleGameTypeRulesChange('closeout', checked)}
                  />
                </div>
              </>
            )}
          </div>

          {data.gameType.rules?.automaticPress && (
            <p className="text-sm text-muted-foreground">
              <strong>Automatic press</strong> creates a double-or-nothing side bet when a player falls behind.
            </p>
          )}
        </div>

        {/* Entry Fee (moved from wagering step) */}
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
                <div className="text-sm font-medium mb-1">Prize Pool</div>
                <div className="text-2xl font-bold">
                  {data.wagering.currency} {(data.wagering.entryFee * (data.players?.length || 0)).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Based on {data.players?.length || 0} players
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetsStep;
