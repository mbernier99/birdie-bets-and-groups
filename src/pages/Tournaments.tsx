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
      title: 'Sunday Singles Championship',
      players: 12,
      maxPlayers: 16,
      gameType: 'Match Play',
      prize: '$240 Pool',
      date: 'Today 8:00 AM',
      status: 'live' as const
    },
    {
      title: 'Weekend Warriors Best Ball',
      players: 8,
      maxPlayers: 12,
      gameType: '2-Man Best Ball',
      prize: '$180 Pool',
      date: 'Tomorrow 9:30 AM',
      status: 'upcoming' as const
    },
    {
      title: 'Wolf Pack Challenge',
      players: 4,
      maxPlayers: 4,
      gameType: 'Wolf',
      prize: '$100 Pool',
      date: 'Yesterday',
      status: 'completed' as const
    },
    {
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
            <p className="text-gray-600 mt-2">Join or create golf tournaments with your groups</p>
          </div>
          <button 
            onClick={handleCreateTournament}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Tournament</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-700">Filter by status:</span>
          </div>
          
          <div className="flex space-x-2">
            {['all', 'live', 'upcoming', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament, index) => (
            <TournamentCard key={index} {...tournament} />
          ))}
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
            <p className="text-gray-600 mb-6">No tournaments match your current filter.</p>
            <button
              onClick={() => setFilterStatus('all')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
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
