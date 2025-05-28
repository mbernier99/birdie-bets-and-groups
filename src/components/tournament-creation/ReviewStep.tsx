
import React from 'react';
import { TournamentData } from '../CreateTournamentModal';
import { format } from 'date-fns';

interface ReviewStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data }) => {
  const totalPar = data.course.holes.reduce((sum, hole) => sum + hole.par, 0);
  const totalYardage = data.course.holes.reduce((sum, hole) => sum + hole.yardage, 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Review Tournament Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Tournament Info</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {data.basicInfo.name}</div>
            <div><span className="font-medium">Date:</span> {data.basicInfo.date ? format(data.basicInfo.date, 'PPP') : 'Not set'}</div>
            <div><span className="font-medium">Time:</span> {data.basicInfo.time || 'Not set'}</div>
            <div><span className="font-medium">Max Players:</span> {data.basicInfo.maxPlayers}</div>
          </div>
        </div>

        {/* Course Info */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Course Details</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Course:</span> {data.course.name || 'Not set'}</div>
            <div><span className="font-medium">Tees:</span> {data.course.teeBox}</div>
            <div><span className="font-medium">Par:</span> {totalPar}</div>
            <div><span className="font-medium">Yardage:</span> {totalYardage.toLocaleString()}</div>
            <div><span className="font-medium">Rating/Slope:</span> {data.course.rating}/{data.course.slope}</div>
          </div>
        </div>

        {/* Game Type */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Game Format</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Type:</span> {data.gameType.type || 'Not selected'}</div>
            {Object.keys(data.gameType.rules).length > 0 && (
              <div className="space-y-1">
                <span className="font-medium">Rules:</span>
                {Object.entries(data.gameType.rules).map(([key, value]) => (
                  <div key={key} className="ml-4">
                    {key}: {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Wagering */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Wagering</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Entry Fee:</span> {data.wagering.currency} {data.wagering.entryFee}</div>
            <div><span className="font-medium">Payout:</span> {data.wagering.payoutStructure}</div>
            {data.wagering.entryFee > 0 && (
              <div><span className="font-medium">Total Pool:</span> {data.wagering.currency} {(data.wagering.entryFee * data.basicInfo.maxPlayers).toFixed(2)}</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 p-4 rounded-lg">
        <h4 className="font-medium text-emerald-900 mb-2">Ready to Create</h4>
        <p className="text-sm text-emerald-700">
          Review all details above and click "Create Tournament" to finalize your tournament setup.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;
