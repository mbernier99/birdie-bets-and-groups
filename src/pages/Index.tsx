
import React, { useState, useEffect, memo, useCallback } from 'react';
import { Trophy, Plus, Calendar, Play, LogIn, Mail, Smartphone, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTournaments } from '@/hooks/useTournaments';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
import TournamentTypesSection from '../components/marketing/TournamentTypesSection';
import BettingTypesSection from '../components/marketing/BettingTypesSection';
import Footer from '../components/Footer';
import { isFirstTimeUser, detectUserActivity } from '../utils/userDetection';

const Index = memo(() => {
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);
  const [isPlayNowModalOpen, setIsPlayNowModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [waitlistEmail, setWaitlistEmail] = useState('');
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
  const { toast } = useToast();

  useEffect(() => {
    const loadUserActivity = async () => {
      if (user) {
        const newUser = await isFirstTimeUser(user.id);
        const activity = await detectUserActivity(user.id);
        setIsNewUser(newUser);
        setUserActivity(activity);
      }
    };
    
    loadUserActivity();
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

  const handleWaitlistSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    try {
      const { error } = await supabase
        .from('waitlist_signups')
        .insert({
          email: waitlistEmail.toLowerCase().trim(),
          source: 'homepage',
          metadata: {
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        // Check for duplicate email error
        if (error.code === '23505') {
          toast({
            title: "Already on the list!",
            description: "This email is already registered for the waitlist.",
            variant: "default",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "You're on the list!",
          description: "We'll notify you when BetLoopr launches.",
        });
      }
      
      setWaitlistEmail('');
    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  }, [waitlistEmail, toast]);

  // Filter active tournaments for authenticated users
  const activeTournaments = user ? tournaments.filter(t => t.status === 'draft' || t.status === 'lobby' || t.status === 'live') : [];

  return (
    <div className={`min-h-screen ${isMobile ? 'bg-contain bg-top bg-no-repeat' : ''} pb-20 md:pb-0`}
         style={isMobile ? { backgroundImage: 'url(/lovable-uploads/mobile-hero-background.jpg)' } : {}}>
      <Navbar />
      
      {/* Content Wrapper */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <div className={`${isMobile ? 'mx-4 sm:mx-6 lg:mx-8' : 'flex items-center justify-center min-h-[80vh] bg-cover bg-center'}`}
             style={!isMobile ? { backgroundImage: 'url(/lovable-uploads/desktop-hero-background.jpg)' } : {}}>
          <div className={`${isMobile ? '' : 'max-w-5xl mx-auto'} text-white relative overflow-hidden ${isMobile ? '' : 'rounded-2xl'}`}>
            <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'pt-6 pb-12' : 'py-16'} relative z-10`}>
              <div className="text-center">
                {/* Logo */}
                <div className={`flex justify-center ${isMobile ? 'mb-6' : 'mb-8'}`}>
                  {isMobile ? (
                    <img src="/lovable-uploads/bandon-dunes-logo.png" alt="Bandon Dunes Logo" className="object-contain h-32 w-auto" />
                  ) : (
                    <img src="/lovable-uploads/loopr-logo-green.png" alt="LOOPR Logo" className="object-contain h-40 w-auto" />
                  )}
                </div>
                
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black font-orbitron mb-8 tracking-wider w-full break-words bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                  BetLoopr
                </h1>
                
                <p className={`text-lg md:text-2xl ${isMobile ? 'text-white font-bold bg-emerald-600/40 backdrop-blur-sm border border-emerald-400/30 px-5 py-3 rounded-full' : 'text-emerald-100'} mb-12 max-w-3xl mx-auto relative z-20`}>
                  {user ? 'Manage Golf tournaments, wagers, side bets and more' : 'Live Bets, Tournament & Golf Game Management'}
                </p>
                
                {/* CTAs */}
                <div className="flex flex-col items-center gap-6 relative z-20 mt-16">
                  {isMobile ? (
                    // Mobile: Show both buttons
                    <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                      <button onClick={handleCreateTournament} className="bg-white text-emerald-600 px-7 py-3 rounded-lg font-semibold text-[0.9rem] hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2">
                        <Plus className="h-[18px] w-[18px]" />
                        <span>Create Tournament</span>
                      </button>
                      <button onClick={handlePlayNow} className="border-2 border-white text-white px-7 py-3 rounded-lg font-semibold text-[0.9rem] hover:bg-white hover:text-emerald-600 transition-colors flex items-center justify-center space-x-2">
                        <Play className="h-[18px] w-[18px]" />
                        <span>Play Now</span>
                      </button>
                    </div>
                  ) : (
                    // Desktop/Tablet: Single CTA with feature pills
                    <>
                      <button onClick={handleCreateTournament} className="bg-white text-emerald-600 px-10 py-5 rounded-lg font-bold text-lg hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2 shadow-xl">
                        <Plus className="h-6 w-6" />
                        <span>Create Tournament</span>
                      </button>
                      
                      {/* Feature Pills */}
                      <div className="flex flex-wrap justify-center gap-4 mt-8 max-w-3xl">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
                          <Smartphone className="h-5 w-5 text-emerald-300" />
                          <span className="text-white font-semibold">Play on Mobile</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
                          <TrendingUp className="h-5 w-5 text-emerald-300" />
                          <span className="text-white font-semibold">Track Live Scores</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
                          <Users className="h-5 w-5 text-emerald-300" />
                          <span className="text-white font-semibold">Manage Wagers</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section - Desktop and Tablet Only */}
        {!isMobile && (
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-emerald-200 font-semibold text-sm uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black font-orbitron mb-6 text-white">
                Be First to Tee Off
              </h2>
              
              <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-2xl mx-auto">
                Join the waitlist and get exclusive early access to revolutionize your golf tournament experience
              </p>
              
              <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-600" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      required
                      className="pl-12 h-14 text-lg bg-white border-2 border-white focus:border-emerald-300 focus:ring-emerald-300"
                    />
                  </div>
                  <Button 
                    type="submit"
                    size="lg"
                    className="h-14 px-8 bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-lg whitespace-nowrap"
                  >
                    Join Waitlist
                  </Button>
                </div>
              </form>
              
              <p className="mt-6 text-emerald-200 text-sm">
                🎉 Over 500 golfers already waiting • No spam, ever
              </p>
            </div>
          </div>
        )}

        {/* Feature Showcase - Always visible */}
        <FeatureShowcase />
        
        {/* Tournament Types - Desktop and Tablet Only */}
        {!isMobile && (
          <>
            <TournamentTypesSection />
            <BettingTypesSection />
          </>
        )}

        {/* Mobile: Quick Access Tiles */}
        {isMobile && user && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 gap-4">
              {/* Game Formats Tile */}
              <button
                onClick={() => navigate('/game-formats')}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white text-left hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-xl">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Game Formats</h3>
                    <p className="text-emerald-100 text-sm">
                      Explore match play, stroke play, and more
                    </p>
                  </div>
                </div>
              </button>

              {/* Betting Tile */}
              <button
                onClick={() => navigate('/betting-info')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-left hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-xl">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Betting Guide</h3>
                    <p className="text-blue-100 text-sm">
                      Learn about presses, side bets, and more
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Desktop: Authenticated User Content */}
        {!isMobile && user && (
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
                      players={0}
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

            {/* Live Leaderboard Section */}
            {activeTournaments.some(t => t.status === 'live') && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Leaderboard</h2>
                <Leaderboard />
              </div>
            )}
          </div>
        )}
      </div>
      
        {/* Desktop: Lower Content Sections */}
      {!isMobile && user ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
          {isNewUser ? (
            <WelcomeTutorialSection 
              onCreateTournament={handleCreateTournament} 
              onPlayNow={handlePlayNow} 
              onViewRules={handleViewRules} 
            />
          ) : (
            <EnhancedStatsSection userActivity={userActivity} />
          )}

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
      ) : !isMobile && !user ? (
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
          <HowItWorksSection />
          <FAQSection />
        </div>
      ) : null}

      {/* Modals */}
      <CreateTournamentModal isOpen={isCreateTournamentModalOpen} onClose={handleCloseCreateTournamentModal} />
      <PlayNowModal isOpen={isPlayNowModalOpen} onClose={handleClosePlayNowModal} />
      
      {/* Footer */}
      {!isMobile && <Footer />}
      
      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation />}
    </div>
  );
});

export default Index;
