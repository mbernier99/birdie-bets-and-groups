import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Users, Trophy, Calendar, MapPin, Zap } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';

interface MobileGoLiveStepProps {
  data: TournamentData;
  onCreate: () => void;
  isSubmitting: boolean;
}

const MobileGoLiveStep: React.FC<MobileGoLiveStepProps> = ({ data, onCreate, isSubmitting }) => {
  const getGameTypeName = (type: string) => {
    const names: { [key: string]: string } = {
      strokePlay: 'Stroke Play',
      matchPlay: 'Match Play',
      skins: 'Skins',
      scramble: 'Scramble',
      bestBall: 'Best Ball',
      alternateShot: 'Alternate Shot',
      fourball: 'Fourball',
      chapman: 'Chapman',
    };
    return names[type] || type;
  };

  const isTeamGame = ['scramble', 'bestBall', 'alternateShot', 'fourball', 'chapman'].includes(
    data.gameType.type
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Ready to Launch!</h2>
        <p className="text-muted-foreground">Review your tournament details</p>
      </div>

      {/* Tournament Summary */}
      <Card className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Trophy className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground">Tournament Name</div>
            <div className="font-semibold text-lg truncate">{data.basicInfo.name}</div>
          </div>
        </div>

        {data.course.name && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Course</div>
              <div className="font-medium">{data.course.name}</div>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Game Type</div>
            <div className="font-medium">{getGameTypeName(data.gameType.type)}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Players</div>
            <div className="font-medium">
              {data.players.length} / {data.basicInfo.maxPlayers} players
            </div>
          </div>
        </div>
      </Card>

      {/* Players List */}
      {data.players.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Participants</h3>
          <div className="space-y-2">
            {isTeamGame && data.teams.length > 0 ? (
              data.teams.map((team) => {
                const teamPlayers = data.players.filter(p => team.playerIds.includes(p.id));
                return (
                  <div key={team.id} className="space-y-2">
                    <div className="font-medium text-sm text-primary">{team.name}</div>
                    {teamPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-2 bg-accent/30 rounded-lg ml-4"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="font-semibold text-primary text-xs">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{player.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
              })
            ) : (
              data.players.map((player) => (
                <div key={player.id} className="flex items-center gap-3 p-2 bg-accent/50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary text-xs">
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{player.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Create Button */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={onCreate}
          disabled={isSubmitting}
          className="w-full h-14 text-lg font-bold"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
              Creating...
            </>
          ) : (
            <>
              <Trophy className="h-5 w-5 mr-2" />
              Create Tournament
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You can add more details and players after creation
        </p>
      </div>
    </div>
  );
};

export default MobileGoLiveStep;
