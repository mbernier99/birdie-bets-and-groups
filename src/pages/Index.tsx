import React, { useState } from 'react';
import { Trophy, Users, Target, TrendingUp, Plus, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import TournamentCard from '../components/TournamentCard';
import Leaderboard from '../components/Leaderboard';

const Index = () => {
  const [activeTab, setActiveTab] = useState('tournaments');

  const quickStats = [
    { label: 'Active Tournaments', value: '3', icon: Trophy, color: 'text-emerald-600' },
    { label: 'Groups Joined', value: '5', icon: Users, color: 'text-blue-600' },
    { label: 'Total Winnings', value: '$234', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Rounds Played', value: '28', icon: Target, color: 'text-purple-600' }
  ];

  const upcomingTournaments = [
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/9cbc607b-7ea2-46a9-b4e9-7f80ffa620dc.png" 
                alt="Suntory Cup" 
                className="h-24 w-24"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-emerald-200">Suntory Cup</span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-8 max-w-3xl mx-auto">
              Manage tournaments, track bets, and compete with friends in the ultimate golf wagering platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Tournament</span>
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors flex items-center justify-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Join Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-50">
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tournaments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'tournaments'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4" />
                  <span>Active Tournaments</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Live Leaderboard</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'tournaments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Tournaments</h2>
              <button className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                <span>View all</span>
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTournaments.map((tournament, index) => (
                <TournamentCard key={index} {...tournament} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div>
            <Leaderboard />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Create your first tournament, join a group, or start tracking your games with our comprehensive golf management tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                Create Tournament
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors">
                Browse Groups
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
