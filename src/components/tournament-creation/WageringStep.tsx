
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TournamentData } from '../CreateTournamentModal';

interface WageringStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const WageringStep: React.FC<WageringStepProps> = ({ data, onDataChange }) => {
  const handleWageringChange = (field: string, value: any) => {
    onDataChange('wagering', {
      ...data.wagering,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Wagering Setup</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="entry-fee">Entry Fee</Label>
          <Input
            id="entry-fee"
            type="number"
            min="0"
            step="0.01"
            value={data.wagering.entryFee}
            onChange={(e) => handleWageringChange('entryFee', parseFloat(e.target.value))}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={data.wagering.currency} onValueChange={(value) => handleWageringChange('currency', value)}>
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

      <div className="space-y-2">
        <Label>Payout Structure</Label>
        <Select value={data.wagering.payoutStructure} onValueChange={(value) => handleWageringChange('payoutStructure', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="winner-takes-all">Winner Takes All</SelectItem>
            <SelectItem value="70-30">70% / 30% Split</SelectItem>
            <SelectItem value="60-30-10">60% / 30% / 10% Split</SelectItem>
            <SelectItem value="50-30-20">50% / 30% / 20% Split</SelectItem>
            <SelectItem value="equal-split">Equal Split Among Winners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.wagering.entryFee > 0 && (
        <div className="bg-emerald-50 p-4 rounded-lg">
          <h4 className="font-medium text-emerald-900 mb-2">Prize Pool Calculation</h4>
          <p className="text-sm text-emerald-700">
            Total Prize Pool: {data.wagering.currency} {(data.wagering.entryFee * data.basicInfo.maxPlayers).toFixed(2)}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Based on {data.basicInfo.maxPlayers} maximum players
          </p>
        </div>
      )}
    </div>
  );
};

export default WageringStep;
