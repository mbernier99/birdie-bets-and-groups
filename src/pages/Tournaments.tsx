
import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Trophy, DollarSign, Play, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';
import QuickMatchModal from '../components/QuickMatchModal';

const Tournaments = () => {
  const [isQuickMatchModalOpen, setIsQuickMatchModalOpen] = useState(false);
  const navigate = useNavigate();

  const activeBets = [
    {
      id: '1',
      opponent: 'Mike Johnson',
      type: 'Long Drive',
      stake: 10,
      status: 'active',
      hole: 7,
      course: 'Pebble Beach',
      startTime: '2 hours ago'
    },
    {
      id: '2',
      opponent: 'Sarah Chen',
      type: 'Closest to Pin',
      stake: 15,
      status: 'pending',
      hole: 3,
      course: 'Augusta National',
      startTime: '30 minutes ago'
    },
    {
      id: '3',
      opponent: 'Alex Rivera',
      type: 'Head-to-Head',
      stake: 25,
      status: 'won',
      hole: 18,
      course: 'St. Andrews',
      startTime: 'Yesterday'
    }
  ];

  const weeklyStats = {
    totalBets: 12,
    won: 8,
    lost: 3,
    pending: 1,
    winnings: 145,
    winRate: 67
  };

  const recentWinnings = [
    { date: 'Today', amount: 45, bets: 3 },
    { date: 'Yesterday', amount: 75, bets: 5 },
    { date: 'Dec 16', amount: 25, bets: 2 },
    { date: 'Dec 15', amount: 0, bets: 2 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBetTypeIcon = (type: string) => {
    switch (type) {
      case 'Long Drive': return <Target className="h-4 w-4" />;
      case 'Closest to Pin': return <Trophy className="h-4 w-4" />;
      case 'Head-to-Head': return <DollarSign className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bets</h1>
            <p className="text-gray-600">Track your side bets and winnings</p>
          </div>
          <Button
            onClick={() => setIsQuickMatchModalOpen(true)}
            className="mt-4 sm:mt-0 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Play className="h-5 w-5 mr-2" />
            New Challenge
          </Button>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">${weeklyStats.winnings}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{weeklyStats.winRate}%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{weeklyStats.won}</div>
              <div className="text-sm text-gray-600">Bets Won</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{weeklyStats.totalBets}</div>
              <div className="text-sm text-gray-600">Total Bets</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Bets */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Bets</h2>
          <div className="space-y-4">
            {activeBets.map((bet) => (
              <Card key={bet.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getBetTypeIcon(bet.type)}
                        <div>
                          <h4 className="font-medium">vs {bet.opponent}</h4>
                          <p className="text-sm text-gray-600">
                            {bet.type} • {bet.course} • Hole {bet.hole}
                          </p>
                          <p className="text-xs text-gray-500">{bet.startTime}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">${bet.stake}</div>
                      <Badge className={getStatusColor(bet.status)}>
                        {bet.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Winnings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Performance</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentWinnings.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{day.date}</div>
                        <div className="text-sm text-gray-600">{day.bets} bets</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${day.amount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {day.amount > 0 ? `+$${day.amount}` : '$0'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-3">Ready for Another Challenge?</h3>
          <p className="text-emerald-100 mb-4">
            Challenge a friend and start tracking your shots
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => setIsQuickMatchModalOpen(true)}
              className="bg-white text-emerald-600 hover:bg-emerald-50"
            >
              <Play className="h-4 w-4 mr-2" />
              Quick Challenge
            </Button>
            <Button 
              onClick={() => navigate('/tracker')}
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-emerald-600"
            >
              <Target className="h-4 w-4 mr-2" />
              Shot Tracker
            </Button>
          </div>
        </div>
      </div>

      <QuickMatchModal 
        isOpen={isQuickMatchModalOpen} 
        onClose={() => setIsQuickMatchModalOpen(false)} 
      />
      
      <MobileNavigation />
    </div>
  );
};

export default Tournaments;
