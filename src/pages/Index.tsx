
import React, { useState, useEffect, memo, useCallback } from 'react';
import { Trophy, Plus, Calendar, Play, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTournaments } from '@/hooks/useTournaments';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from '../components/Navbar';
import MobileNavigation from '../components/MobileNavigation';
import TournamentCard from '../components/TournamentCard';
import Leaderboard from '../components/Leaderboard';
import CreateTournamentModal from '../components/CreateTournamentModal';
import PlayNowModal from '../components/PlayNowModal';
import WelcomeTutorialSection from '../components/welcome/WelcomeTutorialSection';
import EnhancedStatsSection from '../components/stats/EnhancedStatsSection';
import FeatureShowcase from '../components/marketing/FeatureShowcase';
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
  const isMobile = useIsMobile();

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

  // Debug logging
  console.log('Index page rendered for user:', user?.email || 'not authenticated');

  return (
    <div className={`min-h-screen ${isMobile ? '' : 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50'} pb-20 md:pb-0`}>
      {!isMobile && <Navbar />}
      
      {/* Background Image Section for Mobile */}
      <div className={`${isMobile ? 'bg-cover bg-center bg-no-repeat min-h-screen absolute inset-0' : ''}`} 
           style={isMobile ? { backgroundImage: 'url(/lovable-uploads/6673b7a5-3ea3-4a09-a631-48b032cc2620.png)' } : {}}>
      </div>
      
      {/* Content Wrapper */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <div className={`mx-4 sm:mx-6 lg:mx-8 ${isMobile ? 'pt-16' : 'mt-20'}`}>
          <div className={`${isMobile ? '' : 'bg-gradient-to-r from-emerald-600 to-emerald-700'} ${isMobile ? 'text-white' : 'text-white'} relative overflow-hidden ${isMobile ? '' : 'rounded-2xl'}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
              <div className="text-center">
                {/* Prominent Puffin Logo */}
                <div className="flex justify-center mb-8">
                  <img src="/lovable-uploads/3bf1d3f9-6ad1-4c1d-8602-6010d0f7e7bd.png" alt="Puffin Logo" className="h-24 w-24 object-contain" />
                </div>
                
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black font-orbitron mb-8 tracking-wider w-full break-words bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                  BetLoopr
                </h1>
                
                <p className={`text-xl md:text-2xl ${isMobile ? 'text-white' : 'text-emerald-100'} mb-12 max-w-3xl mx-auto relative z-20`}>
                  {user ? 'Manage Golf tournaments, wagers, side bets and more' : 'Live Bets, Tournament & Golf Game Management'}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20 mt-16">
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
                    <>
                      <button onClick={handleCreateTournament} className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>Start Tournament</span>
                      </button>
                      <button onClick={() => navigate('/bet')} className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2">
                        <Play className="h-5 w-5" />
                        <span>Place Bet</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Showcase - Always visible */}
        <FeatureShowcase />

        {/* Authenticated User Content - Upper Sections */}
        {user && (
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
          </div>
        )}
      </div>
      
      {/* Lower Content Sections Outside Background */}
      {user ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <HowItWorksSection />
          <FAQSection />
        </>
      )}

      {/* Modals */}
      <CreateTournamentModal isOpen={isCreateTournamentModalOpen} onClose={handleCloseCreateTournamentModal} />
      <PlayNowModal isOpen={isPlayNowModalOpen} onClose={handleClosePlayNowModal} />
      
      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation />}
    </div>
  );
});

export default Index;
