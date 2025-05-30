
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flag, Users, Target, DollarSign } from 'lucide-react';
import { TeamMatch } from '@/utils/teamMatchPlayCalculations';

interface PlayerScore {
  playerId: string;
  hole: number;
  gross: number;
  net: number;
  strokes: number;
}

interface MatchPlayPlayer {
  id: string;
  name: string;
  scores: PlayerScore[];
  teamId?: string;
}

interface MatchPlayViewProps {
  matches: Array<{
    id: string;
    team1Id: string;
    team2Id: string;
    status: TeamMatch;
  }>;
  teams: Array<{
    id: string;
    name: string;
    players: string[];
  }>;
  players: MatchPlayPlayer[];
  onTeamPress?: (teamId: string) => void;
  onPlayerPress?: (playerId: string) => void;
}

const MatchPlayView: React.FC<MatchPlayViewProps> = ({
  matches,
  teams,
  players,
  onTeamPress,
  onPlayerPress
}) => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  const getTeamBestBallScore = (teamPlayers: MatchPlayPlayer[], hole: number): number | null => {
    const holeScores = teamPlayers
      .map(player => player.scores.find(s => s.hole === hole)?.net)
      .filter(score => score !== undefined) as number[];
    
    return holeScores.length > 0 ? Math.min(...holeScores) : null;
  };

  const getPlayerUsedForHole = (teamPlayers: MatchPlayPlayer[], hole: number): string | null => {
    const bestScore = getTeamBestBallScore(teamPlayers, hole);
    if (bestScore === null) return null;
    
    const playerWithBestScore = teamPlayers.find(player => 
      player.scores.find(s => s.hole === hole)?.net === bestScore
    );
    
    return playerWithBestScore?.name || null;
  };

  const getMatchStatusDisplay = (match: any) => {
    const team1Score = match.status.team1Score;
    const team2Score = match.status.team2Score;
    const diff = team1Score.holesWon - team1Score.holesLost;
    
    if (diff === 0) return { text: 'All Square', color: 'bg-gray-100 text-gray-800' };
    if (diff > 0) return { text: `Team 1: ${diff} UP`, color: 'bg-green-100 text-green-800' };
    return { text: `Team 2: ${Math.abs(diff)} UP`, color: 'bg-blue-100 text-blue-800' };
  };

  return (
    <div className="space-y-6">
      {/* Match Overview Cards */}
      <div className="grid gap-4">
        {matches.map((match) => {
          const team1 = teams.find(t => t.id === match.team1Id);
          const team2 = teams.find(t => t.id === match.team2Id);
          const team1Players = players.filter(p => team1?.players.includes(p.id));
          const team2Players = players.filter(p => team2?.players.includes(p.id));
          const statusDisplay = getMatchStatusDisplay(match);

          return (
            <Card key={match.id} className="border-l-4 border-l-emerald-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Match {match.id.replace('match-', '')}</CardTitle>
                  <Badge className={statusDisplay.color}>
                    {statusDisplay.text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team 1 */}
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-emerald-800 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {team1?.name || 'Team 1'}
                      </h4>
                      {onTeamPress && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onTeamPress(team1?.id || '')}
                          className="text-xs"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Press
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {team1Players.map(player => (
                        <div key={player.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{player.name}</span>
                          {onPlayerPress && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onPlayerPress(player.id)}
                              className="text-xs h-6 px-2"
                            >
                              Press
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-emerald-700">{match.status.team1Score.holesWon}</div>
                        <div className="text-emerald-600">Won</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-emerald-700">{match.status.team1Score.holesLost}</div>
                        <div className="text-emerald-600">Lost</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-emerald-700">{match.status.team1Score.holesHalved}</div>
                        <div className="text-emerald-600">Halved</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team 2 */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-800 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {team2?.name || 'Team 2'}
                      </h4>
                      {onTeamPress && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onTeamPress(team2?.id || '')}
                          className="text-xs"
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          Press
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      {team2Players.map(player => (
                        <div key={player.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{player.name}</span>
                          {onPlayerPress && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onPlayerPress(player.id)}
                              className="text-xs h-6 px-2"
                            >
                              Press
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-blue-700">{match.status.team2Score.holesWon}</div>
                        <div className="text-blue-600">Won</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-700">{match.status.team2Score.holesLost}</div>
                        <div className="text-blue-600">Lost</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-700">{match.status.team2Score.holesHalved}</div>
                        <div className="text-blue-600">Halved</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hole-by-hole detail button */}
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)}
                    className="text-xs"
                  >
                    <Target className="h-3 w-3 mr-1" />
                    {selectedMatch === match.id ? 'Hide' : 'Show'} Hole Details
                  </Button>
                </div>
                
                {/* Hole-by-hole scorecard */}
                {selectedMatch === match.id && (
                  <div className="mt-4 border-t pt-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Hole</TableHead>
                            <TableHead>Team 1 Score</TableHead>
                            <TableHead>Team 2 Score</TableHead>
                            <TableHead>Result</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => {
                            const team1Score = getTeamBestBallScore(team1Players, hole);
                            const team2Score = getTeamBestBallScore(team2Players, hole);
                            const team1Player = getPlayerUsedForHole(team1Players, hole);
                            const team2Player = getPlayerUsedForHole(team2Players, hole);
                            
                            let result = '-';
                            if (team1Score !== null && team2Score !== null) {
                              if (team1Score < team2Score) result = 'Team 1';
                              else if (team2Score < team1Score) result = 'Team 2';
                              else result = 'Halved';
                            }
                            
                            return (
                              <TableRow key={hole}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center">
                                    <Flag className="h-3 w-3 mr-1" />
                                    {hole}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {team1Score !== null ? (
                                    <div>
                                      <div className="font-bold">{team1Score}</div>
                                      <div className="text-xs text-gray-500">{team1Player}</div>
                                    </div>
                                  ) : '-'}
                                </TableCell>
                                <TableCell>
                                  {team2Score !== null ? (
                                    <div>
                                      <div className="font-bold">{team2Score}</div>
                                      <div className="text-xs text-gray-500">{team2Player}</div>
                                    </div>
                                  ) : '-'}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={result === 'Team 1' ? 'default' : result === 'Team 2' ? 'secondary' : 'outline'}
                                    className="text-xs"
                                  >
                                    {result}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MatchPlayView;
