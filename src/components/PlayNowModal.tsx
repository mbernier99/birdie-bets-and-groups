
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Play, Clock, Users, Trophy, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface PlayNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlayNowModal: React.FC<PlayNowModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { tournaments, loading } = useTournaments();
  const [tournamentCode, setTournamentCode] = useState('');

  const handleEnterTournament = (tournamentId: string, status: string) => {
    onClose();
    if (status === 'draft' || status === 'lobby') {
      navigate(`/tournament/${tournamentId}/lobby`);
    } else if (status === 'live') {
      navigate(`/tournament/${tournamentId}/live`);
    }
  };

  const handleJoinWithCode = () => {
    if (!tournamentCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter a tournament code.",
        variant: "destructive",
      });
      return;
    }
    onClose();
    navigate(`/tournament/invite/${tournamentCode.trim()}`);
  };

  // Filter tournaments by user participation and status
  const myCreatedTournaments = tournaments.filter(
    t => t.created_by === user?.id && (t.status === 'draft' || t.status === 'lobby')
  );
  
  const liveTournaments = tournaments.filter(
    t => t.status === 'live'
  );

  const hasAnyTournaments = myCreatedTournaments.length > 0 || liveTournaments.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-emerald-600" />
            <span>Play Now</span>
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Join with Code Section - Always visible */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Join with Tournament Code</span>
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tournament code..."
                  value={tournamentCode}
                  onChange={(e) => setTournamentCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinWithCode()}
                  className="flex-1"
                />
                <Button onClick={handleJoinWithCode} variant="secondary">
                  Join
                </Button>
              </div>
            </div>

            {/* My Tournaments Ready to Start */}
            {myCreatedTournaments.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>Ready to Start</span>
                </h3>
                <div className="space-y-3">
                  {myCreatedTournaments.map((tournament) => (
                    <div key={tournament.id} className="bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium">{tournament.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>Max {tournament.max_players} players</span>
                            </span>
                            <span className="capitalize">{tournament.game_type}</span>
                            {tournament.entry_fee && tournament.entry_fee > 0 && (
                              <span>${tournament.entry_fee} entry</span>
                            )}
                            {tournament.start_time && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(tournament.start_time), 'MMM d, h:mm a')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleEnterTournament(tournament.id, tournament.status)}
                          className="shrink-0"
                        >
                          <Trophy className="h-4 w-4 mr-2" />
                          Enter Lobby
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
                  <Clock className="h-5 w-5 text-destructive" />
                  <span>Live Tournaments</span>
                </h3>
                <div className="space-y-3">
                  {liveTournaments.map((tournament) => {
                    const isCreator = tournament.created_by === user?.id;
                    return (
                      <div key={tournament.id} className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{tournament.name}</h4>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                                <span className="text-xs text-destructive font-medium">LIVE</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>Max {tournament.max_players} players</span>
                              </span>
                              <span className="capitalize">{tournament.game_type}</span>
                              {tournament.entry_fee && tournament.entry_fee > 0 && (
                                <span>${tournament.entry_fee} entry</span>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleEnterTournament(tournament.id, tournament.status)}
                            variant={isCreator ? "default" : "secondary"}
                          >
                            {isCreator ? 'Manage' : 'Join'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!hasAnyTournaments && (
              <div className="text-center py-12">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Tournaments</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first tournament or enter a code to join one.
                </p>
                <Button onClick={onClose}>
                  Create Tournament
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayNowModal;
