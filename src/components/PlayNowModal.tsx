
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Play, Clock, Users, Trophy, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlayNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Tournament {
  id: string;
  basicInfo: {
    name: string;
    maxPlayers: number;
  };
  gameType: {
    type: string;
  };
  wagering: {
    entryFee: number;
    currency: string;
  };
  status: 'created' | 'lobby' | 'live' | 'completed';
  isOwner?: boolean;
  isInvited?: boolean;
}

const PlayNowModal: React.FC<PlayNowModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedTournaments, setSavedTournaments] = useState<Tournament[]>([]);
  const [invitedTournaments] = useState<Tournament[]>([
    {
      id: 'inv-1',
      basicInfo: { name: 'Sunday Singles Championship', maxPlayers: 16 },
      gameType: { type: 'Match Play' },
      wagering: { entryFee: 15, currency: '$' },
      status: 'live',
      isOwner: false,
      isInvited: true
    },
    {
      id: 'inv-2',
      basicInfo: { name: 'Weekend Best Ball', maxPlayers: 12 },
      gameType: { type: 'Best Ball' },
      wagering: { entryFee: 20, currency: '$' },
      status: 'created',
      isOwner: false,
      isInvited: true
    }
  ]);

  useEffect(() => {
    const tournaments = JSON.parse(localStorage.getItem('savedTournaments') || '[]');
    // Mark saved tournaments as owned by the current user
    const tournamentsWithOwnership = tournaments.map((t: any) => ({
      ...t,
      isOwner: true
    }));
    setSavedTournaments(tournamentsWithOwnership);
  }, [isOpen]);

  const handleEnterTournament = (tournamentId: string, status: string) => {
    onClose();
    if (status === 'created') {
      // Go to lobby for tournaments that haven't started
      navigate(`/tournament/${tournamentId}/lobby`);
    } else if (status === 'live') {
      // Go directly to live tournament
      navigate(`/tournament/${tournamentId}/live`);
    }
  };

  const handleJoinTournament = (tournamentId: string) => {
    // In a real app, this would update the tournament player list
    console.log('Joining tournament:', tournamentId);
    
    toast({
      title: "Joined Tournament",
      description: "You've successfully joined the tournament.",
    });
    
    onClose();
    navigate(`/tournament/${tournamentId}/lobby`);
  };

  const myCreatedTournaments = savedTournaments.filter(t => t.status === 'created');
  const liveTournaments = [
    ...savedTournaments.filter(t => t.status === 'live'),
    ...invitedTournaments.filter(t => t.status === 'live')
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-emerald-600" />
            <span>Play Now</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* My Tournaments Ready to Start */}
          {myCreatedTournaments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-emerald-600" />
                <span>Ready to Start</span>
              </h3>
              <div className="space-y-3">
                {myCreatedTournaments.map((tournament) => (
                  <div key={tournament.id} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{tournament.basicInfo.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>Max {tournament.basicInfo.maxPlayers} players</span>
                          </span>
                          <span>{tournament.gameType.type || 'Game type not set'}</span>
                          {tournament.wagering.entryFee > 0 && (
                            <span>{tournament.wagering.currency}{tournament.wagering.entryFee} entry</span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleEnterTournament(tournament.id, tournament.status)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
                      >
                        <Trophy className="h-4 w-4" />
                        <span>Enter Lobby</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Tournaments */}
          {liveTournaments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-500" />
                <span>Live Tournaments</span>
              </h3>
              <div className="space-y-3">
                {liveTournaments.map((tournament) => (
                  <div key={tournament.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{tournament.basicInfo.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>Max {tournament.basicInfo.maxPlayers} players</span>
                          </span>
                          <span>{tournament.gameType.type || 'Game type not set'}</span>
                          {tournament.wagering.entryFee > 0 && (
                            <span>{tournament.wagering.currency}{tournament.wagering.entryFee} entry</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-600 font-medium">LIVE</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleEnterTournament(tournament.id, tournament.status)}
                        variant={tournament.isOwner ? "default" : "outline"}
                        className={tournament.isOwner ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                      >
                        {tournament.isOwner ? 'Manage' : 'Join Live'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitations */}
          {invitedTournaments.filter(t => t.status === 'created').length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Tournament Invitations</span>
              </h3>
              <div className="space-y-3">
                {invitedTournaments.filter(t => t.status === 'created').map((tournament) => (
                  <div key={tournament.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{tournament.basicInfo.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>Max {tournament.basicInfo.maxPlayers} players</span>
                          </span>
                          <span>{tournament.gameType.type || 'Game type not set'}</span>
                          {tournament.wagering.entryFee > 0 && (
                            <span>{tournament.wagering.currency}{tournament.wagering.entryFee} entry</span>
                          )}
                        </div>
                        <span className="text-xs text-blue-600 font-medium">Waiting for start</span>
                      </div>
                      <Button
                        onClick={() => handleJoinTournament(tournament.id)}
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {myCreatedTournaments.length === 0 && liveTournaments.length === 0 && invitedTournaments.filter(t => t.status === 'created').length === 0 && (
            <div className="text-center py-12">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tournaments</h3>
              <p className="text-gray-600 mb-6">Create a tournament or wait for invitations to get started.</p>
              <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Create Tournament
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayNowModal;
