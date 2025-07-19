
import React, { useState, useEffect, memo, useCallback } from 'react';
import { Trophy, Plus, Calendar, Play, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTournaments } from '@/hooks/useTournaments';
import Navbar from '../components/Navbar';
import TournamentCard from '../components/TournamentCard';
import Leaderboard from '../components/Leaderboard';
import CreateTournamentModal from '../components/CreateTournamentModal';
import PlayNowModal from '../components/PlayNowModal';
import WelcomeTutorialSection from '../components/welcome/WelcomeTutorialSection';
import EnhancedStatsSection from '../components/stats/EnhancedStatsSection';
import FeatureShowcase from '../components/marketing/FeatureShowcase';
import TestimonialSection from '../components/marketing/TestimonialSection';
import HowItWorksSection from '../components/marketing/HowItWorksSection';
import FAQSection from '../components/marketing/FAQSection';
import { isFirstTimeUser, detectUserActivity } from '../utils/userDetection';

const Index = memo(() => {
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [isPlayNowModalOpen, setIsPlayNowModalOpen] = useState(false);
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
    if (user) {
      const newUser = isFirstTimeUser();
      const activity = detectUserActivity();
      setIsNewUser(newUser);
      setUserActivity(activity);
    }
  }, [user]);

  const handleCreateTournament = useCallback(() => {
    setIsCreateTournamentModalOpen(true);
  }, []);

  const handlePlayNow = useCallback(() => {
    setIsPlayNowModalOpen(true);
  }, []);

  const handleCloseCreateTournamentModal = () => {
    setIsCreateTournamentModalOpen(false);
  };

  const handleClosePlayNowModal = () => {
    setIsPlayNowModalOpen(false);
  };

  const handleStartTournament = useCallback((tournamentId: string) => {
    navigate(`/tournament/${tournamentId}/lobby`);
  }, [navigate]);

  const handleViewRules = useCallback(() => {
    navigate('/rules');
  }, [navigate]);

  // Filter active tournaments for authenticated users
  const activeTournaments = user ? tournaments.filter(t => t.status === 'draft' || t.status === 'lobby' || t.status === 'live') : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <Navbar />
      
      {/* Hero Section */}
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
                {user ? 'Manage Golf tournaments, wagers, side bets and more' : 'The Complete Golf Tournament & Betting Management Platform'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
                {user ? (
                  <>
                    <button onClick={handleCreateTournament} className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Create Tournament</span>
                    </button>
                    <button onClick={handlePlayNow} className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors flex items-center justify-center space-x-2">
                      <Play className="h-5 w-5" />
                      <span>Play Now</span>
                    </button>
                  </>
                ) : (
                  <Button onClick={() => navigate('/auth')} className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg h-auto">
                    <LogIn className="h-5 w-5 mr-2" />
                    Get Started Free
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authenticated User Content */}
      {user ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Active Tournaments Prompt */}
          {activeTournaments.filter(t => t.status === 'draft').length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Ready to Start Your Tournaments?</h3>
              <div className="space-y-3">
                {activeTournaments.filter(t => t.status === 'draft').map(tournament => (
                  <div key={tournament.id} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{tournament.name}</h4>
                      <p className="text-emerald-100 text-sm">
                        Max {tournament.max_players} players • {tournament.game_type}
                      </p>
                    </div>
                    <button onClick={() => handleStartTournament(tournament.id)} className="bg-white text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center space-x-2 font-medium">
                      <Play className="h-4 w-4" />
                      <span>Enter Lobby</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tournaments Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Tournaments</h2>
              <Button onClick={() => navigate('/tournaments')} variant="outline" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>View All</span>
              </Button>
            </div>
            
            {!loading && activeTournaments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTournaments.slice(0, 2).map(tournament => (
                  <TournamentCard 
                    key={tournament.id}
                    id={tournament.id}
                    title={tournament.name}
                    players={0} // TODO: Get participant count
                    maxPlayers={tournament.max_players || 16}
                    gameType={tournament.game_type}
                    prize={tournament.entry_fee > 0 ? `$${tournament.prize_pool} Pool` : 'No Entry Fee'}
                    date={new Date(tournament.created_at).toLocaleDateString()}
                    status={tournament.status === 'draft' ? 'upcoming' : tournament.status as any}
                    onAction={() => handleStartTournament(tournament.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Tournaments</h3>
                <p className="text-gray-600 mb-4">Create your first tournament to get started</p>
                <Button onClick={handleCreateTournament} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tournament
                </Button>
              </div>
            )}
          </div>

          {/* Live Leaderboard Section - Only show if user has active tournaments */}
          {activeTournaments.some(t => t.status === 'live') && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Leaderboard</h2>
              <Leaderboard />
            </div>
          )}

          {/* User-specific content */}
          {isNewUser ? (
            <WelcomeTutorialSection 
              onCreateTournament={handleCreateTournament} 
              onPlayNow={handlePlayNow} 
              onViewRules={handleViewRules} 
            />
          ) : (
            <EnhancedStatsSection userActivity={userActivity} />
          )}

          {/* Quick Action CTA */}
          <div className="mt-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Create your first tournament or join a live game with our comprehensive golf management tools.
            </p>
            <Button onClick={handleCreateTournament} size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg h-auto">
              <Plus className="h-5 w-5 mr-2" />
              Create Tournament
            </Button>
          </div>
        </div>
      ) : (
        /* Marketing Content for Non-Authenticated Users */
        <>
          <FeatureShowcase />
          <TestimonialSection />
          <HowItWorksSection />
          <FAQSection />
        </>
      )}

      {/* Modals */}
      <CreateTournamentModal isOpen={isCreateTournamentModalOpen} onClose={handleCloseCreateTournamentModal} />
      <PlayNowModal isOpen={isPlayNowModalOpen} onClose={handleClosePlayNowModal} />
    </div>
  );
});

export default Index;
