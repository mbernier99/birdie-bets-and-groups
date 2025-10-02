import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Trophy,
  Clock,
  CheckCircle2
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Tournament = Database['public']['Tables']['tournaments']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];

const TournamentInvite: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    loadTournamentDetails();
  }, [tournamentId, user]);

  const loadTournamentDetails = async () => {
    if (!tournamentId) return;

    try {
      setLoading(true);

      // Fetch tournament details (no auth required)
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (tournamentError) throw tournamentError;
      setTournament(tournamentData);

      // Fetch course details if course_id exists
      if (tournamentData.course_id) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', tournamentData.course_id)
          .single();
        
        if (courseData) setCourse(courseData);
      }

      // Fetch participant count (no auth required for count)
      const { count } = await supabase
        .from('tournament_participants')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId);
      
      setParticipantCount(count || 0);

      // Check if current user is already a participant
      if (user) {
        const { data: participantData } = await supabase
          .from('tournament_participants')
          .select('id')
          .eq('tournament_id', tournamentId)
          .eq('user_id', user.id)
          .single();
        
        setIsParticipant(!!participantData);
      }
    } catch (error: any) {
      console.error('Error loading tournament:', error);
      toast({
        title: "Error loading tournament",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async () => {
    if (!user) {
      // Redirect to auth page with return path
      sessionStorage.setItem('redirectAfterLogin', `/tournament/invite/${tournamentId}`);
      navigate('/auth');
      return;
    }

    if (!tournament) return;

    try {
      setJoining(true);

      const { error } = await supabase
        .from('tournament_participants')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          status: 'accepted'
        });

      if (error) throw error;

      toast({
        title: "Successfully joined!",
        description: `You're now registered for ${tournament.name}`,
      });

      // Redirect to tournament lobby
      navigate(`/tournament/${tournament.id}/lobby`);
    } catch (error: any) {
      console.error('Error joining tournament:', error);
      toast({
        title: "Error joining tournament",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameTypeLabel = (gameType: string) => {
    const labels: Record<string, string> = {
      'stroke': 'Stroke Play',
      'match': 'Match Play',
      'stableford': 'Stableford',
      'team_scramble': 'Team Scramble',
      'best_ball': 'Best Ball'
    };
    return labels[gameType] || gameType;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Tournament Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The tournament you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFull = tournament.max_players && participantCount >= tournament.max_players;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Tournament Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{tournament.name}</CardTitle>
                {tournament.description && (
                  <p className="text-muted-foreground">{tournament.description}</p>
                )}
              </div>
              <Badge variant={tournament.status === 'active' ? 'default' : 'secondary'}>
                {tournament.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Trophy className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Game Type</p>
                  <p className="font-semibold">{getGameTypeLabel(tournament.game_type)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Players</p>
                  <p className="font-semibold">
                    {participantCount}
                    {tournament.max_players ? ` / ${tournament.max_players}` : ''}
                  </p>
                </div>
              </div>

              {tournament.start_time && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                    <p className="font-semibold text-sm">{formatDate(tournament.start_time)}</p>
                  </div>
                </div>
              )}

              {tournament.entry_fee && Number(tournament.entry_fee) > 0 && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entry Fee</p>
                    <p className="font-semibold text-green-600">${tournament.entry_fee}</p>
                  </div>
                </div>
              )}

              {course && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg md:col-span-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Course</p>
                    <p className="font-semibold">{course.name}</p>
                    {course.location && (
                      <p className="text-sm text-muted-foreground">{course.location}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="space-y-3">
              {isParticipant ? (
                <Button
                  onClick={() => navigate(`/tournament/${tournament.id}/lobby`)}
                  size="lg"
                  className="w-full"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Go to Tournament Lobby
                </Button>
              ) : isFull ? (
                <Button disabled size="lg" className="w-full">
                  Tournament Full
                </Button>
              ) : (
                <Button
                  onClick={handleJoinTournament}
                  disabled={joining}
                  size="lg"
                  className="w-full"
                >
                  {!user ? (
                    <>Sign in to Join Tournament</>
                  ) : joining ? (
                    <>Joining...</>
                  ) : (
                    <>Join Tournament</>
                  )}
                </Button>
              )}

              {!user && (
                <p className="text-sm text-center text-muted-foreground">
                  You'll need to sign in or create an account to join this tournament
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tournament Rules</CardTitle>
          </CardHeader>
          <CardContent>
            {tournament.rules && typeof tournament.rules === 'object' && Object.keys(tournament.rules).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(tournament.rules).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific rules set for this tournament.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TournamentInvite;
