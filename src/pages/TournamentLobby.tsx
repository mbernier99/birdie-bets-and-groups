import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Trophy, Play, Settings, UserPlus, Share2, Mail, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useTournaments } from '@/hooks/useTournaments';
import { Button } from '@/components/ui/button';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';
import { ConnectionTest } from '@/components/ConnectionTest';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';

interface Participant {
  id: string;
  user_id: string;
  status: string;
  handicap: number | null;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    nickname: string | null;
  } | null;
}

const TournamentLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateTournament } = useTournaments();
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);

  // Fetch tournament and participants
  const fetchTournamentData = async () => {
    if (!id) return;

    try {
      // Fetch tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (tournamentError) throw tournamentError;
      
      setTournament(tournamentData);
      setIsOrganizer(tournamentData.created_by === user?.id);

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('id, user_id, status, handicap')
        .eq('tournament_id', id);

      if (participantsError) throw participantsError;

      // Fetch profile data for all participants
      if (participantsData && participantsData.length > 0) {
        const userIds = participantsData.map(p => p.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, nickname')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          // Merge profile data with participants
          const enrichedParticipants = participantsData.map(participant => ({
            ...participant,
            profiles: profilesData.find(p => p.id === participant.user_id) || null
          }));
          setParticipants(enrichedParticipants);
        } else {
          setParticipants(participantsData.map(p => ({ ...p, profiles: null })));
        }
      } else {
        setParticipants([]);
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

  useEffect(() => {
    fetchTournamentData();

    // Set up real-time subscriptions
    const participantsChannel = supabase
      .channel(`tournament-${id}-participants`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournament_participants',
          filter: `tournament_id=eq.${id}`
        },
        () => {
          fetchTournamentData();
        }
      )
      .subscribe();

    const tournamentsChannel = supabase
      .channel(`tournament-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${id}`
        },
        () => {
          fetchTournamentData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(tournamentsChannel);
    };
  }, [id]);

  const handleStartTournament = async () => {
    if (!tournament || !isOrganizer) return;

    const confirmedCount = participants.filter(p => p.status === 'confirmed').length;
    
    if (confirmedCount < 2) {
      toast({
        title: "Not enough players",
        description: "At least 2 confirmed players are required to start",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateTournament(tournament.id, { status: 'active' });
      toast({
        title: "Tournament started!",
        description: "Good luck to all players"
      });
      navigate(`/tournament/${id}/live`);
    } catch (error) {
      console.error('Error starting tournament:', error);
    }
  };

  const handleInvitePlayers = () => {
    toast({
      title: "Invite link copied!",
      description: "Share this link with players to invite them"
    });
    navigator.clipboard.writeText(`${window.location.origin}/tournament/invite/${id}`);
  };

  const getPlayerName = (participant: Participant) => {
    const profile = participant.profiles;
    if (profile?.nickname) return profile.nickname;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) return profile.first_name;
    return profile?.email?.split('@')[0] || 'Unknown Player';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </span>
        );
      default:
        return null;
    }
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
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
  const wagering = settings.wagering || {};
  const course = settings.course || {};
  const confirmedPlayers = participants.filter(p => p.status === 'confirmed');
  const canStart = isOrganizer && confirmedPlayers.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      <NetworkStatusIndicator />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tournament Header */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{confirmedPlayers.length}/{tournament.max_players || '∞'} Players</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>{tournament.game_type}</span>
                </span>
                {tournament.entry_fee > 0 && (
                  <span className="flex items-center space-x-1">
                    <span>${tournament.entry_fee} Entry</span>
                  </span>
                )}
              </div>
              {course.name && (
                <p className="text-sm text-gray-600 mt-2">
                  📍 {course.name}{course.location ? `, ${course.location}` : ''}
                </p>
              )}
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              {isOrganizer && (
                <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              )}
              <button 
                onClick={handleInvitePlayers}
                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Status Banner */}
          {isOrganizer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Waiting for players to accept</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {confirmedPlayers.length} player{confirmedPlayers.length !== 1 ? 's' : ''} confirmed. 
                    {canStart ? ' Ready to start!' : ' Need at least 2 confirmed players to start.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isOrganizer && (
              <Button
                onClick={handleStartTournament}
                disabled={!canStart}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="h-5 w-5" />
                <span>Start Tournament</span>
              </Button>
            )}
            <Button
              onClick={handleInvitePlayers}
              variant="outline"
              className="flex-1 sm:flex-none border-emerald-200 text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Invite Players</span>
            </Button>
          </div>
        </div>

        {/* Connection Test - Show to organizer */}
        {isOrganizer && (
          <ConnectionTest />
        )}

        {/* Players List */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Players ({confirmedPlayers.length})
          </h2>
          
          {participants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No players yet. Invite players to join!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-medium">
                        {getPlayerName(participant).substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getPlayerName(participant)}</p>
                      <p className="text-sm text-gray-600">
                        {participant.handicap !== null ? `Handicap: ${participant.handicap}` : 'No handicap'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(participant.status)}
                  </div>
                </div>
              ))}
              
              {/* Empty slots */}
              {tournament.max_players && participants.length < tournament.max_players && (
                Array.from({ length: tournament.max_players - participants.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="flex items-center justify-between p-3 border-2 border-dashed border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Waiting for player...</p>
                    </div>
                    <button 
                      onClick={handleInvitePlayers}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default TournamentLobby;
