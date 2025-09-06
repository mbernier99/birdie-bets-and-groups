import React, { useState } from 'react';
import { Zap, Plus, Target, TrendingUp, Clock, CheckCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTournaments } from '@/hooks/useTournaments';
import { usePress } from '@/hooks/usePress';
import Navbar from '@/components/Navbar';

const BetPage = () => {
  const [selectedTab, setSelectedTab] = useState('active');
  
  const { user } = useAuth();
  const { tournaments } = useTournaments();
  const { pressBets } = usePress();
  const navigate = useNavigate();

  // Get active tournaments for tournament-based betting
  const activeTournaments = tournaments.filter(t => 
    t.status === 'lobby' || t.status === 'live'
  );

  const activeBets = pressBets.filter(bet => bet.status === 'pending');
  const completedBets = pressBets.filter(bet => bet.status === 'completed');

  const renderQuickBetActions = () => (
    <div className="space-y-3">
      <Button 
        onClick={() => navigate('/quick-bet')}
        className="w-full justify-start gap-3 h-auto py-4"
      >
        <Zap className="h-5 w-5" />
        <div className="text-left">
          <div className="font-medium">Create Quick Bet Room</div>
          <div className="text-xs opacity-75">Start instant CTP or Long Drive bet</div>
        </div>
      </Button>
      
      <div className="text-center py-2">
        <div className="text-sm font-medium text-muted-foreground">Or enter room code to join:</div>
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Room code (e.g., ABC123)"
          className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const code = e.currentTarget.value.trim().toUpperCase();
              if (code.length >= 4) {
                navigate(`/quick-bet/${code}`);
              }
            }
          }}
        />
        <Button 
          variant="outline"
          onClick={(e) => {
            const input = e.currentTarget.parentElement?.querySelector('input');
            const code = input?.value.trim().toUpperCase();
            if (code && code.length >= 4) {
              navigate(`/quick-bet/${code}`);
            }
          }}
        >
          Join
        </Button>
      </div>
    </div>
  );

  const renderActiveBets = () => (
    <div className="space-y-4">
      {activeBets.length > 0 ? (
        activeBets.map(bet => (
          <Card key={bet.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{bet.bet_type}</h4>
                  <p className="text-sm text-muted-foreground">{bet.description}</p>
                  {bet.hole_number && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Hole {bet.hole_number}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-primary">
                  ${bet.amount}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    // Navigate to betting room for this bet  
                    if (bet.bet_type === 'closest-to-pin' || bet.bet_type === 'longest-drive') {
                      navigate(`/bet-room/${bet.id}`);
                    } else {
                      navigate(`/tournament/${bet.tournament_id}/live`);
                    }
                  }}
                >
                  Join Bet
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Bets</h3>
            <p className="text-muted-foreground mb-4">Start a new bet to get the action going</p>
            <Button onClick={() => navigate('/quick-bet')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Bet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCompletedBets = () => (
    <div className="space-y-4">
      {completedBets.length > 0 ? (
        completedBets.map(bet => (
          <Card key={bet.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium">{bet.bet_type}</h4>
                  <p className="text-sm text-muted-foreground">{bet.description}</p>
                  {bet.hole_number && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Hole {bet.hole_number}
                    </p>
                  )}
                </div>
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Complete
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">
                  ${bet.amount}
                </div>
                <div className="text-sm text-muted-foreground">
                  {bet.winner_id === user?.id ? (
                    <span className="text-green-600 font-medium">Won</span>
                  ) : (
                    <span className="text-red-600 font-medium">Lost</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Completed Bets</h3>
            <p className="text-muted-foreground">Your betting history will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTournamentBetting = () => (
    <div className="space-y-4">
      {activeTournaments.length > 0 ? (
        activeTournaments.map(tournament => (
          <Card key={tournament.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{tournament.name}</CardTitle>
                  <CardDescription>{tournament.game_type}</CardDescription>
                </div>
                <Badge variant={tournament.status === 'live' ? 'default' : 'secondary'}>
                  {tournament.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate(`/tournament/${tournament.id}/live`)}
                >
                  <Users className="h-4 w-4" />
                  Press with Players
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => navigate(`/tournament/${tournament.id}/live`)}
                >
                  <Target className="h-4 w-4" />
                  Location-based Bets
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Tournaments</h3>
            <p className="text-muted-foreground mb-4">
              Join a tournament to enable advanced betting features
            </p>
            <Button onClick={() => navigate('/tournaments')}>
              Browse Tournaments
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="pt-20 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Betting</h1>
          <Button size="sm" onClick={() => navigate('/quick-bet')}>
            <Plus className="h-4 w-4 mr-2" />
            New Bet
          </Button>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Start betting instantly</CardDescription>
          </CardHeader>
          <CardContent>
            {renderQuickBetActions()}
          </CardContent>
        </Card>

        {/* Bet Management Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="tournament">Tournament</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {renderActiveBets()}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {renderCompletedBets()}
          </TabsContent>
          
          <TabsContent value="tournament" className="space-y-4">
            {renderTournamentBetting()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BetPage;