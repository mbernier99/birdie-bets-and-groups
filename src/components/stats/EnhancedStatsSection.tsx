
import React from 'react';
import { DollarSign, Trophy, Target, Users, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserActivity } from '@/utils/userDetection';

interface EnhancedStatsSectionProps {
  userActivity: UserActivity;
}

const EnhancedStatsSection: React.FC<EnhancedStatsSectionProps> = ({ userActivity }) => {
  // Mock data for demo purposes - in real app this would come from user's actual data
  const stats = {
    totalWinnings: userActivity.totalWinnings || 234,
    winRate: 68,
    biggestWin: 85,
    totalMatches: 28,
    biggestRival: "John Smith",
    rivalRecord: "7-3",
    longestWinStreak: 5,
    favoriteGameType: "Match Play",
    totalPresses: 12,
    pressesWon: 8,
    averageBet: 25,
    holesInOne: 1
  };

  return (
    <div className="space-y-8">
      {/* Main Winnings Display */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-white shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full">
              <DollarSign className="h-12 w-12 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-green-100 mb-2">Total Winnings</h3>
          <div className="text-7xl md:text-8xl font-bold mb-4">${stats.totalWinnings}</div>
          <p className="text-xl text-green-100 mb-6">
            Across {stats.totalMatches} matches and {userActivity.totalTournaments} tournaments
          </p>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.winRate}%</div>
              <div className="text-green-100">Win Rate</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">${stats.biggestWin}</div>
              <div className="text-green-100">Biggest Win</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.longestWinStreak}</div>
              <div className="text-green-100">Win Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rivalry Card */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-red-500" />
              Biggest Rivalry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.biggestRival}</div>
            <div className="text-lg text-red-600 font-semibold mb-2">Record: {stats.rivalRecord}</div>
            <p className="text-sm text-gray-600">Your most frequent opponent with 10 total matches</p>
          </CardContent>
        </Card>

        {/* Game Preferences */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-500" />
              Game Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.favoriteGameType}</div>
            <div className="text-lg text-blue-600 font-semibold mb-2">Favorite Format</div>
            <p className="text-sm text-gray-600">Average bet: ${stats.averageBet} per game</p>
          </CardContent>
        </Card>

        {/* Press Statistics */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Press Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.pressesWon}/{stats.totalPresses}</div>
            <div className="text-lg text-yellow-600 font-semibold mb-2">Presses Won</div>
            <p className="text-sm text-gray-600">{Math.round((stats.pressesWon / stats.totalPresses) * 100)}% success rate on side bets</p>
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Recent Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">Hot Streak</div>
            <div className="text-lg text-green-600 font-semibold mb-2">Last 5 Games: 4-1</div>
            <p className="text-sm text-gray-600">You're playing your best golf lately!</p>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-purple-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.holesInOne}</div>
            <div className="text-lg text-purple-600 font-semibold mb-2">Holes-in-One</div>
            <p className="text-sm text-gray-600">Plus 3 closest-to-pin victories</p>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-emerald-500" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">+$127</div>
            <div className="text-lg text-emerald-600 font-semibold mb-2">Net Winnings</div>
            <p className="text-sm text-gray-600">From 8 rounds played in December</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedStatsSection;
