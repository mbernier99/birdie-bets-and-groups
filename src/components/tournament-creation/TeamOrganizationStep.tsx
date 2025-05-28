
import React from 'react';
import { TournamentData } from '../CreateTournamentModal';

interface TeamOrganizationStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const TeamOrganizationStep: React.FC<TeamOrganizationStepProps> = ({ data, onDataChange }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Team Organization</h3>
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <p className="text-gray-600">Team organization interface coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">This will include player selection, team assignment, and pairing management.</p>
      </div>
    </div>
  );
};

export default TeamOrganizationStep;
