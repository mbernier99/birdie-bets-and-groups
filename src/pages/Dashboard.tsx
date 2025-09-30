import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTournaments } from '@/hooks/useTournaments';
import { useTournamentParticipants } from '@/hooks/useTournamentParticipants';
import { detectUserActivity, isFirstTimeUser } from '@/utils/userDetection';
import CreateTournamentModal from '@/components/CreateTournamentModal';
import MobileTournamentSheet from '@/components/mobile/MobileTournamentSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileNavigation from '@/components/MobileNavigation';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
      const activity = detectUserActivity();
      setUserActivity(activity);
    }
  }, [user]);

  const activeTournaments = tournaments.filter(t => 
    t.status === 'draft' || t.status === 'lobby' || t.status === 'live'
  );

  const userTournaments = activeTournaments.slice(0, 2);
  const firstTime = isFirstTimeUser();

  const renderHeroSection = () => (
    <div 
      className="relative h-80 bg-cover bg-left bg-no-repeat mx-4 mt-4 overflow-hidden rounded-3xl"
      style={{ backgroundImage: `url(/lovable-uploads/3ab20564-3d62-40e5-b4e6-274d221087c8.png)` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/40" />
      <div className="relative h-full flex flex-col items-center justify-center text-white p-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-2xl">
          <img 
            src="/lovable-uploads/f82c6326-aff5-4eb3-bc9a-0009dd389ef8.png" 
            alt="Puffer Mascot" 
            className="w-20 h-20"
          />
        </div>
        <h1 className="text-4xl font-bold mb-3 tracking-tight text-center drop-shadow-lg">BetLoopr</h1>
        <p className="text-center text-lg font-medium text-white mb-6 max-w-sm leading-relaxed drop-shadow-md">
          {firstTime ? 'Welcome to competitive golf betting' : 'Ready for your next round?'}
        </p>
        {firstTime && (
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white/95 text-gray-900 hover:bg-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create First Tournament
          </Button>
        )}
      </div>
    </div>
  );

  const renderFirstTimeUser = () => (
    <div className="px-4 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Get Started</CardTitle>
          <CardDescription>Choose how you want to play</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full justify-start gap-3 h-auto py-4"
          >
            <Plus className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Create Tournament</div>
              <div className="text-xs opacity-75">Start a new tournament with friends</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => navigate('/tournaments')}
            variant="outline" 
            className="w-full justify-start gap-3 h-auto py-4"
          >
            <Trophy className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Join Tournament</div>
              <div className="text-xs opacity-75">Find and join existing tournaments</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => navigate('/quick-bet')}
            variant="outline" 
            className="w-full justify-start gap-3 h-auto py-4"
          >
            <TrendingUp className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Quick Bet</div>
              <div className="text-xs opacity-75">Make instant bets with friends</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveTournaments = () => (
    <div className="px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Active Tournaments</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/tournaments')}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {userTournaments.length > 0 ? (
            userTournaments.map(tournament => (
              <div 
                key={tournament.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{tournament.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {tournament.game_type} • Max {tournament.max_players} players
                    </p>
                  </div>
                  <Badge variant={tournament.status === 'live' ? 'default' : 'secondary'}>
                    {tournament.status}
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/tournament/${tournament.id}/lobby`)}
                >
                  {tournament.status === 'live' ? 'View Live' : 'Enter Lobby'}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">No active tournaments</p>
              <Button 
                size="sm" 
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Tournament
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderQuickActions = () => (
    <div className="px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => navigate('/quick-bet')}
          >
            <TrendingUp className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Quick Bet</div>
              <div className="text-xs text-muted-foreground">Start instant betting</div>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => navigate('/golf')}
          >
            <Trophy className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Golf Tracker</div>
              <div className="text-xs text-muted-foreground">Track your round</div>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => navigate('/tournaments')}
          >
            <Users className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Browse Tournaments</div>
              <div className="text-xs text-muted-foreground">Find tournaments to join</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {!isMobile && <Navbar />}
        <div className={isMobile ? "px-4" : "pt-16 px-4"}>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Welcome to BetLoopr</h1>
            <p className="text-muted-foreground mb-6">Sign in to start playing</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
        {isMobile && <MobileNavigation />}
      </div>
    );
  }

  // Debug logging
  console.log('Dashboard page rendered for user:', user?.email || 'not authenticated');

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <div className={isMobile ? "pb-20" : "pt-16"}>
        {renderHeroSection()}
        
        <div className="pt-6 space-y-6">
          {firstTime ? renderFirstTimeUser() : (
            <>
              {renderActiveTournaments()}
              {renderQuickActions()}
            </>
          )}
        </div>
      </div>

      {isMobile ? (
        <MobileTournamentSheet 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      ) : (
        <CreateTournamentModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}
      
      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Dashboard;