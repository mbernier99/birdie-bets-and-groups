import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Target, Clock, ArrowLeft, Settings, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';
import { EnhancedLiveScorecard } from '../components/scorecard/EnhancedLiveScorecard';
import { RealTimeLeaderboard } from '../components/leaderboard/RealTimeLeaderboard';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import LiveTournamentTracker from '../components/LiveTournamentTracker';
import { useNotifications } from '@/hooks/useNotifications';
import { useLiveTournamentData } from '@/hooks/useLiveTournamentData';

const LiveTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('scorecard');
  const [myRoundId, setMyRoundId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Enhanced hooks
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification 
  } = useNotifications(id || '', user?.id || '');
  
  const {
    leaderboard,
    myPosition,
    activeBets,
    courseHoles: liveCourseHoles,
    loading: dataLoading
  } = useLiveTournamentData(id || '', user?.id || '');

  useEffect(() => {
    if (!id) return;
    fetchTournament();
    checkOrCreateRound();
  }, [id, user]);

  const fetchTournament = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, courses(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTournament(data);
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

  const checkOrCreateRound = async () => {
    if (!id || !user) return;

    try {
      // Check if user has a round for this tournament
      const { data: existingTournamentRound } = await supabase
        .from('tournament_rounds')
        .select('round_id')
        .eq('tournament_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingTournamentRound) {
        setMyRoundId(existingTournamentRound.round_id);
        return;
      }

      // Create a new round for this user
      const { data: newRound, error: roundError } = await supabase
        .from('rounds')
        .insert({
          user_id: user.id,
          course_id: tournament?.course_id || null,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (roundError) throw roundError;

      // Link round to tournament
      const { error: linkError } = await supabase
        .from('tournament_rounds')
        .insert({
          tournament_id: id,
          round_id: newRound.id,
          user_id: user.id
        });

      if (linkError) throw linkError;

      setMyRoundId(newRound.id);
      
      toast({
        title: "Round started!",
        description: "Good luck out there"
      });
    } catch (error: any) {
      console.error('Error creating round:', error);
      toast({
        title: "Error starting round",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Helper function to get or create a round for any player (admin use)
  const getOrCreateRoundForPlayer = async (playerId: string) => {
    if (!id || !tournament) return null;

    try {
      // Check if player has a round for this tournament
      const { data: existingTournamentRound } = await supabase
        .from('tournament_rounds')
        .select('round_id')
        .eq('tournament_id', id)
        .eq('user_id', playerId)
        .maybeSingle();

      if (existingTournamentRound) {
        return existingTournamentRound.round_id;
      }

      // Create a new round for this player
      const { data: newRound, error: roundError } = await supabase
        .from('rounds')
        .insert({
          user_id: playerId,
          course_id: tournament.course_id || null,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (roundError) throw roundError;

      // Link round to tournament
      const { error: linkError } = await supabase
        .from('tournament_rounds')
        .insert({
          tournament_id: id,
          round_id: newRound.id,
          user_id: playerId
        });

      if (linkError) throw linkError;

      return newRound.id;
    } catch (error: any) {
      console.error('Error creating round for player:', error);
      toast({
        title: "Error creating round",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const handleBackToLobby = () => {
    navigate(`/tournament/${id}/lobby`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
        <MobileHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tournament...</p>
          </div>
        </div>
        <MobileNavigation />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
        <MobileHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tournament Not Found</h2>
            <p className="text-gray-600 mb-4">The tournament you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/tournaments')}>
              Back to Tournaments
            </Button>
          </div>
        </div>
        <MobileNavigation />
      </div>
    );
  }

  const settings = tournament.settings || {};
  const courseHoles = liveCourseHoles.length > 0 ? liveCourseHoles : (tournament.courses?.holes || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader 
        notificationCount={unreadCount}
        onNotificationClick={() => setShowNotifications(true)}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tournament Header */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToLobby}
              className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Lobby</span>
            </button>
            <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Live</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>{tournament.game_type}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>In Progress</span>
                </span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Clock className="h-4 w-4 mr-1" />
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('scorecard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'scorecard'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scorecard
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab('betting')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'betting'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Live Betting
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className={activeTab === 'betting' ? '' : 'bg-white rounded-lg shadow-sm border border-emerald-100 p-6'}>
          {activeTab === 'scorecard' && id && (
            <EnhancedLiveScorecard 
              tournamentId={id}
              roundId={myRoundId || undefined}
              courseHoles={courseHoles}
            />
          )}
          {activeTab === 'leaderboard' && user && (
            <RealTimeLeaderboard
              players={leaderboard}
              myPosition={myPosition}
              userId={user.id}
              loading={dataLoading}
            />
          )}
          {activeTab === 'betting' && <LiveTournamentTracker />}
        </div>
      </div>

      <MobileNavigation />

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onClear={clearNotification}
      />
    </div>
  );
};

export default LiveTournament;
