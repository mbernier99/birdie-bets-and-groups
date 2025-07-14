import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Target, Clock, ArrowLeft, Settings } from 'lucide-react';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';
import Leaderboard from '../components/Leaderboard';
import MatchPlayView from '../components/MatchPlayView';
import TeamLeaderboard from '../components/TeamLeaderboard';

const LiveTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('leaderboard');

  // Mock data for MatchPlayView and TeamLeaderboard
  const mockMatches = [
    {
      id: 'match-1',
      team1Id: 'team-1',
      team2Id: 'team-2',
      status: {
        matchId: 'match-1',
        team1Id: 'team-1',
        team2Id: 'team-2',
        team1Players: ['player-1', 'player-2'],
        team2Players: ['player-3', 'player-4'],
        team1Score: {
          teamId: 'team-1',
          holesWon: 2,
          holesLost: 1,
          holesHalved: 0,
          matchStatus: 'active' as const
        },
        team2Score: {
          teamId: 'team-2',
          holesWon: 1,
          holesLost: 2,
          holesHalved: 0,
          matchStatus: 'active' as const
        },
        currentHole: 4,
        status: 'active' as const
      }
    }
  ];

  const mockTeams = [
    {
      id: 'team-1',
      name: 'Team Alpha',
      players: ['player-1', 'player-2']
    },
    {
      id: 'team-2',
      name: 'Team Beta',
      players: ['player-3', 'player-4']
    }
  ];

  const mockPlayers = [
    {
      id: 'player-1',
      name: 'John Doe',
      scores: [
        { playerId: 'player-1', hole: 1, gross: 4, net: 3, strokes: 1 }
      ]
    },
    {
      id: 'player-2',
      name: 'Jane Smith',
      scores: [
        { playerId: 'player-2', hole: 1, gross: 5, net: 4, strokes: 1 }
      ]
    },
    {
      id: 'player-3',
      name: 'Mike Johnson',
      scores: [
        { playerId: 'player-3', hole: 1, gross: 3, net: 3, strokes: 0 }
      ]
    },
    {
      id: 'player-4',
      name: 'Sarah Wilson',
      scores: [
        { playerId: 'player-4', hole: 1, gross: 4, net: 3, strokes: 1 }
      ]
    }
  ];

  const mockTeamLeaderboard = [
    {
      teamId: 'team-1',
      teamName: 'Team Alpha',
      player1LastName: 'Doe',
      player2LastName: 'Smith',
      teamScore: -2,
      matchStatus: 'won' as const,
      currentHole: 7,
      holesWon: 3,
      holesLost: 1,
      holesHalved: 0,
      marginOfVictory: 2
    },
    {
      teamId: 'team-2',
      teamName: 'Team Beta',
      player1LastName: 'Johnson',
      player2LastName: 'Wilson',
      teamScore: 1,
      matchStatus: 'lost' as const,
      currentHole: 7,
      holesWon: 1,
      holesLost: 3,
      holesHalved: 0,
      marginOfVictory: 2
    }
  ];

  useEffect(() => {
    // Load tournament data
    const savedTournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    const foundTournament = savedTournaments.find((t: any) => t.id === id);
    
    if (foundTournament) {
      setTournament(foundTournament);
    } else {
      // Demo tournament data
      setTournament({
        id: id,
        basicInfo: { name: 'Sunday Singles Championship', maxPlayers: 16 },
        gameType: { type: 'Match Play' },
        wagering: { entryFee: 15, currency: '$' },
        players: [
          { id: '1', name: 'John Doe', handicap: 12, score: -2 },
          { id: '2', name: 'Jane Smith', handicap: 8, score: -1 },
          { id: '3', name: 'Mike Johnson', handicap: 15, score: 1 }
        ],
        status: 'live',
        currentHole: 7
      });
    }
  }, [id]);

  const handleBackToLobby = () => {
    navigate(`/tournament/${id}/lobby`);
  };

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
        <MobileHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tournament Not Found</h2>
            <p className="text-gray-600">The tournament you're looking for doesn't exist.</p>
          </div>
        </div>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tournament Header */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToLobby}
              className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Lobby</span>
            </button>
            <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.basicInfo.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{tournament.players.length} Players</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>{tournament.gameType.type}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>Hole {tournament.currentHole || 1}</span>
                </span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Clock className="h-4 w-4 mr-1" />
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leaderboard
              </button>
              {tournament.gameType.type === 'Match Play' && (
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'matches'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Matches
                </button>
              )}
              {tournament.gameType.type?.includes('Team') && (
                <button
                  onClick={()={() => setActiveTab('teams')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'teams'
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Teams
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100">
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'matches' && (
            <MatchPlayView 
              matches={mockMatches}
              teams={mockTeams}
              players={mockPlayers}
            />
          )}
          {activeTab === 'teams' && <TeamLeaderboard teams={mockTeamLeaderboard} />}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default LiveTournament;
