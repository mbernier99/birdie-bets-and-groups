import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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

  // Auto-generate teams for 2-Man Best Ball Match Play
  const autoGenerateTeams = () => {
    const availablePlayers = data.players.filter(p => p.status === 'accepted');
    
    if (availablePlayers.length < 2) return;

    const teams = [];
    for (let i = 0; i < availablePlayers.length; i += 2) {
      if (i + 1 < availablePlayers.length) {
        const team = {
          id: `team-${i / 2 + 1}`,
          name: `Team ${i / 2 + 1}`,
          playerIds: [availablePlayers[i].id, availablePlayers[i + 1].id]
        };
        teams.push(team);
      }
    }

    onDataChange('teams', teams);
  };

  // Auto-generate teams when game type is best-ball-match-play and players change
  useEffect(() => {
    if (data.gameType.type === 'best-ball-match-play') {
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

  const createTeam = () => {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: `Team ${data.teams.length + 1}`,
      playerIds: []
    };
    onDataChange('teams', [...data.teams, newTeam]);
  };

  const updateTeam = (teamId: string, updates: Partial<{ name: string; playerIds: string[] }>) => {
    const updatedTeams = data.teams.map(team =>
      team.id === teamId ? { ...team, ...updates } : team
    );
    onDataChange('teams', updatedTeams);
  };

  const deleteTeam = (teamId: string) => {
    onDataChange('teams', data.teams.filter(t => t.id !== teamId));
  };

  const addPlayerToTeam = (teamId: string, playerId: string) => {
    const team = data.teams.find(t => t.id === teamId);
    if (team && !team.playerIds.includes(playerId)) {
      // For 2-Man Best Ball Match Play, limit teams to 2 players
      if (data.gameType.type === 'best-ball-match-play' && team.playerIds.length >= 2) {
        return; // Don't add more than 2 players
      }
      
      updateTeam(teamId, {
        playerIds: [...team.playerIds, playerId]
      });
    }
  };

  const removePlayerFromTeam = (teamId: string, playerId: string) => {
    const team = data.teams.find(t => t.id === teamId);
    if (team) {
      updateTeam(teamId, {
        playerIds: team.playerIds.filter(id => id !== playerId)
      });
    }
  };

  const unassignedPlayers = data.players.filter(player => 
    !data.teams.some(team => team.playerIds.includes(player.id))
  );

  const isTeamBased = ['best-ball', 'best-ball-match-play', 'scramble'].includes(data.gameType.type);

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
                <div className="font-medium">{player.name}</div>
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
              Teams {data.gameType.type === 'best-ball-match-play' ? '(2 players each)' : ''}
            </h4>
            {data.gameType.type !== 'best-ball-match-play' && (
              <Button onClick={createTeam} variant="outline">Add Team</Button>
            )}
            {data.gameType.type === 'best-ball-match-play' && (
              <Button onClick={autoGenerateTeams} variant="outline">
                Auto-Generate Teams
              </Button>
            )}
          </div>

          {/* Teams */}
          <div className="space-y-4">
            {data.teams.map(team => (
              <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <Input
                    value={team.name}
                    onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                    className="font-medium"
                  />
                  {data.gameType.type !== 'best-ball-match-play' && (
                    <Button variant="outline" size="sm" onClick={() => deleteTeam(team.id)}>
                      Delete Team
                    </Button>
                  )}
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

          {/* Unassigned Players */}
          {unassignedPlayers.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Available Players</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {unassignedPlayers.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span>{player.name} (HCP: {player.handicapIndex})</span>
                    <Select onValueChange={(teamId) => addPlayerToTeam(teamId, player.id)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Add to team" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.teams
                          .filter(team => 
                            data.gameType.type !== 'best-ball-match-play' || team.playerIds.length < 2
                          )
                          .map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
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
            <li>• Excess players (if odd number) will be left unassigned</li>
            <li>• Teams will be paired against each other for matches</li>
            <li>• Each hole is won, lost, or halved between teams</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeamOrganizationStep;
