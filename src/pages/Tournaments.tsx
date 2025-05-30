import React, { useState } from 'react';
import { Plus, Calendar, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import TournamentCard from '../components/TournamentCard';
import CreateTournamentModal from '../components/CreateTournamentModal';

const Tournaments = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  console.log('Tournaments component rendered, modal state:', isCreateModalOpen);

  const handleCreateTournament = () => {
    console.log('Create tournament button clicked!');
    setIsCreateModalOpen(true);
    console.log('Modal state set to true');
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsCreateModalOpen(false);
  };

  const mockTournaments = [
    {
      id: 'tournament-1',
      title: 'Sunday Singles Championship',
      players: 12,
      maxPlayers: 16,
      gameType: 'Match Play',
      prize: '$240 Pool',
      date: 'Today 8:00 AM',
      status: 'live' as const
    },
    {
      id: 'tournament-2',
      title: 'Weekend Warriors Best Ball',
      players: 8,
      maxPlayers: 12,
      gameType: '2-Man Best Ball',
      prize: '$180 Pool',
      date: 'Tomorrow 9:30 AM',
      status: 'upcoming' as const
    },
    {
      id: 'tournament-3',
      title: 'Wolf Pack Challenge',
      players: 4,
      maxPlayers: 4,
      gameType: 'Wolf',
      prize: '$100 Pool',
      date: 'Yesterday',
      status: 'completed' as const
    },
    {
      id: 'tournament-4',
      title: 'Nassau Night',
      players: 6,
      maxPlayers: 8,
      gameType: 'Nassau',
      prize: '$120 Pool',
      date: 'Friday 4:00 PM',
      status: 'upcoming' as const
    }
  ];

  const filteredTournaments = filterStatus === 'all' 
    ? mockTournaments 
    : mockTournaments.filter(t => t.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tournaments</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Join or create golf tournaments with your groups</p>
          </div>
          <button 
            onClick={handleCreateTournament}
            className="w-full sm:w-auto bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Create Tournament</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            <span className="text-sm text-gray-700">Filter by status:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['all', 'live', 'upcoming', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-emerald-50 border border-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} {...tournament} />
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">No tournaments match your current filter.</p>
            <button
              onClick={() => setFilterStatus('all')}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm sm:text-base"
            >
              Show all tournaments
            </button>
          </div>
        )}
      </div>

      <CreateTournamentModal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default Tournaments;
