
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TournamentData } from '../CreateTournamentModal';
import { PlayerCard } from './PlayerCard';
import { TeamCard } from './TeamCard';
import { GameTypeInfo } from './GameTypeInfo';
import { DraggablePlayerCard } from './DraggablePlayerCard';
import { DropZone } from './DropZone';
import { PlayerPool } from './PlayerPool';
import { TeeTimeGroup } from './TeeTimeGroup';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamOrganizationStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const TeamOrganizationStep: React.FC<TeamOrganizationStepProps> = ({ data, onDataChange }) => {
  const { dragState, handleTouchStart, handleTouchMove, handleTouchEnd } = useDragAndDrop();
  const { triggerSelection } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<'teams' | 'teetimes'>('teams');

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

  const isTeamBased = ['best-ball', 'best-ball-match-play', 'scramble'].includes(data.gameType.type);
  const needsTeeTimeGroups = !isTeamBased || data.gameType.type === 'best-ball-match-play';
  
  const unassignedPlayers = data.players.filter(player => 
    !data.teams.some(team => team.playerIds.includes(player.id)) &&
    !data.teeTimeGroups.some(group => group.playerIds.includes(player.id))
  );

  const optimalTeamCount = calculateOptimalTeamCount();
  const playersPerTeam = getPlayersPerTeam();

  // Get team capacity info
  const getTeamCapacity = (teamNumber: number) => {
    const team = data.teams.find(t => t.id === `team-${teamNumber}`);
    const currentCount = team ? team.playerIds.length : 0;
    return { current: currentCount, max: playersPerTeam, isFull: currentCount >= playersPerTeam };
  };

  // Tee Time Management Functions
  const addTeeTimeGroup = () => {
    const newGroup = {
      id: `teetime-${Date.now()}`,
      time: '08:00',
      playerIds: []
    };
    onDataChange('teeTimeGroups', [...data.teeTimeGroups, newGroup]);
  };

  const updateTeeTime = (groupId: string, time: string) => {
    const updated = data.teeTimeGroups.map(g => 
      g.id === groupId ? { ...g, time } : g
    );
    onDataChange('teeTimeGroups', updated);
  };

  const addPlayerToTeeTime = (groupId: string, playerId: string) => {
    const updated = data.teeTimeGroups.map(g => {
      if (g.id === groupId && g.playerIds.length < 4) {
        return { ...g, playerIds: [...g.playerIds, playerId] };
      }
      return g;
    });
    onDataChange('teeTimeGroups', updated);
  };

  const removePlayerFromTeeTime = (groupId: string, playerId: string) => {
    const updated = data.teeTimeGroups.map(g => ({
      ...g,
      playerIds: g.playerIds.filter(id => id !== playerId)
    }));
    onDataChange('teeTimeGroups', updated);
  };

  const handleSwipeRightToTeeTime = (playerId: string) => {
    const availableGroup = data.teeTimeGroups.find(g => g.playerIds.length < 4);
    if (availableGroup) {
      addPlayerToTeeTime(availableGroup.id, playerId);
      triggerSelection();
    } else {
      const newGroup = {
        id: `teetime-${Date.now()}`,
        time: '08:00',
        playerIds: [playerId]
      };
      onDataChange('teeTimeGroups', [...data.teeTimeGroups, newGroup]);
      triggerSelection();
    }
  };

  const getStepTitle = () => {
    if (isTeamBased && needsTeeTimeGroups) return 'Teams & Tee Times';
    if (isTeamBased) return 'Team Organization';
    return 'Tee Time Organization';
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{getStepTitle()}</h3>

      {/* Show tabs if both teams and tee times are needed */}
      {isTeamBased && needsTeeTimeGroups ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'teams' | 'teetimes')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="teetimes">Tee Times</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4 mt-4">
            {/* Team Organization UI */}
            <div className="flex justify-between items-center">
              <h4 className="font-medium">
                Teams ({playersPerTeam} players each)
              </h4>
              <Button onClick={autoGenerateTeams} variant="outline" size="sm">
                Auto-Generate
              </Button>
            </div>

            {data.teams.map(team => (
              <DropZone
                key={team.id}
                id={team.id}
                title={team.name}
                capacity={{ current: team.playerIds.length, max: playersPerTeam }}
              >
                {team.playerIds.map(playerId => {
                  const player = data.players.find(p => p.id === playerId);
                  return player ? (
                    <DraggablePlayerCard
                      key={playerId}
                      player={player}
                      isDragging={dragState.isDragging && dragState.draggedId === playerId}
                      onTouchStart={(e) => handleTouchStart(e, playerId, 'player')}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleTouchEnd((draggedId) => removePlayerFromTeam(team.id, draggedId));
                      }}
                    />
                  ) : null;
                })}
              </DropZone>
            ))}

            {unassignedPlayers.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm text-muted-foreground">Available Players</h5>
                <PlayerPool
                  players={unassignedPlayers}
                  onSwipeRight={(playerId) => addPlayerToTeam(1, playerId)}
                  onSwipeLeft={(playerId) => removePlayer(playerId)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="teetimes" className="space-y-4 mt-4">
            {/* Tee Time Organization UI */}
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Tee Times</h4>
              <Button onClick={addTeeTimeGroup} variant="outline" size="sm">
                Add Group
              </Button>
            </div>

            <div className="space-y-3">
              {data.teeTimeGroups.map(group => {
                const groupPlayers = data.players.filter(p => group.playerIds.includes(p.id));
                return (
                  <TeeTimeGroup
                    key={group.id}
                    groupId={group.id}
                    time={group.time}
                    players={groupPlayers}
                    maxPlayers={4}
                    onUpdateTime={updateTeeTime}
                    onRemovePlayer={removePlayerFromTeeTime}
                  />
                );
              })}
            </div>

            {unassignedPlayers.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm text-muted-foreground">Available Players</h5>
                <PlayerPool
                  players={unassignedPlayers}
                  onSwipeRight={handleSwipeRightToTeeTime}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : isTeamBased ? (
        /* Teams only */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">
              Teams ({playersPerTeam} players each)
            </h4>
            <Button onClick={autoGenerateTeams} variant="outline" size="sm">
              Auto-Generate
            </Button>
          </div>

          {data.teams.map(team => (
            <DropZone
              key={team.id}
              id={team.id}
              title={team.name}
              capacity={{ current: team.playerIds.length, max: playersPerTeam }}
            >
              {team.playerIds.map(playerId => {
                const player = data.players.find(p => p.id === playerId);
                return player ? (
                  <DraggablePlayerCard
                    key={playerId}
                    player={player}
                    isDragging={dragState.isDragging && dragState.draggedId === playerId}
                    onTouchStart={(e) => handleTouchStart(e, playerId, 'player')}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleTouchEnd((draggedId) => removePlayerFromTeam(team.id, draggedId));
                    }}
                  />
                ) : null;
              })}
            </DropZone>
          ))}

          {unassignedPlayers.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm text-muted-foreground">Available Players</h5>
              <PlayerPool
                players={unassignedPlayers}
                onSwipeRight={(playerId) => addPlayerToTeam(1, playerId)}
              />
            </div>
          )}
        </div>
      ) : (
        /* Tee times only */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Tee Times</h4>
            <Button onClick={addTeeTimeGroup} variant="outline" size="sm">
              Add Group
            </Button>
          </div>

          <div className="space-y-3">
            {data.teeTimeGroups.map(group => {
              const groupPlayers = data.players.filter(p => group.playerIds.includes(p.id));
              return (
                <TeeTimeGroup
                  key={group.id}
                  groupId={group.id}
                  time={group.time}
                  players={groupPlayers}
                  maxPlayers={4}
                  onUpdateTime={updateTeeTime}
                  onRemovePlayer={removePlayerFromTeeTime}
                />
              );
            })}
          </div>

          {unassignedPlayers.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm text-muted-foreground">Available Players</h5>
              <PlayerPool
                players={unassignedPlayers}
                onSwipeRight={handleSwipeRightToTeeTime}
              />
            </div>
          )}
        </div>
      )}

      <GameTypeInfo gameType={data.gameType.type} />
    </div>
  );
};

export default TeamOrganizationStep;
