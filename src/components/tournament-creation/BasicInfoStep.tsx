
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TournamentData } from '../CreateTournamentModal';

interface BasicInfoStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onDataChange }) => {
  const handleBasicInfoChange = (field: string, value: any) => {
    onDataChange('basicInfo', {
      ...data.basicInfo,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Tournament Details</h3>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="tournament-name">Tournament Name</Label>
          <Input
            id="tournament-name"
            value={data.basicInfo.name}
            onChange={(e) => handleBasicInfoChange('name', e.target.value)}
            placeholder="Sunday Morning Championship"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-players">Maximum Players</Label>
          <Input
            id="max-players"
            type="number"
            value={data.basicInfo.maxPlayers}
            onChange={(e) => handleBasicInfoChange('maxPlayers', parseInt(e.target.value))}
            min="2"
            max="144"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
