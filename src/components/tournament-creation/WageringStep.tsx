
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
      <h3 className="text-lg font-semibold text-gray-900">Tournament Entry & Payouts</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="entry-fee">Entry Fee</Label>
          <Input
            id="entry-fee"
            type="number"
            min="0"
            step="0.01"
            value={data.wagering.entryFee === 0 ? '' : data.wagering.entryFee}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              if (!isNaN(value)) {
                handleWageringChange('entryFee', value);
              }
            }}
            placeholder="0.00"
          />
          <p className="text-sm text-gray-500">Set to 0 for free tournaments</p>
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
            <SelectItem value="winner-takes-all">Winner Takes: 1st (80%), 2nd (20%)</SelectItem>
            <SelectItem value="balanced">Balanced: 1st (50%), 2nd (30%), 3rd (20%)</SelectItem>
            <SelectItem value="equal-split">Equal Split Among Winners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {data.wagering.entryFee > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Prize Pool Summary</h4>
          <div className="text-sm text-green-700">
            <p>Total Prize Pool: {data.wagering.currency} {(data.wagering.entryFee * (data.players?.length || 0)).toFixed(2)}</p>
            <p className="text-xs mt-1">Based on {data.players?.length || 0} current players</p>
          </div>
        </div>
      )}

      {data.wagering.entryFee === 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Free Tournament</h4>
          <p className="text-sm text-blue-700">This tournament has no entry fee. Players compete for bragging rights!</p>
        </div>
      )}
    </div>
  );
};

export default WageringStep;
