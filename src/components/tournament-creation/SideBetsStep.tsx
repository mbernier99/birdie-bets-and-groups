
import React from 'react';
import { TournamentData } from '../CreateTournamentModal';

interface SideBetsStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const SideBetsStep: React.FC<SideBetsStepProps> = ({ data, onDataChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Side Bets & Challenges</h3>
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <p className="text-gray-600">Side bets interface coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">This will include closest to pin, longest drive, and custom side bets.</p>
      </div>
    </div>
  );
};

export default SideBetsStep;
