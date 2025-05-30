
import React from 'react';
import { TournamentData } from '../CreateTournamentModal';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ReviewStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
  onSaveTournament?: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data, onSaveTournament }) => {
  const totalPar = data.course.holes.reduce((sum, hole) => sum + hole.par, 0);
  const totalYardage = data.course.holes.reduce((sum, hole) => sum + hole.yardage, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Tournament</h3>
        <p className="text-gray-600">Double-check all details before creating your tournament</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Tournament Info</h4>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Name:</span> {data.basicInfo.name}</div>
            <div><span className="font-medium">Max Players:</span> {data.basicInfo.maxPlayers}</div>
            <div><span className="font-medium">Current Players:</span> {data.players.length}</div>
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
              <div><span className="font-medium">Total Pool:</span> {data.wagering.currency} {(data.wagering.entryFee * data.players.length).toFixed(2)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Players Summary */}
      {data.players.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Players ({data.players.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {data.players.map(player => (
              <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{player.name}</span>
                <span className="text-gray-600">HCP: {player.handicapIndex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Tournament Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-200 mt-8">
        <div className="text-center">
          <h4 className="font-bold text-emerald-900 text-xl mb-3">Create Your Tournament</h4>
          <p className="text-emerald-700 mb-6">
            Your tournament setup is complete! Click below to create your tournament and make it available for players to join.
          </p>
          <Button 
            onClick={onSaveTournament}
            className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-3 px-8 font-semibold"
            size="lg"
          >
            Create Tournament
          </Button>
          <p className="text-xs text-emerald-600 mt-3">
            Once created, you can invite additional players and start your tournament
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
