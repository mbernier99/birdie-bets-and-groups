
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trophy, Users, MapPin, Play, Clock, Target, UserPlus, Check } from 'lucide-react';
import { calculateCourseHandicap, calculateStrokesReceived } from '@/utils/handicapCalculations';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

interface TournamentPlayer {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  courseHandicap?: number;
  strokesPerHole?: number[];
  status: 'invited' | 'accepted' | 'ready';
}

interface Tournament {
  id: string;
  basicInfo: {
    name: string;
    maxPlayers: number;
  };
  course: {
    name: string;
    rating: number;
    slope: number;
    holes: Array<{
      number: number;
      par: number;
      handicapIndex: number;
    }>;
  };
  gameType: {
    type: string;
  };
  wagering: {
    entryFee: number;
    currency: string;
  };
  players: TournamentPlayer[];
  status: 'created' | 'lobby' | 'live' | 'completed';
  ownerId: string;
}

const TournamentLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInvitingPlayers, setIsInvitingPlayers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    // Load tournament data
    const tournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    const foundTournament = tournaments.find((t: any) => t.id === id);
    
    if (foundTournament) {
      // Calculate handicaps for all players
      const playersWithHandicaps = foundTournament.players?.map((player: any) => {
        const courseHandicap = calculateCourseHandicap(
          player.handicapIndex,
          foundTournament.course.slope
        );
        
        const holeHandicaps = foundTournament.course.holes.map((hole: any) => hole.handicapIndex);
        const strokesPerHole = calculateStrokesReceived(
          player.handicapIndex,
          foundTournament.course.slope,
          holeHandicaps
        );

        return {
          ...player,
          courseHandicap,
          strokesPerHole
        };
      }) || [];

      setTournament({
        ...foundTournament,
        players: playersWithHandicaps
      });
    }
    setLoading(false);
  }, [id]);

  const handleStartTournament = () => {
    if (!tournament) return;

    // Validate minimum players
    if (tournament.players.filter(p => p.status === 'ready').length < 2) {
      toast({
        title: "Not Enough Players",
        description: "You need at least 2 ready players to start the tournament.",
        variant: "destructive"
      });
      return;
    }

    // Update tournament status to live
    const tournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    const updatedTournaments = tournaments.map((t: any) => 
      t.id === id ? { ...t, status: 'live' } : t
    );
    localStorage.setItem('savedTournaments', JSON.stringify(updatedTournaments));
    
    toast({
      title: "Tournament Started!",
      description: "The tournament is now live and ready for play.",
    });
    
    // Navigate to live tournament
    navigate(`/tournament/${id}/live`);
  };

  const handleInvitePlayer = () => {
    if (!tournament || !inviteEmail) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Check if player limit is reached
    if (tournament.players.length >= tournament.basicInfo.maxPlayers) {
      toast({
        title: "Player Limit Reached",
        description: `Maximum ${tournament.basicInfo.maxPlayers} players allowed.`,
        variant: "destructive"
      });
      return;
    }
    
    // Add the player (in real app, would send invitation email)
    const newPlayer = {
      id: `player-${Date.now()}`,
      name: inviteEmail.split('@')[0], // Use first part of email as name
      email: inviteEmail,
      handicapIndex: 0, // Default handicap
      status: 'invited' as const
    };
    
    // Update local state
    const updatedTournament = {
      ...tournament,
      players: [...tournament.players, newPlayer]
    };
    setTournament(updatedTournament);
    
    // Update in localStorage
    const tournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    const updatedTournaments = tournaments.map((t: any) => 
      t.id === id ? { 
        ...t, 
        players: [...t.players, newPlayer]
      } : t
    );
    localStorage.setItem('savedTournaments', JSON.stringify(updatedTournaments));
    
    toast({
      title: "Player Invited",
      description: `An invitation has been sent to ${inviteEmail}.`,
    });
    
    setInviteEmail('');
    setIsInvitingPlayers(false);
  };

  const togglePlayerStatus = (playerId: string) => {
    if (!tournament) return;
    
    // Update the player status
    const updatedPlayers = tournament.players.map(player => {
      if (player.id === playerId) {
        const newStatus = player.status === 'ready' ? 'accepted' : 'ready';
        return { ...player, status: newStatus };
      }
      return player;
    });
    
    // Update local state
    setTournament({
      ...tournament,
      players: updatedPlayers
    });
    
    // Update in localStorage
    const tournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    const updatedTournaments = tournaments.map((t: any) => 
      t.id === id ? { ...t, players: updatedPlayers } : t
    );
    localStorage.setItem('savedTournaments', JSON.stringify(updatedTournaments));

    // Show toast for status change
    const player = tournament.players.find(p => p.id === playerId);
    const newStatus = player?.status === 'ready' ? 'Not Ready' : 'Ready';
    
    toast({
      title: `Player ${newStatus}`,
      description: `${player?.name}'s status has been updated.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tournament...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h2>
            <p className="text-gray-600 mb-4">The tournament you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')} className="bg-emerald-600 hover:bg-emerald-700">
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalPar = tournament.course.holes.reduce((sum, hole) => sum + hole.par, 0);
  const readyPlayers = tournament.players.filter(p => p.status === 'ready').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tournament Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{tournament.basicInfo.name}</h1>
                <p className="text-gray-600">{tournament.gameType.type}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-emerald-600">
                {tournament.wagering.currency}{tournament.wagering.entryFee}
              </div>
              <div className="text-sm text-gray-600">Entry Fee</div>
            </div>
          </div>

          {/* Course Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">{tournament.course.name}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">Par</div>
                <div className="text-emerald-600 font-bold">{totalPar}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Rating</div>
                <div className="text-emerald-600 font-bold">{tournament.course.rating}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Slope</div>
                <div className="text-emerald-600 font-bold">{tournament.course.slope}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Players</div>
                <div className="text-emerald-600 font-bold">{tournament.players.length}/{tournament.basicInfo.maxPlayers}</div>
              </div>
            </div>
          </div>

          {/* Player Status & Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-gray-900">
                {readyPlayers} of {tournament.players.length} players ready
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setIsInvitingPlayers(!isInvitingPlayers)}
                variant="outline"
                className="flex items-center space-x-2"
                disabled={tournament.players.length >= tournament.basicInfo.maxPlayers}
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Player</span>
              </Button>
              <Button
                onClick={handleStartTournament}
                disabled={readyPlayers < 2}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Start Tournament</span>
              </Button>
            </div>
          </div>
          
          {/* Invite Player Form */}
          {isInvitingPlayers && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-3">Invite Player</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 border border-blue-200 rounded-lg p-2 text-sm"
                />
                <Button 
                  onClick={handleInvitePlayer}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invite
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Players List with Handicaps */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Players & Handicaps</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {tournament.players.map((player) => (
              <div key={player.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{player.name}</h3>
                    <p className="text-sm text-gray-600">{player.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="text-sm">
                        <span className="text-gray-600">HCP Index:</span>
                        <span className="font-medium text-gray-900 ml-1">{player.handicapIndex.toFixed(1)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Course HCP:</span>
                        <span className="font-medium text-emerald-600 ml-1">{player.courseHandicap}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      player.status === 'ready' 
                        ? 'bg-green-100 text-green-800'
                        : player.status === 'accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {player.status}
                    </div>
                    {player.status === 'accepted' || player.status === 'ready' ? (
                      <Button 
                        onClick={() => togglePlayerStatus(player.id)}
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Check className={`h-4 w-4 ${player.status === 'ready' ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Stroke Allocation */}
                {player.strokesPerHole && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Strokes Per Hole</h4>
                    <div className="grid grid-cols-9 gap-2 text-xs">
                      {player.strokesPerHole.slice(0, 9).map((strokes, index) => (
                        <div key={index} className="text-center">
                          <div className="text-gray-600">#{index + 1}</div>
                          <div className={`font-bold ${strokes > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {strokes > 0 ? strokes : '—'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-9 gap-2 text-xs mt-2">
                      {player.strokesPerHole.slice(9).map((strokes, index) => (
                        <div key={index + 9} className="text-center">
                          <div className="text-gray-600">#{index + 10}</div>
                          <div className={`font-bold ${strokes > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {strokes > 0 ? strokes : '—'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {tournament.players.length === 0 && (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Players Yet</h3>
                <p className="text-gray-500 mb-4">Invite players to join your tournament.</p>
                <Button 
                  onClick={() => setIsInvitingPlayers(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Players
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentLobby;
