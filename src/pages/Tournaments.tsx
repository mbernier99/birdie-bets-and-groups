
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, DollarSign, Play, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';
import TournamentCard from '../components/TournamentCard';
import CreateTournamentModal from '../components/CreateTournamentModal';
import { useMockTournaments } from '../hooks/useMockTournaments';
import { MOCK_MODE } from '../utils/mockData';

const Tournaments = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { tournaments, loading } = useMockTournaments();
  const navigate = useNavigate();

  const handleCreateTournament = () => {
    console.log('Create Tournament button clicked');
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsCreateModalOpen(false);
  };

  const handleStartTournament = (tournamentId: string) => {
    console.log('Starting tournament:', tournamentId);
    navigate(`/tournament/${tournamentId}/lobby`);
  };

  // Demo tournaments for non-mock mode
  const demoTournaments = MOCK_MODE ? [] : [
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
    },
    {
      id: 'demo-3',
      title: 'Monthly Stroke Play',
      players: 6,
      maxPlayers: 8,
      gameType: 'Stroke Play',
      prize: '$120 Pool',
      date: 'Next Week',
      status: 'upcoming' as const
    }
  ];

  const formatTournamentForCard = (tournament: any) => ({
    id: tournament.id,
    title: tournament.name,
    players: 0, // Will be populated from participants
    maxPlayers: tournament.max_players || 16,
    gameType: tournament.game_type || 'Stroke Play',
    prize: tournament.entry_fee > 0 ? 
      `$${tournament.entry_fee * (tournament.max_players || 16)} Pool` : 
      'No Entry Fee',
    date: tournament.start_time ? 
      new Date(tournament.start_time).toLocaleDateString() : 
      'Date TBD',
    status: tournament.status === 'live' ? 'live' as const : 
            tournament.status === 'completed' ? 'completed' as const : 
            'upcoming' as const
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
        <MobileHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayTournaments = MOCK_MODE ? tournaments : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Groups {MOCK_MODE && <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">TEST MODE</span>}
            </h1>
            <p className="text-gray-600">
              {MOCK_MODE ? 'Testing with mock data - create and manage group tournaments' : 'Create tournaments and manage your golf groups'}
            </p>
          </div>
          <button
            onClick={handleCreateTournament}
            className="mt-4 sm:mt-0 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Tournament</span>
          </button>
        </div>

        {/* User Tournaments Section */}
        {displayTournaments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTournaments.map((tournament: any) => {
                const cardData = formatTournamentForCard(tournament);
                return (
                  <TournamentCard 
                    key={tournament.id}
                    id={tournament.id}
                    title={cardData.title}
                    players={cardData.players}
                    maxPlayers={cardData.maxPlayers}
                    gameType={cardData.gameType}
                    prize={cardData.prize}
                    date={cardData.date}
                    status={cardData.status}
                    onAction={() => handleStartTournament(tournament.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Demo Tournaments Section (only when not in mock mode) */}
        {!MOCK_MODE && demoTournaments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Public Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoTournaments.map((tournament) => (
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
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {displayTournaments.length === 0 && demoTournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {MOCK_MODE ? 'No Groups Yet' : 'No Groups Yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {MOCK_MODE ? 'Create your first group to test features' : 'Create your first group tournament to get started'}
            </p>
            <button
              onClick={handleCreateTournament}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Create Your First Group
            </button>
          </div>
        )}
      </div>

      <CreateTournamentModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseModal} 
      />
      
      <MobileNavigation />
    </div>
  );
};

export default Tournaments;
