import React, { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, Plus, Calendar, DollarSign, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TournamentCard from '../components/TournamentCard';
import Leaderboard from '../components/Leaderboard';
import CreateTournamentModal from '../components/CreateTournamentModal';
import PlayNowModal from '../components/PlayNowModal';

const Index = () => {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [isPlayNowModalOpen, setIsPlayNowModalOpen] = useState(false);
  const [savedTournaments, setSavedTournaments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved tournaments from localStorage
    const tournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    setSavedTournaments(tournaments);
  }, [isCreateTournamentModalOpen]); // Refresh when modal closes

  const handleCreateTournament = () => {
    console.log('Create Tournament button clicked on homepage');
    setIsCreateTournamentModalOpen(true);
  };

  const handlePlayNow = () => {
    console.log('Play Now button clicked on homepage');
    setIsPlayNowModalOpen(true);
  };

  const handleCloseCreateTournamentModal = () => {
    setIsCreateTournamentModalOpen(false);
  };

  const handleClosePlayNowModal = () => {
    setIsPlayNowModalOpen(false);
  };

  const handleStartTournament = (tournamentId: string) => {
    console.log('Starting tournament:', tournamentId);
    // Navigate directly to tournament lobby instead of updating status
    navigate(`/tournament/${tournamentId}/lobby`);
  };

  const upcomingTournaments = [
    {
      id: 'demo-1',
      title: 'Sunday Singles Championship',
      players: 12,
      maxPlayers: 16,
      gameType: 'Match Play',
      prize: '$240 Pool',
      date: 'Today 8:00 AM',
      status: 'live' as const
    },
    {
      id: 'demo-2',
      title: 'Weekend Warriors Best Ball',
      players: 8,
      maxPlayers: 12,
      gameType: '2-Man Best Ball',
      prize: '$180 Pool',
      date: 'Tomorrow 9:30 AM',
      status: 'upcoming' as const
    }
  ];

  // Filter active tournaments from saved tournaments
  const activeSavedTournaments = savedTournaments.filter((t: any) => 
    t.status === 'created' || t.status === 'live'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <Navbar />
      
      {/* Hero Section */}
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-8">
        <div className="bg-gradient-to-r from-emerald-700/70 to-emerald-800/70 text-white relative overflow-hidden rounded-3xl">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
            <div className="text-center">
              {/* Large background logo positioned at bottom center */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-40">
                <img 
                  src="/lovable-uploads/fc297cde-a9d2-4fb0-acf6-d28aacc56592.png" 
                  alt="Suntory Cup Background" 
                  className="h-32 w-32 object-contain"
                />
              </div>
              
              <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto relative z-20">
                Create private tournaments, track bets, and compete with friends in the ultimate golf wagering platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
                <button 
                  onClick={handleCreateTournament}
                  className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Tournament</span>
                </button>
                <button 
                  onClick={handlePlayNow}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>Play Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Saved Tournaments Prompt */}
        {savedTournaments.filter((t: any) => t.status === 'created').length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Ready to Start Your Tournaments?</h3>
            <div className="space-y-3">
              {savedTournaments
                .filter((t: any) => t.status === 'created')
                .map((tournament: any) => (
                  <div key={tournament.id} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{tournament.basicInfo.name}</h4>
                      <p className="text-emerald-100 text-sm">
                        Max {tournament.basicInfo.maxPlayers} players • {tournament.gameType.type || 'Game type not set'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartTournament(tournament.id)}
                      className="bg-white text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center space-x-2 font-medium"
                    >
                      <Play className="h-4 w-4" />
                      <span>Enter Lobby</span>
                    </button>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tournaments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tournaments'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4" />
                  <span>Active Tournaments</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Live Leaderboard</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tournaments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Tournaments</h2>
              <button 
                onClick={() => navigate('/tournaments')}
                className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
              >
                <span>View all</span>
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display saved tournaments first */}
              {activeSavedTournaments.slice(0, 2).map((tournament: any) => (
                <TournamentCard 
                  key={tournament.id}
                  id={tournament.id}
                  title={tournament.basicInfo.name}
                  players={tournament.players.length}
                  maxPlayers={tournament.basicInfo.maxPlayers}
                  gameType={tournament.gameType.type || 'Custom Game'}
                  prize={tournament.wagering.entryFee > 0 ? 
                    `${tournament.wagering.currency}${tournament.wagering.entryFee * tournament.basicInfo.maxPlayers} Pool` : 
                    'No Entry Fee'}
                  date={tournament.createdAt ? new Date(tournament.createdAt).toLocaleDateString() : 'Today'}
                  status={tournament.status}
                  onAction={() => handleStartTournament(tournament.id)}
                />
              ))}
              
              {/* Fill with demo tournaments if not enough saved ones */}
              {activeSavedTournaments.length < 2 && 
                upcomingTournaments.slice(0, 2 - activeSavedTournaments.length).map((tournament) => (
                  <TournamentCard 
                    key={tournament.id}
                    id={tournament.id}
                    title={tournament.title}
                    players={tournament.players}
                    maxPlayers={tournament.maxPlayers}
                    gameType={tournament.gameType}
                    prize={tournament.prize}
                    date={tournament.date}
                    status={tournament.status}
                    onAction={() => {
                      if (tournament.status === 'live') {
                        navigate(`/tournament/${tournament.id}/live`);
                      } else {
                        navigate(`/tournament/${tournament.id}/lobby`);
                      }
                    }}
                  />
                ))
              }
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <Leaderboard />
          </div>
        )}

        {/* Total Winnings Display */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-white shadow-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full">
                <DollarSign className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-green-100 mb-2">Total Winnings</h3>
            <div className="text-7xl md:text-8xl font-bold mb-4">$234</div>
            <p className="text-xl text-green-100 mb-6">
              Across 28 rounds and 5 tournaments
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">3</div>
                <div className="text-green-100">Active Tournaments</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">12</div>
                <div className="text-green-100">Private Tournaments</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold">28</div>
                <div className="text-green-100">Rounds Played</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Create your first private tournament or join a live game with our comprehensive golf management tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleCreateTournament}
                className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Create Tournament
              </button>
              <button 
                onClick={handlePlayNow}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
              >
                Play Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Tournament Modal */}
      <CreateTournamentModal 
        isOpen={isCreateTournamentModalOpen} 
        onClose={handleCloseCreateTournamentModal} 
      />

      {/* Play Now Modal */}
      <PlayNowModal 
        isOpen={isPlayNowModalOpen} 
        onClose={handleClosePlayNowModal} 
      />
    </div>
  );
};

export default Index;
