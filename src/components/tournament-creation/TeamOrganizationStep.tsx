
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TournamentData } from '../CreateTournamentModal';
import { PlayerForm } from './PlayerForm';
import { BulkPlayerImport } from './BulkPlayerImport';
import { PlayerCard } from './PlayerCard';
import { TeamCard } from './TeamCard';
import { UnassignedPlayerCard } from './UnassignedPlayerCard';
import { GameTypeInfo } from './GameTypeInfo';

interface TeamOrganizationStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const TeamOrganizationStep: React.FC<TeamOrganizationStepProps> = ({ data, onDataChange }) => {
  // Get players per team based on game type
  const getPlayersPerTeam = () => {
    if (data.gameType.type === 'best-ball-match-play') return 2;
    if (data.gameType.type === 'best-ball') return 2;
    if (data.gameType.type === 'scramble') return 4;
    return 2; // default
  };

  // Calculate optimal number of teams
  const calculateOptimalTeamCount = () => {
    const acceptedPlayers = data.players.filter(p => p.status === 'accepted').length;
    const playersPerTeam = getPlayersPerTeam();
    return Math.floor(acceptedPlayers / playersPerTeam);
  };

  // Auto-generate teams for 2-Man Best Ball Match Play
  const autoGenerateTeams = () => {
    const availablePlayers = data.players.filter(p => p.status === 'accepted');
    
    if (availablePlayers.length < 2) return;

    const teams = [];
    const playersPerTeam = getPlayersPerTeam();
    
    for (let i = 0; i < availablePlayers.length; i += playersPerTeam) {
      const teamPlayers = availablePlayers.slice(i, i + playersPerTeam);
      if (teamPlayers.length === playersPerTeam) {
        const team = {
          id: `team-${Math.floor(i / playersPerTeam) + 1}`,
          name: `Team ${Math.floor(i / playersPerTeam) + 1}`,
          playerIds: teamPlayers.map(p => p.id)
        };
        teams.push(team);
      }
    }

    onDataChange('teams', teams);
  };

  // Auto-generate teams when game type is team-based and players change
  useEffect(() => {
    if (['best-ball-match-play', 'best-ball', 'scramble'].includes(data.gameType.type)) {
      autoGenerateTeams();
    }
  }, [data.players, data.gameType.type]);

  const addPlayer = (newPlayer: any) => {
    onDataChange('players', [...data.players, newPlayer]);
  };

  const addPlayers = (newPlayers: any[]) => {
    onDataChange('players', [...data.players, ...newPlayers]);
  };

  const removePlayer = (playerId: string) => {
    onDataChange('players', data.players.filter(p => p.id !== playerId));
  };

  const updatePlayerStatus = (playerId: string, status: 'invited' | 'accepted' | 'declined') => {
    const updatedPlayers = data.players.map(p => 
      p.id === playerId ? { ...p, status } : p
    );
    onDataChange('players', updatedPlayers);
  };

  const updatePlayerName = (playerId: string, newName: string) => {
    const updatedPlayers = data.players.map(p => 
      p.id === playerId ? { ...p, name: newName } : p
    );
    onDataChange('players', updatedPlayers);
  };

  // Find or create team by number
  const findOrCreateTeam = (teamNumber: number) => {
    const teamId = `team-${teamNumber}`;
    let team = data.teams.find(t => t.id === teamId);
    
    if (!team) {
      team = {
        id: teamId,
        name: `Team ${teamNumber}`,
        playerIds: []
      };
      onDataChange('teams', [...data.teams, team]);
    }
    
    return team;
  };

  const addPlayerToTeam = (teamNumber: number, playerId: string) => {
    const team = findOrCreateTeam(teamNumber);
    const playersPerTeam = getPlayersPerTeam();
    
    // Check if team is full
    if (team.playerIds.length >= playersPerTeam) {
      return;
    }
    
    // Remove player from any existing team
    const updatedTeams = data.teams.map(t => ({
      ...t,
      playerIds: t.playerIds.filter(id => id !== playerId)
    }));
    
    // Add player to selected team
    const finalTeams = updatedTeams.map(t => 
      t.id === team.id 
        ? { ...t, playerIds: [...t.playerIds, playerId] }
        : t
    );
    
    // Ensure the new team exists in the final array
    if (!finalTeams.find(t => t.id === team.id)) {
      finalTeams.push({
        ...team,
        playerIds: [playerId]
      });
    }
    
    onDataChange('teams', finalTeams);
  };

  const removePlayerFromTeam = (teamId: string, playerId: string) => {
    const updatedTeams = data.teams.map(team =>
      team.id === teamId
        ? { ...team, playerIds: team.playerIds.filter(id => id !== playerId) }
        : team
    );
    onDataChange('teams', updatedTeams);
  };

  const updateTeamName = (teamId: string, name: string) => {
    const updatedTeams = data.teams.map(t =>
      t.id === teamId ? { ...t, name } : t
    );
    onDataChange('teams', updatedTeams);
  };

  const unassignedPlayers = data.players.filter(player => 
    !data.teams.some(team => team.playerIds.includes(player.id))
  );

  const isTeamBased = ['best-ball', 'best-ball-match-play', 'scramble'].includes(data.gameType.type);
  const optimalTeamCount = calculateOptimalTeamCount();
  const playersPerTeam = getPlayersPerTeam();

  // Get team capacity info
  const getTeamCapacity = (teamNumber: number) => {
    const team = data.teams.find(t => t.id === `team-${teamNumber}`);
    const currentCount = team ? team.playerIds.length : 0;
    return { current: currentCount, max: playersPerTeam, isFull: currentCount >= playersPerTeam };
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Players & Teams</h3>

      {/* Player Management */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Invite Players</h4>
        
        {/* Single Player Add */}
        <PlayerForm onAddPlayer={addPlayer} />

        {/* Bulk Email Import */}
        <BulkPlayerImport onAddPlayers={addPlayers} />
      </div>

      {/* Players List */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Players ({data.players.length})</h4>
        <div className="space-y-2">
          {data.players.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onUpdateStatus={updatePlayerStatus}
              onUpdateName={updatePlayerName}
              onRemovePlayer={removePlayer}
            />
          ))}
        </div>
      </div>

      {/* Team Organization */}
      {isTeamBased && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">
              Teams ({playersPerTeam} players each) - Optimal: {optimalTeamCount} teams
            </h4>
            <Button onClick={autoGenerateTeams} variant="outline">
              Auto-Generate Teams
            </Button>
          </div>

          {/* Teams */}
          <div className="space-y-4">
            {data.teams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                players={data.players}
                playersPerTeam={playersPerTeam}
                onUpdateTeamName={updateTeamName}
                onRemovePlayerFromTeam={removePlayerFromTeam}
              />
            ))}
          </div>

          {/* Unassigned Players with Numerical Team Assignment */}
          {unassignedPlayers.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Available Players</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {unassignedPlayers.map(player => (
                  <UnassignedPlayerCard
                    key={player.id}
                    player={player}
                    optimalTeamCount={optimalTeamCount}
                    existingTeamCount={data.teams.length}
                    getTeamCapacity={getTeamCapacity}
                    onAddPlayerToTeam={addPlayerToTeam}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GameTypeInfo gameType={data.gameType.type} />
    </div>
  );
};

export default TeamOrganizationStep;
