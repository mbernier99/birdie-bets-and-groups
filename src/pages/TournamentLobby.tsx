
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, Trophy, Play, Settings, UserPlus, Share2 } from 'lucide-react';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';

const TournamentLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Load tournament data from localStorage
    const savedTournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    const foundTournament = savedTournaments.find((t: any) => t.id === id);
    
    if (foundTournament) {
      setTournament(foundTournament);
    } else {
      // Demo tournament data if not found in saved tournaments
      setTournament({
        id: id,
        basicInfo: { name: 'Sunday Singles Championship', maxPlayers: 16 },
        gameType: { type: 'Match Play' },
        wagering: { entryFee: 15, currency: '$' },
        players: [
          { id: '1', name: 'John Doe', handicap: 12 },
          { id: '2', name: 'Jane Smith', handicap: 8 },
          { id: '3', name: 'Mike Johnson', handicap: 15 }
        ],
        status: 'lobby'
      });
    }

    // Countdown timer (demo)
    const interval = setInterval(() => {
      setTimeLeft('5:23');
    }, 1000);

    return () => clearInterval(interval);
  }, [id]);

  const handleStartTournament = () => {
    if (tournament) {
      // Update tournament status to live
      const savedTournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
      const updatedTournaments = savedTournaments.map((t: any) => 
        t.id === tournament.id ? { ...t, status: 'live' } : t
      );
      localStorage.setItem('savedTournaments', JSON.stringify(updatedTournaments));
      
      navigate(`/tournament/${id}/live`);
    }
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tournament Header */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.basicInfo.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{tournament.players.length}/{tournament.basicInfo.maxPlayers} Players</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>{tournament.gameType.type}</span>
                </span>
                {tournament.wagering.entryFee > 0 && (
                  <span className="flex items-center space-x-1">
                    <span>{tournament.wagering.currency}{tournament.wagering.entryFee} Entry</span>
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Start Timer */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">Tournament starts in:</span>
              </div>
              <span className="text-2xl font-bold text-emerald-600">{timeLeft}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartTournament}
              className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>Start Tournament</span>
            </button>
            <button className="flex-1 sm:flex-none border border-emerald-200 text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Invite Players</span>
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Players ({tournament.players.length})</h2>
          <div className="space-y-3">
            {tournament.players.map((player: any, index: number) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-medium">
                      {player.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-600">Handicap: {player.handicap}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                    Ready
                  </span>
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: tournament.basicInfo.maxPlayers - tournament.players.length }).map((_, index) => (
              <div key={`empty-${index}`} className="flex items-center justify-between p-3 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-gray-500">Waiting for player...</p>
                </div>
                <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                  Invite
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default TournamentLobby;
