
import React, { useState } from 'react';
import { TournamentData } from '../CreateTournamentModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Mail, Users, Shuffle } from 'lucide-react';

interface TeamOrganizationStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const gameTypes = [
  { id: 'best-ball', name: 'Best Ball', teamSize: 2, maxTeams: 8, needsPairings: true },
  { id: 'scramble', name: 'Scramble', teamSize: 4, maxTeams: 4, needsPairings: true },
  { id: 'match-play', name: 'Match Play', teamSize: 1, maxTeams: 8, needsPairings: false },
  { id: 'stroke-play', name: 'Stroke Play', teamSize: 1, maxTeams: 32, needsPairings: true },
  { id: 'nassau', name: 'Nassau', teamSize: 1, maxTeams: 8, needsPairings: true },
  { id: 'skins', name: 'Skins', teamSize: 1, maxTeams: 8, needsPairings: true },
];

const TeamOrganizationStep: React.FC<TeamOrganizationStepProps> = ({ data, onDataChange }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerHandicap, setNewPlayerHandicap] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');

  const selectedGame = gameTypes.find(g => g.id === data.gameType.type);

  const addPlayer = () => {
    if (!newPlayerName || !newPlayerEmail) return;

    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName,
      email: newPlayerEmail,
      handicapIndex: newPlayerHandicap ? parseInt(newPlayerHandicap) : 0,
      status: 'invited' as const
    };

    onDataChange('players', [...data.players, newPlayer]);
    setNewPlayerName('');
    setNewPlayerEmail('');
    setNewPlayerHandicap('');
  };

  const addBulkPlayers = () => {
    if (!bulkEmails.trim()) return;

    const emails = bulkEmails
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes('@'));

    const newPlayers = emails.map((email, index) => ({
      id: `${Date.now()}-${index}`,
      name: email.split('@')[0], // Use email prefix as default name
      email: email,
      handicapIndex: 18, // Default handicap
      status: 'invited' as const
    }));

    onDataChange('players', [...data.players, ...newPlayers]);
    setBulkEmails('');
  };

  const removePlayer = (playerId: string) => {
    onDataChange('players', data.players.filter(p => p.id !== playerId));
    // Also remove from teams
    const updatedTeams = data.teams.map(team => ({
      ...team,
      playerIds: team.playerIds.filter(id => id !== playerId)
    }));
    onDataChange('teams', updatedTeams);
  };

  const createTeamsAutomatically = () => {
    if (!selectedGame) return;

    const shuffledPlayers = [...data.players].sort(() => Math.random() - 0.5);
    const teams = [];
    
    for (let i = 0; i < shuffledPlayers.length; i += selectedGame.teamSize) {
      const teamPlayers = shuffledPlayers.slice(i, i + selectedGame.teamSize);
      if (teamPlayers.length === selectedGame.teamSize) {
        teams.push({
          id: `team-${teams.length + 1}`,
          name: `Team ${teams.length + 1}`,
          playerIds: teamPlayers.map(p => p.id)
        });
      }
    }

    onDataChange('teams', teams);
  };

  const createPairings = () => {
    if (!selectedGame?.needsPairings) return;

    const pairings = [];
    let pairingSize = 4; // Default foursome

    if (selectedGame.id === 'match-play') pairingSize = 2;

    for (let i = 0; i < data.players.length; i += pairingSize) {
      const pairingPlayers = data.players.slice(i, i + pairingSize);
      if (pairingPlayers.length >= 2) {
        pairings.push({
          id: `pairing-${pairings.length + 1}`,
          name: `Group ${pairings.length + 1}`,
          playerIds: pairingPlayers.map(p => p.id),
          teeTime: ''
        });
      }
    }

    onDataChange('pairings', pairings);
  };

  if (!data.gameType.type) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Players & Teams</h3>
        <div className="bg-yellow-50 p-8 rounded-lg text-center border border-yellow-200">
          <p className="text-yellow-800 font-medium">Please select a game type first</p>
          <p className="text-sm text-yellow-600 mt-2">Go back to the Game Type step to choose your tournament format.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Players & Teams</h3>
        {selectedGame && (
          <Badge variant="outline" className="text-sm">
            {selectedGame.name} - {selectedGame.teamSize === 1 ? 'Individual' : `${selectedGame.teamSize}-person teams`}
          </Badge>
        )}
      </div>

      {/* Add Single Player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Individual Player
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Player Name</Label>
              <Input
                id="player-name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="player-email">Email Address</Label>
              <Input
                id="player-email"
                type="email"
                value={newPlayerEmail}
                onChange={(e) => setNewPlayerEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="player-handicap">Handicap (optional)</Label>
              <Input
                id="player-handicap"
                type="number"
                value={newPlayerHandicap}
                onChange={(e) => setNewPlayerHandicap(e.target.value)}
                placeholder="18"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addPlayer} className="w-full">
                Add Player
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Email Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Add Players by Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-emails">Email Addresses (one per line)</Label>
            <Textarea
              id="bulk-emails"
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="player1@email.com&#10;player2@email.com&#10;player3@email.com"
              rows={4}
            />
          </div>
          <Button onClick={addBulkPlayers} variant="outline" className="w-full">
            Add All Players
          </Button>
        </CardContent>
      </Card>

      {/* Players List */}
      {data.players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({data.players.length})
              </span>
              <div className="space-x-2">
                {selectedGame && selectedGame.teamSize > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createTeamsAutomatically}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Auto Create Teams
                  </Button>
                )}
                {selectedGame?.needsPairings && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createPairings}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Create Pairings
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-600">{player.email}</div>
                    <div className="text-sm text-gray-500">Handicap: {player.handicapIndex}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Ready
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removePlayer(player.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams Display */}
      {data.teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.teams.map((team) => (
                <div key={team.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{team.name}</h4>
                  <div className="space-y-1">
                    {team.playerIds.map((playerId) => {
                      const player = data.players.find(p => p.id === playerId);
                      return player ? (
                        <div key={playerId} className="text-sm text-gray-600">
                          {player.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pairings Display */}
      {data.pairings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Playing Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.pairings.map((pairing) => (
                <div key={pairing.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{pairing.name}</h4>
                  <div className="space-y-1">
                    {pairing.playerIds.map((playerId) => {
                      const player = data.players.find(p => p.id === playerId);
                      return player ? (
                        <div key={playerId} className="text-sm text-gray-600">
                          {player.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamOrganizationStep;
