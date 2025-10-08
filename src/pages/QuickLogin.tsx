import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Trophy, MapPin, Calendar } from 'lucide-react';

interface Player {
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  handicap: number;
  color: string;
}

const BANDON_PLAYERS: Player[] = [
  { email: 'leecrocker@gmail.com', firstName: 'Lee', lastName: 'Crocker', nickname: 'SussPro', handicap: 18, color: 'bg-blue-500' },
  { email: 'erwhalen@yahoo.com', firstName: 'Erin', lastName: 'Whalen', nickname: 'WhaleBone', handicap: 15, color: 'bg-green-500' },
  { email: 'drew.tornga@gmail.com', firstName: 'Drew', lastName: 'Tornga', nickname: 'Tornganese', handicap: 22, color: 'bg-orange-500' },
  { email: 'saldivarhector@hotmail.com', firstName: 'Hector', lastName: 'Saldivar', nickname: 'El Presidente', handicap: 13, color: 'bg-red-500' },
  { email: 'mbernier@gmail.com', firstName: 'Matt', lastName: 'Bernier', nickname: 'Berniator', handicap: 12, color: 'bg-purple-500' },
  { email: 'scogo82@hotmail.com', firstName: 'Scott', lastName: 'Gannon', nickname: 'JamBand', handicap: 17, color: 'bg-yellow-500' },
  { email: 'tom.connaghan@bandongolf.temp', firstName: 'Tom', lastName: 'Connaghan', nickname: 'ConMan', handicap: 14, color: 'bg-pink-500' },
  { email: 'matt.traiman@gmail.com', firstName: 'Matt', lastName: 'Traimain', nickname: 'TraiDog', handicap: 18, color: 'bg-indigo-500' },
];

const QuickLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [creatingUsers, setCreatingUsers] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  useEffect(() => {
    fetchActiveTournaments();
  }, []);

  const fetchActiveTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, courses(name, location)')
        .in('status', ['active', 'live'])
        .order('start_time', { ascending: true });

      if (error) throw error;
      setTournaments(data || []);
      if (data && data.length > 0) {
        setSelectedTournament(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoadingTournaments(false);
    }
  };

  const handleQuickLogin = async (player: Player) => {
    setLoading(player.email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: player.email,
        password: 'BandonTest2025!',
      });

      if (error) throw error;

      toast({
        title: `Welcome back, ${player.nickname}!`,
        description: 'Logging you in...',
      });

      // Navigation priority: tournament > stored redirect > dashboard
      if (selectedTournament) {
        navigate(`/tournaments/${selectedTournament}/live`);
      } else {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Failed to log in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCreateTestUsers = async () => {
    setCreatingUsers(true);
    
    try {
      const response = await fetch(
        'https://oxwauckpccujkwfagogf.supabase.co/functions/v1/create-test-users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94d2F1Y2twY2N1amt3ZmFnb2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NjI2NDgsImV4cCI6MjA2ODMzODY0OH0.lmKlbq0mu51-NtuWPEE3zCCPB93_FmCiKqaD_E8oI8E',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Test Users Created!',
          description: `Created ${result.results.created.length} users. ${result.results.alreadyExists.length} already existed.`,
        });
      } else {
        throw new Error(result.error || 'Failed to create users');
      }
    } catch (error: any) {
      console.error('Error creating test users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create test users',
        variant: 'destructive',
      });
    } finally {
      setCreatingUsers(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-golf-green via-background to-golf-fairway/20 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-6">
        {loadingTournaments ? (
          <Card className="border-2 border-golf-green/20">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-golf-green" />
            </CardContent>
          </Card>
        ) : (
          <>
            {tournaments.length > 0 && (
              <Card className="border-2 border-golf-green/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Active Tournaments</CardTitle>
                  <CardDescription>Select a tournament to join directly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      onClick={() => setSelectedTournament(tournament.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTournament === tournament.id
                          ? 'border-golf-green bg-golf-green/10'
                          : 'border-border hover:border-golf-green/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{tournament.name}</h3>
                          {tournament.courses && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{tournament.courses.name}</span>
                              {tournament.courses.location && (
                                <span>• {tournament.courses.location}</span>
                              )}
                            </div>
                          )}
                          {tournament.start_time && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(tournament.start_time).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant={tournament.status === 'live' ? 'default' : 'secondary'}>
                          {tournament.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border-2 border-golf-green/20 shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-golf-green/10 rounded-full">
                    <Trophy className="w-12 h-12 text-golf-green" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">Select Your Profile</CardTitle>
                <CardDescription className="text-base">
                  {tournaments.length > 0 
                    ? 'Choose your profile to join the tournament' 
                    : 'Choose your profile to access your dashboard'}
                </CardDescription>
                <Badge variant="secondary" className="w-fit mx-auto">
                  Testing Mode - One-Click Access
                </Badge>
              </CardHeader>

              <CardContent className="px-6 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {BANDON_PLAYERS.map((player) => (
                    <Button
                      key={player.email}
                      onClick={() => handleQuickLogin(player)}
                      disabled={loading !== null}
                      variant="outline"
                      className="h-auto p-6 flex flex-col items-center gap-4 hover:scale-105 transition-transform"
                    >
                      {loading === player.email ? (
                        <Loader2 className="w-16 h-16 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Avatar className={`w-16 h-16 border-4 border-white shadow-lg ${player.color}`}>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.email}`} />
                            <AvatarFallback className="text-white font-bold text-lg">
                              {getInitials(player.firstName, player.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="text-center space-y-1">
                            <p className="font-semibold text-base">
                              {player.firstName} {player.lastName}
                            </p>
                            <p className="text-xl font-bold text-golf-green">
                              {player.nickname}
                            </p>
                            <Badge variant="secondary" className="mt-2">
                              HCP {player.handicap}
                            </Badge>
                          </div>
                        </>
                      )}
                    </Button>
                  ))}
                </div>

                <div className="mt-8 text-center space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <p className="text-sm font-medium">Don't have test accounts yet?</p>
                    <Button
                      onClick={handleCreateTestUsers}
                      disabled={creatingUsers || loading !== null}
                      className="w-full max-w-xs"
                    >
                      {creatingUsers && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create All Test Users
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      This will create all 8 test accounts with password: <code className="bg-background px-2 py-1 rounded">BandonTest2025!</code>
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/auth')}
                    className="text-muted-foreground"
                  >
                    Back to Standard Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickLogin;
