
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Users, DollarSign, Play, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';
import TournamentCard from '../components/TournamentCard';
import CreateTournamentModal from '../components/CreateTournamentModal';

const Tournaments = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savedTournaments, setSavedTournaments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved tournaments from localStorage
    const tournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    setSavedTournaments(tournaments);
    console.log('Tournaments component rendered, modal state:', isCreateModalOpen);
  }, [isCreateModalOpen]); // Refresh when modal closes

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

  // Demo tournaments
  const demoTournaments = [
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

  // Combine saved and demo tournaments
  const allTournaments = [...savedTournaments, ...demoTournaments];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tournaments</h1>
            <p className="text-gray-600">Create and manage your golf tournaments</p>
          </div>
          <button
            onClick={handleCreateTournament}
            className="mt-4 sm:mt-0 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Tournament</span>
          </button>
        </div>

        {/* Saved Tournaments Section */}
        {savedTournaments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Tournaments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTournaments.map((tournament: any) => (
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
            </div>
          </div>
        )}

        {/* Demo Tournaments Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {savedTournaments.length > 0 ? 'Public Tournaments' : 'Available Tournaments'}
          </h2>
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

        {/* Empty State */}
        {allTournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tournaments Yet</h3>
            <p className="text-gray-600 mb-6">Create your first tournament to get started</p>
            <button
              onClick={handleCreateTournament}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Create Your First Tournament
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
