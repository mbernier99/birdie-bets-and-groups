
import React from 'react';
import { TournamentData } from '../CreateTournamentModal';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Calendar, Trophy } from 'lucide-react';

interface ReviewStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
  onSaveTournament?: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data, onSaveTournament }) => {
  // Guard against missing/malformed fields from stale drafts
  const holes = Array.isArray(data.course?.holes) ? data.course.holes : [];
  const totalPar = holes.reduce((sum, hole) => sum + (hole.par || 0), 0);
  const totalYardage = holes.reduce((sum, hole) => sum + (hole.yardage || 0), 0);
  
  const payoutLabel = (data.wagering?.payoutStructure || 'winner-takes-all').replace(/-/g, ' ');
  const currency = data.wagering?.currency || 'USD';
  const entryFee = Number(data.wagering?.entryFee || 0);

  const getPlayerAssignment = (playerId: string) => {
    // Check if player is in a team
    const team = data.teams.find(t => t.playerIds.includes(playerId));
    if (team) return `Team: ${team.name}`;

    // Check if player is in a tee time
    const teeTime = data.teeTimeGroups.find(t => t.playerIds.includes(playerId));
    if (teeTime) return `Tee Time: ${teeTime.time}`;

    // Check if player is in a pairing
    const pairing = data.pairings.find(p => p.playerIds.includes(playerId));
    if (pairing) return `${pairing.name}${pairing.teeTime ? ` at ${pairing.teeTime}` : ''}`;

    return 'Unassigned';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-6">
      <div className="text-center mb-8">
        <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Review Your Tournament</h3>
        <p className="text-muted-foreground">Confirm all details before creating your tournament</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4 p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2 border-b pb-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Tournament Info</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{data.basicInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Players:</span>
              <span className="font-medium">{data.basicInfo.maxPlayers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Players:</span>
              <span className="font-medium">{data.players.length}</span>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="space-y-4 p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2 border-b pb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Course Details</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Course:</span>
              <span className="font-medium">{data.course.name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tees:</span>
              <span className="font-medium capitalize">{data.course.teeBox}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Par:</span>
              <span className="font-medium">{totalPar}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Yardage:</span>
              <span className="font-medium">{totalYardage.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rating/Slope:</span>
              <span className="font-medium">{data.course.rating}/{data.course.slope}</span>
            </div>
          </div>
        </div>

        {/* Game Type */}
        <div className="space-y-4 p-4 bg-card rounded-lg border">
          <h4 className="font-semibold border-b pb-2">Game Format</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">{data.gameType.type || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium capitalize">{data.gameType.format || 'Individual'}</span>
            </div>
          </div>
        </div>

        {/* Wagering */}
        <div className="space-y-4 p-4 bg-card rounded-lg border">
          <h4 className="font-semibold border-b pb-2">Wagering</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entry Fee:</span>
              <span className="font-medium">{currency} ${entryFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payout:</span>
              <span className="font-medium capitalize">{payoutLabel}</span>
            </div>
            {entryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Pool:</span>
                <span className="font-medium">{currency} ${(entryFee * data.players.length).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Players with Assignments */}
      {data.players.length > 0 && (
        <div className="space-y-4 p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-2 border-b pb-2">
            <Users className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">Players & Assignments ({data.players.length})</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.players.map(player => (
              <div key={player.id} className="flex flex-col p-3 bg-accent/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{player.name}</span>
                  <span className="text-xs text-muted-foreground">HCP: {player.handicapIndex}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{getPlayerAssignment(player.id)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Tournament Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20 mt-8">
        <div className="text-center space-y-4">
          <h4 className="font-bold text-xl">Ready to Create Tournament</h4>
          <p className="text-muted-foreground">
            Review complete! Your tournament will be created and invitations will be sent to all players with their specific assignments.
          </p>
          <div className="bg-card/50 p-4 rounded-lg text-sm space-y-2">
            <p className="font-medium">What happens next:</p>
            <ul className="text-left space-y-1 text-muted-foreground ml-6 list-disc">
              <li>Tournament will be created in the lobby</li>
              <li>You can run connection tests before starting</li>
              <li>Start the tournament even if players haven't joined yet</li>
              <li>You can enter scores for all players as admin</li>
            </ul>
          </div>
          <Button 
            onClick={onSaveTournament}
            className="w-full max-w-md text-lg py-6 font-semibold"
            size="lg"
          >
            Create Tournament
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
