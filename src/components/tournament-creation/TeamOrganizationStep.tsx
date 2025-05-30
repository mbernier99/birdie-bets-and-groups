
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';

interface TeamOrganizationStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const TeamOrganizationStep: React.FC<TeamOrganizationStepProps> = ({ data, onDataChange }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerHandicap, setNewPlayerHandicap] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

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

  const addPlayer = () => {
    if (newPlayerName && newPlayerEmail && newPlayerHandicap) {
      const newPlayer = {
        id: Date.now().toString(),
        name: newPlayerName,
        email: newPlayerEmail,
        handicapIndex: parseFloat(newPlayerHandicap),
        status: 'invited' as const
      };

      onDataChange('players', [...data.players, newPlayer]);
      setNewPlayerName('');
      setNewPlayerEmail('');
      setNewPlayerHandicap('');
    }
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

  const startEditingPlayer = (playerId: string, currentName: string) => {
    setEditingPlayer(playerId);
    setEditingName(currentName);
  };

  const savePlayerName = () => {
    if (editingPlayer && editingName.trim()) {
      updatePlayerName(editingPlayer, editingName.trim());
    }
    setEditingPlayer(null);
    setEditingName('');
  };

  const cancelEditingPlayer = () => {
    setEditingPlayer(null);
    setEditingName('');
  };

  const processBulkEmails = () => {
    const emails = bulkEmails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    const newPlayers = emails.map(email => ({
      id: Date.now().toString() + Math.random(),
      name: email.split('@')[0],
      email: email,
      handicapIndex: 18,
      status: 'invited' as const
    }));

    onDataChange('players', [...data.players, ...newPlayers]);
    setBulkEmails('');
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
          />
          <Input
            placeholder="Email address"
            value={newPlayerEmail}
            onChange={(e) => setNewPlayerEmail(e.target.value)}
          />
          <Input
            placeholder="Handicap index"
            type="number"
            step="0.1"
            value={newPlayerHandicap}
            onChange={(e) => setNewPlayerHandicap(e.target.value)}
          />
          <Button onClick={addPlayer} className="bg-emerald-600 hover:bg-emerald-700">
            Add Player
          </Button>
        </div>

        {/* Bulk Email Import */}
        <div className="space-y-2">
          <Label>Bulk Add Players (one email per line or comma-separated)</Label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-20"
            placeholder="player1@email.com, player2@email.com
player3@email.com"
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
          />
          <Button 
            onClick={processBulkEmails}
            variant="outline"
            disabled={!bulkEmails.trim()}
          >
            Import Players
          </Button>
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Players ({data.players.length})</h4>
        <div className="space-y-2">
          {data.players.map(player => (
            <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="flex items-center space-x-2">
                  {editingPlayer === player.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-48"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') savePlayerName();
                          if (e.key === 'Escape') cancelEditingPlayer();
                        }}
                      />
                      <Button size="sm" variant="ghost" onClick={savePlayerName}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditingPlayer}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{player.name}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => startEditingPlayer(player.id, player.name)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit2 className="h-3 w-3 text-gray-400" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">{player.email}</div>
                <div className="text-sm text-gray-600">HCP: {player.handicapIndex}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Select 
                  value={player.status} 
                  onValueChange={(value: 'invited' | 'accepted' | 'declined') => updatePlayerStatus(player.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => removePlayer(player.id)}>
                  Remove
                </Button>
              </div>
            </div>
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
              <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <Input
                    value={team.name}
                    onChange={(e) => {
                      const updatedTeams = data.teams.map(t =>
                        t.id === team.id ? { ...t, name: e.target.value } : t
                      );
                      onDataChange('teams', updatedTeams);
                    }}
                    className="font-medium"
                  />
                  <span className="text-sm text-gray-600">
                    {team.playerIds.length}/{playersPerTeam} players
                  </span>
                </div>
                
                <div className="space-y-2">
                  {team.playerIds.map(playerId => {
                    const player = data.players.find(p => p.id === playerId);
                    return player ? (
                      <div key={playerId} className="flex justify-between items-center p-2 bg-emerald-50 rounded">
                        <span>{player.name} (HCP: {player.handicapIndex})</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removePlayerFromTeam(team.id, playerId)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null;
                  })}
                  
                  {team.playerIds.length === 0 && (
                    <div className="text-gray-500 text-sm">No players assigned</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Unassigned Players with Numerical Team Assignment */}
          {unassignedPlayers.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Available Players</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {unassignedPlayers.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span>{player.name} (HCP: {player.handicapIndex})</span>
                    <Select onValueChange={(teamNumber) => addPlayerToTeam(parseInt(teamNumber), player.id)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Add to team" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: Math.max(optimalTeamCount, data.teams.length + 1) }, (_, i) => {
                          const teamNumber = i + 1;
                          const capacity = getTeamCapacity(teamNumber);
                          return (
                            <SelectItem 
                              key={teamNumber} 
                              value={teamNumber.toString()}
                              disabled={capacity.isFull}
                            >
                              Team {teamNumber} ({capacity.current}/{capacity.max})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {data.gameType.type === 'best-ball-match-play' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">2-Man Best Ball Match Play Format</h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Teams are automatically created with 2 players each</li>
            <li>• Use numerical team assignment for easy organization</li>
            <li>• Players can edit their display names for the leaderboard</li>
            <li>• Teams will be paired against each other for matches</li>
            <li>• Each hole is won, lost, or halved between teams</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeamOrganizationStep;
