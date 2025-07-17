
import React, { memo } from 'react';
import { Trophy, Users, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TournamentCardProps {
  id: string;
  title: string;
  players: number;
  maxPlayers: number;
  gameType: string;
  prize: string;
  date: string;
  status: 'upcoming' | 'live' | 'created' | 'completed';
  onAction?: () => void;
}

const TournamentCard: React.FC<TournamentCardProps> = memo(({
  id,
  title,
  players,
  maxPlayers,
  gameType,
  prize,
  date,
  status,
  onAction
}) => {
  const navigate = useNavigate();
  
  const getStatusColor = () => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
      case 'created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionButtonText = () => {
    switch (status) {
      case 'created':
        return 'Enter Lobby';
      case 'upcoming':
        return 'Join Tournament';
      case 'live':
        return 'View Live';
      case 'completed':
        return 'View Results';
      default:
        return 'View Details';
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      // Default navigation based on status
      if (status === 'created' || status === 'upcoming') {
        navigate(`/tournament/${id}/lobby`);
      } else if (status === 'live') {
        navigate(`/tournament/${id}/live`);
      } else {
        // For completed tournaments or any other status
        navigate(`/tournament/${id}/lobby`);
      }
    }
  };

  const handleDetails = () => {
    navigate(`/tournament/${id}/lobby`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span className="text-sm">{players}/{maxPlayers} Players</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Trophy className="h-4 w-4" />
            <span className="text-sm">{gameType}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{date}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-emerald-600">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">{prize}</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={handleAction}
            className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            {getActionButtonText()}
          </button>
          <button 
            onClick={handleDetails}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
});

export default TournamentCard;
