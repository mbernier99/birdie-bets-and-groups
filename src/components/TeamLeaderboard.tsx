
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users } from 'lucide-react';

interface TeamLeaderboardEntry {
  teamId: string;
  teamName: string;
  player1LastName: string;
  player2LastName: string;
  teamScore: number;
  matchStatus: 'active' | 'won' | 'lost' | 'halved';
  currentHole: number;
  holesWon: number;
  holesLost: number;
  holesHalved: number;
  marginOfVictory?: number;
}

interface TeamLeaderboardProps {
  teams: TeamLeaderboardEntry[];
  onTeamPress?: (teamId: string) => void;
}

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({ teams, onTeamPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'halved': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getMatchStatusText = (team: TeamLeaderboardEntry) => {
    if (team.matchStatus === 'halved') return 'Halved';
    if (team.matchStatus === 'won') {
      return team.marginOfVictory === 1 ? '1 UP' : `${team.marginOfVictory} UP`;
    }
    if (team.matchStatus === 'lost') {
      return team.marginOfVictory === 1 ? '1 DOWN' : `${team.marginOfVictory} DOWN`;
    }
    
    const diff = team.holesWon - team.holesLost;
    if (diff === 0) return 'All Square';
    return diff > 0 ? `${diff} UP` : `${Math.abs(diff)} DOWN`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">Team Leaderboard</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">2-Man Better Ball Match Play</p>
      </div>
      
      <div className="space-y-3 p-6">
        {teams.map((team, index) => (
          <div key={team.teamId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-600 text-white rounded-full text-sm font-bold">
                {index + 1}
              </div>
              
              <div>
                <div className="font-semibold text-gray-900 text-lg">
                  {team.player1LastName}/{team.player2LastName}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Hole {team.currentHole}</span>
                  <span>•</span>
                  <span>{team.teamScore > 0 ? `+${team.teamScore}` : team.teamScore}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <Badge className={getStatusColor(team.matchStatus)}>
                  {getMatchStatusText(team)}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  W:{team.holesWon} L:{team.holesLost} H:{team.holesHalved}
                </div>
              </div>
              
              {onTeamPress && (
                <button
                  onClick={() => onTeamPress(team.teamId)}
                  className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
                >
                  Press
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamLeaderboard;
