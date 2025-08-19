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
      className="relative h-64 bg-cover bg-center bg-no-repeat rounded-2xl mx-4 mt-4 overflow-hidden"
      style={{ backgroundImage: `url(/lovable-uploads/d4bc4fe8-a6dd-4132-a7d8-c6895b4fe331.png)` }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
        <img 
          src="/lovable-uploads/8a170a6f-1cbf-4b56-88ed-9b83f0b5c59d.png" 
          alt="BetLoopr" 
          className="w-16 h-16 mb-3"
        />
        <h1 className="text-3xl font-bold mb-2">BetLoopr</h1>
        <p className="text-center text-sm opacity-90 mb-4">
          {firstTime ? 'Welcome to golf betting' : 'Ready for your next round?'}
        </p>
        {firstTime && (
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white text-primary hover:bg-white/90"
          >
            <Plus className="h-4 w-4 mr-2" />
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
        <Navbar />
        <div className="pt-16 px-4">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Welcome to BetLoopr</h1>
            <p className="text-muted-foreground mb-6">Sign in to start playing</p>
            <Button onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {renderHeroSection()}
      
      <div className="pt-6 space-y-6">
        {firstTime ? renderFirstTimeUser() : (
          <>
            {renderActiveTournaments()}
            {renderQuickActions()}
          </>
        )}
      </div>

      <CreateTournamentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;