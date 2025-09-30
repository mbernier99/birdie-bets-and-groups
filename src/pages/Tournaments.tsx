
import React, { useState } from 'react';
import { Plus, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';
import TournamentCard from '../components/TournamentCard';
import CreateTournamentModal from '../components/CreateTournamentModal';
import { useTournaments } from '../hooks/useTournaments';

const Tournaments = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { tournaments, loading } = useTournaments();
  const navigate = useNavigate();

  const handleCreateTournament = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleStartTournament = (tournamentId: string) => {
    navigate(`/tournament/${tournamentId}/lobby`);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Groups
            </h1>
            <p className="text-gray-600">
              Create tournaments and manage your golf groups
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
        {tournaments.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament: any) => {
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
        ) : (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Groups Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first group tournament to get started
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
