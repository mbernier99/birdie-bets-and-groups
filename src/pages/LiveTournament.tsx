
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Target, ArrowLeft, Users, Flag, Settings, Medal } from 'lucide-react';
import { calculateNetScore } from '@/utils/handicapCalculations';
import { formatMatchScore } from '@/utils/matchPlayCalculations';
import { TeamMatch, createTeamMatch, updateTeamMatch, getMatchDisplayStatus } from '@/utils/teamMatchPlayCalculations';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

interface PlayerScore {
  playerId: string;
  hole: number;
  gross: number;
  net: number;
  strokes: number;
}

interface LiveTournamentPlayer {
  id: string;
  name: string;
  handicapIndex: number;
  courseHandicap: number;
  strokesPerHole: number[];
  currentHole: number;
  scores: PlayerScore[];
  totalGross: number;
  totalNet: number;
  position: number;
  teamId?: string;
}

interface Team {
  id: string;
  name: string;
  players: string[];
}

interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  status: TeamMatch;
}

const LiveTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<any>(null);
  const [players, setPlayers] = useState<LiveTournamentPlayer[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentHole, setCurrentHole] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [scoreInput, setScoreInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'scoring' | 'leaderboard' | 'matches'>('scoring');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tournament data
    const tournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    const foundTournament = tournaments.find((t: any) => t.id === id);
    
    if (foundTournament) {
      setTournament(foundTournament);
      
      // Initialize players with live scoring data
      const livePlayers = foundTournament.players?.map((player: any) => ({
        ...player,
        currentHole: 1,
        scores: [],
        totalGross: 0,
        totalNet: 0,
        position: 1,
        teamId: player.teamId  // May be undefined initially
      })) || [];
      
      // Initialize teams if they exist
      let tournamentTeams: Team[] = [];
      if (foundTournament.teams && foundTournament.teams.length > 0) {
        tournamentTeams = foundTournament.teams;
      } else if (foundTournament.gameType.type === '2-Man Best Ball' || 
                 foundTournament.gameType.type === 'Match Play') {
        // Auto-create teams for match play if not defined
        // For simplicity, just pair consecutive players
        tournamentTeams = [];
        for (let i = 0; i < livePlayers.length; i += 2) {
          if (i + 1 < livePlayers.length) {
            const teamId = `team-${Math.floor(i/2) + 1}`;
            tournamentTeams.push({
              id: teamId,
              name: `Team ${Math.floor(i/2) + 1}`,
              players: [livePlayers[i].id, livePlayers[i + 1].id]
            });
            
            // Assign team IDs to players
            livePlayers[i].teamId = teamId;
            livePlayers[i + 1].teamId = teamId;
          }
        }
      }
      
      // Initialize matches for match play
      let tournamentMatches: Match[] = [];
      if (tournamentTeams.length >= 2) {
        // For simplicity, match first team against second, third against fourth, etc.
        for (let i = 0; i < tournamentTeams.length; i += 2) {
          if (i + 1 < tournamentTeams.length) {
            const team1 = tournamentTeams[i];
            const team2 = tournamentTeams[i + 1];
            const matchId = `match-${Math.floor(i/2) + 1}`;
            
            tournamentMatches.push({
              id: matchId,
              team1Id: team1.id,
              team2Id: team2.id,
              status: createTeamMatch(
                matchId,
                team1.id,
                team2.id,
                team1.players,
                team2.players
              )
            });
          }
        }
      }
      
      setTeams(tournamentTeams);
      setMatches(tournamentMatches);
      setPlayers(livePlayers);
      if (livePlayers.length > 0) {
        setSelectedPlayer(livePlayers[0].id);
      }
    }
    setLoading(false);
  }, [id]);

  const handleScoreEntry = (playerId: string, hole: number, grossScore: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const strokes = player.strokesPerHole[hole - 1];
    const netScore = calculateNetScore(grossScore, strokes);

    const newScore: PlayerScore = {
      playerId,
      hole,
      gross: grossScore,
      net: netScore,
      strokes
    };

    setPlayers(prevPlayers => {
      const updatedPlayers = prevPlayers.map(p => {
        if (p.id === playerId) {
          const existingScoreIndex = p.scores.findIndex(s => s.hole === hole);
          let updatedScores;
          
          if (existingScoreIndex >= 0) {
            updatedScores = [...p.scores];
            updatedScores[existingScoreIndex] = newScore;
          } else {
            updatedScores = [...p.scores, newScore];
          }

          const totalGross = updatedScores.reduce((sum, s) => sum + s.gross, 0);
          const totalNet = updatedScores.reduce((sum, s) => sum + s.net, 0);

          return {
            ...p,
            scores: updatedScores,
            totalGross,
            totalNet,
            currentHole: Math.max(p.currentHole, hole + 1)
          };
        }
        return p;
      });

      // Update positions based on net scores
      return updatedPlayers
        .sort((a, b) => a.totalNet - b.totalNet)
        .map((player, index) => ({ ...player, position: index + 1 }));
    });

    setScoreInput('');
    
    // Update match scores if in team play
    if (matches.length > 0) {
      updateMatchScores(hole);
    }
  };

  const updateMatchScores = (holeNumber: number) => {
    // Only update matches when all scores for the hole are entered
    const playersWithScoreForHole = players.filter(p => 
      p.scores.some(s => s.hole === holeNumber)
    );
    
    // Check if all players have entered their scores for this hole
    if (playersWithScoreForHole.length === players.length) {
      // Update each match
      const updatedMatches = matches.map(match => {
        const { team1Id, team2Id, status } = match;
        
        // Get team players
        const team1Players = players.filter(p => p.teamId === team1Id);
        const team2Players = players.filter(p => p.teamId === team2Id);
        
        // Calculate team scores for this hole
        const team1Score = Math.min(
          ...team1Players.map(p => {
            const score = p.scores.find(s => s.hole === holeNumber);
            return score ? score.net : 999; // Large number if no score
          })
        );
        
        const team2Score = Math.min(
          ...team2Players.map(p => {
            const score = p.scores.find(s => s.hole === holeNumber);
            return score ? score.net : 999; // Large number if no score
          })
        );
        
        // Update match status
        const updatedStatus = updateTeamMatch(
          status,
          holeNumber,
          team1Score,
          team2Score
        );
        
        return {
          ...match,
          status: updatedStatus
        };
      });
      
      setMatches(updatedMatches);
      
      // Show toast when a hole is completed
      toast({
        title: `Hole ${holeNumber} Complete`,
        description: "All scores entered. Match statuses updated.",
      });
    }
  };

  const getScoreColor = (score: number, par: number, strokes: number) => {
    const netPar = par + strokes;
    if (score < netPar) return 'text-green-600'; // Under net par
    if (score === netPar) return 'text-gray-900'; // Net par
    return 'text-red-600'; // Over net par
  };

  const currentHoleData = tournament?.course?.holes?.[currentHole - 1];
  const selectedPlayerData = players.find(p => p.id === selectedPlayer);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tournament...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h2>
            <Button onClick={() => navigate('/')} className="bg-emerald-600 hover:bg-emerald-700">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getPlayerTeam = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player?.teamId) return null;
    return teams.find(t => t.id === player.teamId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/tournament/${id}/lobby`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Lobby</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">LIVE</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{tournament.basicInfo.name}</h1>
            <p className="text-gray-600">{tournament.course.name}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('scoring')}
              className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                activeTab === 'scoring'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Scoring</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Medal className="h-4 w-4" />
                <span>Matches</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </div>
            </button>
          </div>

          {activeTab === 'scoring' && (
            <div className="p-6">
              {/* Hole Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Hole</h3>
                  <select
                    value={currentHole}
                    onChange={(e) => setCurrentHole(parseInt(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {Array.from({ length: 18 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Hole {i + 1}</option>
                    ))}
                  </select>
                </div>
                
                {currentHoleData && (
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Flag className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">Hole {currentHole}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Par:</span>
                        <span className="font-bold text-gray-900 ml-1">{currentHoleData.par}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">HCP:</span>
                        <span className="font-bold text-gray-900 ml-1">{currentHoleData.handicapIndex}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Yardage:</span>
                        <span className="font-bold text-gray-900 ml-1">{currentHoleData.yardage || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Player Selection & Score Entry */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Player</label>
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {players.map(player => {
                      const team = getPlayerTeam(player.id);
                      return (
                        <option key={player.id} value={player.id}>
                          {player.name} {team ? `(${team.name})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedPlayerData && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{selectedPlayerData.name}</span>
                      <span className="text-sm text-gray-600">
                        Strokes: {selectedPlayerData.strokesPerHole[currentHole - 1] || 0}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Course HCP:</span>
                        <span className="font-bold ml-1">{selectedPlayerData.courseHandicap}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Current Hole:</span>
                        <span className="font-bold ml-1">{selectedPlayerData.currentHole}</span>
                      </div>
                    </div>
                    {getPlayerTeam(selectedPlayerData.id) && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Team:</span>
                        <span className="font-bold ml-1">{getPlayerTeam(selectedPlayerData.id)?.name}</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gross Score</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      min="1"
                      max="15"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Enter score"
                    />
                    <Button
                      onClick={() => {
                        if (scoreInput && selectedPlayer) {
                          handleScoreEntry(selectedPlayer, currentHole, parseInt(scoreInput));
                        }
                      }}
                      disabled={!scoreInput || !selectedPlayer}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Save
                    </Button>
                  </div>
                </div>

                {/* Quick Score Buttons */}
                {currentHoleData && (
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 8 }, (_, i) => {
                      const score = currentHoleData.par + i - 2;
                      if (score < 1) return null;
                      return (
                        <Button
                          key={score}
                          variant="outline"
                          onClick={() => {
                            if (selectedPlayer) {
                              handleScoreEntry(selectedPlayer, currentHole, score);
                            }
                          }}
                          className="py-2"
                        >
                          {score}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="p-6">
              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match) => {
                    const team1 = teams.find(t => t.id === match.team1Id);
                    const team2 = teams.find(t => t.id === match.team2Id);
                    
                    // Get players from each team
                    const team1Players = players.filter(p => team1?.players.includes(p.id));
                    const team2Players = players.filter(p => team2?.players.includes(p.id));
                    
                    return (
                      <div key={match.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="font-medium text-lg mb-3">
                          Match {match.id.replace('match-', '')}
                        </h3>
                        
                        <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg border border-gray-100">
                          <div className="font-medium">Match Status:</div>
                          <div className="font-bold text-emerald-600">
                            {getMatchDisplayStatus(match.status)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Team 1 */}
                          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                            <h4 className="font-medium text-emerald-800 mb-2">{team1?.name || 'Team 1'}</h4>
                            <div className="space-y-2">
                              {team1Players.map(player => (
                                <div key={player.id} className="flex justify-between text-sm">
                                  <div>{player.name}</div>
                                  <div className="font-medium text-emerald-700">
                                    {player.scores.length > 0 ? 
                                      `${player.totalGross} gross / ${player.totalNet} net` : 
                                      'No scores yet'}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-2 border-t border-emerald-200 text-sm">
                              <div className="flex justify-between">
                                <span>Holes Won:</span>
                                <span className="font-bold">{match.status.team1Score.holesWon}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Holes Lost:</span>
                                <span className="font-bold">{match.status.team1Score.holesLost}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Holes Halved:</span>
                                <span className="font-bold">{match.status.team1Score.holesHalved}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Team 2 */}
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <h4 className="font-medium text-blue-800 mb-2">{team2?.name || 'Team 2'}</h4>
                            <div className="space-y-2">
                              {team2Players.map(player => (
                                <div key={player.id} className="flex justify-between text-sm">
                                  <div>{player.name}</div>
                                  <div className="font-medium text-blue-700">
                                    {player.scores.length > 0 ? 
                                      `${player.totalGross} gross / ${player.totalNet} net` : 
                                      'No scores yet'}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-2 border-t border-blue-200 text-sm">
                              <div className="flex justify-between">
                                <span>Holes Won:</span>
                                <span className="font-bold">{match.status.team2Score.holesWon}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Holes Lost:</span>
                                <span className="font-bold">{match.status.team2Score.holesLost}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Holes Halved:</span>
                                <span className="font-bold">{match.status.team2Score.holesHalved}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Medal className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Matches Set Up</h3>
                  <p className="text-gray-600">This tournament doesn't have any team matches configured.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="p-6">
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={player.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {player.position}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className="text-sm text-gray-600">
                          {getPlayerTeam(player.id) ? `${getPlayerTeam(player.id)?.name}, ` : ''}
                          Hole {player.currentHole - 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{player.totalNet > 0 ? `+${player.totalNet}` : player.totalNet || 'E'}</div>
                      <div className="text-xs text-gray-600">Gross: {player.totalGross || 'E'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTournament;
