import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTournaments } from '@/hooks/useTournaments';
import Navbar from '@/components/Navbar';
import CreateTournamentModal from '@/components/CreateTournamentModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Calendar, MapPin, Users, Trophy, DollarSign, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { TournamentStatistics } from '@/components/tournament/TournamentStatistics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MyTournamentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tournaments, loading, refetch } = useTournaments();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<string | null>(null);

  // Separate tournaments by created vs participated
  const createdTournaments = tournaments.filter(t => t.created_by === user?.id);
  const participatedTournaments = tournaments.filter(t => t.created_by !== user?.id);

  const filterTournaments = (tournamentList: any[]) => {
    if (!searchQuery) return tournamentList;
    return tournamentList.filter(t =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'lobby': return 'bg-blue-500';
      default: return 'bg-yellow-500';
    }
  };

  const handleDeleteTournament = async () => {
    if (!tournamentToDelete) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentToDelete);

      if (error) throw error;

      toast({
        title: "Tournament deleted",
        description: "The tournament has been successfully deleted.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error deleting tournament",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTournamentToDelete(null);
    }
  };

  const TournamentCard = ({ tournament, isCreator }: { tournament: any; isCreator: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              {tournament.name}
              <Badge className={getStatusColor(tournament.status)}>
                {tournament.status}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {tournament.description || 'No description'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tournament Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{tournament.start_time ? format(new Date(tournament.start_time), 'PPP') : 'Date TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{tournament.courses?.name || 'Course TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{tournament.game_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${tournament.entry_fee || 0} entry</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => navigate(`/tournament/${tournament.id}/lobby`)}
            className="flex-1"
            variant="default"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {isCreator && tournament.status !== 'completed' && (
            <Button
              onClick={() => {
                setTournamentToDelete(tournament.id);
                setDeleteDialogOpen(true);
              }}
              variant="destructive"
              size="icon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Tournaments</h1>
              <p className="text-muted-foreground mt-1">Manage and view your golf tournaments</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="w-full md:w-auto">
              <Plus className="h-5 w-5 mr-2" />
              Create Tournament
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="created" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="created">
                Created ({createdTournaments.length})
              </TabsTrigger>
              <TabsTrigger value="joined">
                Joined ({participatedTournaments.length})
              </TabsTrigger>
              <TabsTrigger value="statistics">
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* Created Tournaments */}
            <TabsContent value="created" className="space-y-4">
              {filterTournaments(createdTournaments).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No tournaments created yet</p>
                    <p className="text-muted-foreground mb-4">
                      Create your first tournament to get started
                    </p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Tournament
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filterTournaments(createdTournaments).map(tournament => (
                    <TournamentCard key={tournament.id} tournament={tournament} isCreator={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Joined Tournaments */}
            <TabsContent value="joined" className="space-y-4">
              {filterTournaments(participatedTournaments).length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No tournaments joined yet</p>
                    <p className="text-muted-foreground">
                      Join a tournament to see it here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filterTournaments(participatedTournaments).map(tournament => (
                    <TournamentCard key={tournament.id} tournament={tournament} isCreator={false} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Statistics */}
            <TabsContent value="statistics">
              <TournamentStatistics
                createdTournaments={createdTournaments}
                participatedTournaments={participatedTournaments}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Tournament Modal */}
      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tournament
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTournament} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyTournamentsPage;
