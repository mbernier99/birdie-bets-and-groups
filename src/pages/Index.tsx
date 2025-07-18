import React, { useState, useEffect, memo, useCallback } from 'react';
import { Trophy, Plus, Target, Play, LogIn, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTournaments } from '@/hooks/useTournaments';
import Navbar from '../components/Navbar';
import CreateTournamentModal from '../components/CreateTournamentModal';
import QuickMatchModal from '../components/QuickMatchModal';
import { isFirstTimeUser, detectUserActivity } from '../utils/userDetection';

const Index = memo(() => {
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [isQuickMatchModalOpen, setIsQuickMatchModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [userActivity, setUserActivity] = useState({
    hasPlayedTournaments: false,
    totalTournaments: 0,
    totalWinnings: 0,
    lastActivity: null
  });

  const { user } = useAuth();
  const { tournaments, loading } = useTournaments();
  const navigate = useNavigate();

  useEffect(() => {
    const newUser = isFirstTimeUser();
    const activity = detectUserActivity();
    setIsNewUser(newUser);
    setUserActivity(activity);
  }, []);

  const handleQuickMatch = useCallback(() => {
    setIsQuickMatchModalOpen(true);
  }, []);

  const handleInvitePlayer = useCallback(() => {
    // For now, open the quick match modal
    setIsQuickMatchModalOpen(true);
  }, []);

  const handleCloseQuickMatchModal = () => {
    setIsQuickMatchModalOpen(false);
  };

  const quickStats = {
    activeBets: 3,
    todayWinnings: 45,
    playersOnline: 12
  };

  const quickMatchTypes = [
    {
      id: 'long-drive',
      title: 'Long Drive Challenge',
      description: 'Compete for the longest drive',
      icon: <Target className="h-8 w-8" />,
      color: 'bg-blue-500',
      stakes: ['$5', '$10', '$20']
    },
    {
      id: 'closest-pin',
      title: 'Closest to Pin',
      description: 'Most accurate shot wins',
      icon: <Trophy className="h-8 w-8" />,
      color: 'bg-green-500',
      stakes: ['$5', '$10', '$20']
    },
    {
      id: 'head-to-head',
      title: 'Head-to-Head Match',
      description: 'Complete hole comparison',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-purple-500',
      stakes: ['$10', '$25', '$50']
    },
    {
      id: 'custom-bet',
      title: 'Custom Side Bet',
      description: 'Create your own challenge',
      icon: <DollarSign className="h-8 w-8" />,
      color: 'bg-orange-500',
      stakes: ['Custom']
    }
  ];

  const activeBets = [
    {
      id: '1',
      opponent: 'Mike Johnson',
      type: 'Long Drive',
      stake: '$10',
      status: 'active',
      hole: 7
    },
    {
      id: '2',
      opponent: 'Sarah Chen',
      type: 'Closest to Pin',
      stake: '$15',
      status: 'pending',
      hole: 3
    },
    {
      id: '3',
      opponent: 'Alex Rivera',
      type: 'Head-to-Head',
      stake: '$25',
      status: 'active',
      hole: 12
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <Navbar />
      
      {/* Hero Section - Redesigned for Play Now Focus */}
      <div className="mx-4 sm:mx-6 lg:mx-8 mt-8">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white relative overflow-hidden rounded-2xl">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
            <div className="text-center">
              {/* Large background logo - constrained within container */}
              <div className="absolute inset-4 flex items-center justify-center opacity-30 pointer-events-none">
                <img src="/lovable-uploads/fc297cde-a9d2-4fb0-acf6-d28aacc56592.png" alt="Suntory Cup Background" className="max-h-72 max-w-72 object-contain" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black font-orbitron mb-6 relative z-20 tracking-wider w-full break-words">
                BetLoopr
              </h1>
              
              <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto relative z-20">
                Challenge players, track shots, win money
              </p>

              {/* Quick Stats */}
              {user && (
                <div className="flex justify-center space-x-6 mb-8 text-sm relative z-20">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{quickStats.activeBets}</div>
                    <div className="text-emerald-200">Active Bets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${quickStats.todayWinnings}</div>
                    <div className="text-emerald-200">Today's Winnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{quickStats.playersOnline}</div>
                    <div className="text-emerald-200">Players Online</div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
                {user ? (
                  <>
                    <button onClick={handleQuickMatch} className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2 text-lg">
                      <Play className="h-6 w-6" />
                      <span>Play Now</span>
                    </button>
                    <button onClick={handleInvitePlayer} className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors flex items-center justify-center space-x-2 text-lg">
                      <Users className="h-6 w-6" />
                      <span>Invite Player</span>
                    </button>
                  </>
                ) : (
                  <Button onClick={() => navigate('/auth')} className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg h-auto">
                    <LogIn className="h-5 w-5 mr-2" />
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          <>
            {/* Quick Match Cards */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Match</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickMatchTypes.map((match) => (
                  <Card key={match.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleQuickMatch}>
                    <CardHeader className="pb-3">
                      <div className={`${match.color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3`}>
                        {match.icon}
                      </div>
                      <CardTitle className="text-lg">{match.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3">{match.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {match.stakes.map((stake) => (
                          <Badge key={stake} variant="outline" className="text-xs">
                            {stake}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Active Bets */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Active Bets</h2>
                <Button onClick={() => navigate('/tracker')} variant="outline" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Shot Tracker</span>
                </Button>
              </div>
              {activeBets.length > 0 ? (
                <div className="space-y-3">
                  {activeBets.map((bet) => (
                    <Card key={bet.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div>
                              <h4 className="font-medium">vs {bet.opponent}</h4>
                              <p className="text-sm text-gray-600">{bet.type} • Hole {bet.hole}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">{bet.stake}</div>
                            <Badge variant={bet.status === 'active' ? 'default' : 'secondary'}>
                              {bet.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Bets</h3>
                    <p className="text-gray-600 mb-4">Challenge a player to get started</p>
                    <Button onClick={handleQuickMatch} className="bg-emerald-600 hover:bg-emerald-700">
                      Start First Bet
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Daily Leaderboard */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Winners</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: 'Alex Rivera', winnings: 125, bets: 8 },
                      { name: 'Sarah Chen', winnings: 85, bets: 5 },
                      { name: 'Mike Johnson', winnings: 65, bets: 4 }
                    ].map((player, index) => (
                      <div key={player.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-600">{player.bets} bets won</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">+${player.winnings}</div>
                          <div className="text-sm text-gray-500">today</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* Guest Content */
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Winning?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Challenge friends to golf side bets, track your shots with GPS, and win money on every hole.
            </p>
            <Button onClick={() => navigate('/auth')} size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 text-lg h-auto">
              <LogIn className="h-5 w-5 mr-2" />
              Join Now - It's Free
            </Button>
          </div>
        )}
      </div>

      {/* Create Tournament Modal - Keep for advanced users */}
      <CreateTournamentModal isOpen={isCreateTournamentModalOpen} onClose={() => setIsCreateTournamentModalOpen(false)} />

      {/* Quick Match Modal - New simplified flow */}
      <QuickMatchModal isOpen={isQuickMatchModalOpen} onClose={handleCloseQuickMatchModal} />
    </div>
  );
});

export default Index;
