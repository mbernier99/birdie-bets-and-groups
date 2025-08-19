import React, { useState } from 'react';
import { Users, Plus, Search, Crown, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTournaments } from '@/hooks/useTournaments';
import { useTournamentParticipants } from '@/hooks/useTournamentParticipants';
import Navbar from '@/components/Navbar';
import CreateTournamentModal from '@/components/CreateTournamentModal';

const GroupsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const { tournaments } = useTournaments();
  const navigate = useNavigate();

  // Get active tournaments where user is a participant
  const userTournaments = tournaments.filter(t => 
    t.status === 'draft' || t.status === 'lobby' || t.status === 'live'
  );

  const filteredTournaments = userTournaments.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TournamentParticipants = ({ tournamentId }: { tournamentId: string }) => {
    const { participants } = useTournamentParticipants(tournamentId);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Participants ({participants.length})</span>
        </div>
        <div className="space-y-2">
          {participants.slice(0, 3).map((participant) => (
            <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.user_id}`} />
                <AvatarFallback>
                  P
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Player {participant.id.slice(0, 8)}
                </p>
                {participant.handicap && (
                  <p className="text-xs text-muted-foreground">HCP: {participant.handicap}</p>
                )}
              </div>
              <Badge variant={participant.status === 'confirmed' ? 'default' : 'secondary'}>
                {participant.status}
              </Badge>
            </div>
          ))}
          {participants.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => navigate(`/tournament/${tournamentId}/lobby`)}
            >
              View all {participants.length} participants
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderActiveTournaments = () => (
    <div className="space-y-4">
      {filteredTournaments.length > 0 ? (
        filteredTournaments.map(tournament => (
          <Card key={tournament.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{tournament.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    {tournament.game_type}
                    {tournament.created_by === user?.id && (
                      <Badge variant="outline" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Organizer
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Badge variant={tournament.status === 'live' ? 'default' : 'secondary'}>
                  {tournament.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <TournamentParticipants tournamentId={tournament.id} />
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/tournament/${tournament.id}/lobby`)}
                >
                  {tournament.status === 'live' ? 'View Live' : 'Enter Lobby'}
                </Button>
                {tournament.created_by === user?.id && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/tournament/${tournament.id}/lobby`)}
                  >
                    Manage
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Groups Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No tournaments match your search' : 'You\'re not part of any tournaments yet'}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderQuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full justify-start gap-3 h-auto py-4"
        >
          <Plus className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Create Tournament</div>
            <div className="text-xs opacity-75">Start a new tournament</div>
          </div>
        </Button>
        
        <Button 
          variant="outline"
          className="w-full justify-start gap-3 h-auto py-4"
          onClick={() => navigate('/tournaments')}
        >
          <Search className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Browse Tournaments</div>
            <div className="text-xs text-muted-foreground">Find tournaments to join</div>
          </div>
        </Button>
        
        <Button 
          variant="outline"
          className="w-full justify-start gap-3 h-auto py-4"
          onClick={() => navigate('/tournaments')}
        >
          <Trophy className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Tournament History</div>
            <div className="text-xs text-muted-foreground">View past tournaments</div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="pt-20 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Groups</h1>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {renderActiveTournaments()}
        
        {filteredTournaments.length === 0 && !searchQuery && renderQuickActions()}
      </div>

      <CreateTournamentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default GroupsPage;