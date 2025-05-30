
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Target, ArrowLeft, Users, Flag } from 'lucide-react';
import { calculateNetScore } from '@/utils/handicapCalculations';
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
}

const LiveTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [players, setPlayers] = useState<LiveTournamentPlayer[]>([]);
  const [currentHole, setCurrentHole] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [scoreInput, setScoreInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'scoring' | 'leaderboard'>('scoring');

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
        position: 1
      })) || [];
      
      setPlayers(livePlayers);
      if (livePlayers.length > 0) {
        setSelectedPlayer(livePlayers[0].id);
      }
    }
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
  };

  const getScoreColor = (score: number, par: number, strokes: number) => {
    const netPar = par + strokes;
    if (score < netPar) return 'text-green-600'; // Under net par
    if (score === netPar) return 'text-gray-900'; // Net par
    return 'text-red-600'; // Over net par
  };

  const currentHoleData = tournament?.course?.holes?.[currentHole - 1];
  const selectedPlayerData = players.find(p => p.id === selectedPlayer);

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
                    {players.map(player => (
                      <option key={player.id} value={player.id}>{player.name}</option>
                    ))}
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
                        <div className="text-sm text-gray-600">Hole {player.currentHole - 1}</div>
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
