
import React from 'react';
import { Trophy, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: string;
  earnings: string;
  holes: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Mike Johnson', score: '-3', earnings: '+$45', holes: 'F' },
  { rank: 2, name: 'Sarah Chen', score: '-1', earnings: '+$25', holes: 'F' },
  { rank: 3, name: 'David Smith', score: 'E', earnings: '+$10', holes: 'F' },
  { rank: 4, name: 'Lisa Rodriguez', score: '+2', earnings: '-$15', holes: '17' },
  { rank: 5, name: 'Tom Wilson', score: '+3', earnings: '-$25', holes: '16' }
];

const Leaderboard = () => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-gray-600 font-medium">{rank}</span>;
  };

  const getScoreColor = (score: string) => {
    if (score.startsWith('-')) return 'text-green-600';
    if (score.startsWith('+')) return 'text-red-600';
    return 'text-gray-900';
  };

  const getEarningsColor = (earnings: string) => {
    if (earnings.startsWith('+')) return 'text-green-600';
    if (earnings.startsWith('-')) return 'text-red-600';
    return 'text-gray-900';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">Live Leaderboard</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">Sunday Singles Championship</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thru</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockLeaderboard.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-bold ${getScoreColor(entry.score)}`}>{entry.score}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getEarningsColor(entry.earnings)}`}>{entry.earnings}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{entry.holes}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
