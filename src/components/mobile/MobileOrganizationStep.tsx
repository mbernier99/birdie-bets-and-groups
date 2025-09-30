import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Shuffle } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import SwipeableCard from './SwipeableCard';

interface MobileOrganizationStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const MobileOrganizationStep: React.FC<MobileOrganizationStepProps> = ({ data, onDataChange }) => {
  const { triggerImpact } = useHapticFeedback();

  const isTeamGame = ['scramble', 'bestBall', 'alternateShot', 'fourball', 'chapman'].includes(
    data.gameType.type
  );

  const autoGenerateTeams = () => {
    triggerImpact('medium');
    
    const teamSize = (data.gameType.rules?.teamSize as number) || 2;
    const numTeams = Math.ceil(data.players.length / teamSize);
    const shuffledPlayers = [...data.players].sort(() => Math.random() - 0.5);
    
    const teams = Array.from({ length: numTeams }, (_, i) => ({
      id: `team-${i + 1}`,
      name: `Team ${i + 1}`,
      playerIds: shuffledPlayers.slice(i * teamSize, (i + 1) * teamSize).map(p => p.id),
    }));

    onDataChange('teams', teams);
  };

  const addPlayerToTeam = (playerId: string, teamId: string) => {
    triggerImpact('light');
    
    const player = data.players.find(p => p.id === playerId);
    if (!player) return;

    const updatedTeams = data.teams.map(team => {
      if (team.id === teamId) {
        const newPlayerIds = team.playerIds.filter(id => id !== playerId);
        return {
          ...team,
          playerIds: [...newPlayerIds, playerId],
        };
      }
      return {
        ...team,
        playerIds: team.playerIds.filter(id => id !== playerId),
      };
    });

    onDataChange('teams', updatedTeams);
  };

  const removePlayerFromTeam = (playerId: string, teamId: string) => {
    triggerImpact('light');
    
    const updatedTeams = data.teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          playerIds: team.playerIds.filter(id => id !== playerId),
        };
      }
      return team;
    });

    onDataChange('teams', updatedTeams);
  };

  const unassignedPlayers = data.players.filter(
    player => !data.teams.some(team => team.playerIds.includes(player.id))
  );

  if (!isTeamGame) {
    return (
      <div className="space-y-4">
        <Card className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Individual Game</h3>
          <p className="text-sm text-muted-foreground">
            No team organization needed for {data.gameType.type}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Auto-generate button */}
      {data.teams.length === 0 && (
        <Button
          onClick={autoGenerateTeams}
          className="w-full h-12"
          variant="outline"
        >
          <Shuffle className="h-5 w-5 mr-2" />
          Auto-Generate Teams
        </Button>
      )}

      {/* Teams */}
      {data.teams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Teams</h3>
            <Button
              onClick={autoGenerateTeams}
              variant="ghost"
              size="sm"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
          </div>

          {data.teams.map((team) => {
            const teamPlayers = data.players.filter(p => team.playerIds.includes(p.id));
            const teamSize = (data.gameType.rules?.teamSize as number) || 2;
            
            return (
              <Card key={team.id} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">{team.name}</h4>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {teamPlayers.length}/{teamSize}
                  </span>
                </div>

                <div className="space-y-2">
                  {teamPlayers.map((player) => (
                    <SwipeableCard
                      key={player.id}
                      onSwipeLeft={() => removePlayerFromTeam(player.id, team.id)}
                      className="p-3 bg-accent/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="font-semibold text-primary text-sm">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{player.name}</div>
                          <div className="text-xs text-muted-foreground">HCP: {player.handicapIndex}</div>
                        </div>
                      </div>
                    </SwipeableCard>
                  ))}

                  {teamPlayers.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Swipe players right to add
                    </div>
                  )}
              </div>
            </Card>
          );
          })}
        </div>
      )}

      {/* Unassigned Players */}
      {unassignedPlayers.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Unassigned Players</h3>
          <p className="text-sm text-muted-foreground">Swipe right to assign to teams</p>
          
          {unassignedPlayers.map((player) => (
            <SwipeableCard
              key={player.id}
              onSwipeRight={() => {
                const teamSize = (data.gameType.rules?.teamSize as number) || 2;
                const firstAvailableTeam = data.teams.find(t => {
                  const teamPlayerCount = data.players.filter(p => t.playerIds.includes(p.id)).length;
                  return teamPlayerCount < teamSize;
                });
                if (firstAvailableTeam) {
                  addPlayerToTeam(player.id, firstAvailableTeam.id);
                }
              }}
              className="p-3 bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-primary text-sm">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{player.name}</div>
                  <div className="text-xs text-muted-foreground">HCP: {player.handicapIndex}</div>
                </div>
              </div>
            </SwipeableCard>
          ))}
        </div>
      )}

      {/* Help Text */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-center">
          💡 Swipe left to remove from team • Swipe right to add to team
        </p>
      </Card>
    </div>
  );
};

export default MobileOrganizationStep;
