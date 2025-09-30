import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  nickname: string;
  phone: string;
  handicap: number;
  avatar_url: string;
}

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
}

interface LoadFromRosterTabProps {
  onAddPlayers: (players: Player[]) => void;
  existingPlayerEmails: string[];
}

export const LoadFromRosterTab: React.FC<LoadFromRosterTabProps> = ({
  onAddPlayers,
  existingPlayerEmails,
}) => {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProfiles(
        profiles.filter(
          (p) =>
            p.first_name?.toLowerCase().includes(query) ||
            p.last_name?.toLowerCase().includes(query) ||
            p.nickname?.toLowerCase().includes(query) ||
            p.email?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, profiles]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;

      setProfiles(data || []);
      setFilteredProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Error loading profiles',
        description: error.message || 'Failed to load player roster',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (profileId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(profileId)) {
      newSelected.delete(profileId);
    } else {
      newSelected.add(profileId);
    }
    setSelectedIds(newSelected);
  };

  const handleAddSelected = () => {
    const selectedProfiles = profiles.filter((p) => selectedIds.has(p.id));
    
    const players: Player[] = selectedProfiles.map((profile) => ({
      id: crypto.randomUUID(),
      name: profile.nickname || `${profile.first_name} ${profile.last_name}`,
      email: profile.email,
      handicapIndex: profile.handicap || 0,
      status: 'invited',
    }));

    onAddPlayers(players);
    setSelectedIds(new Set());
    
    toast({
      title: 'Players added',
      description: `Added ${players.length} player(s) to the tournament`,
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const isAlreadyAdded = (email: string) => existingPlayerEmails.includes(email);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search players by name, nickname, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'No players found matching your search' : 'No players in roster yet'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 md:max-h-96 overflow-y-auto">
            {filteredProfiles.map((profile) => {
              const alreadyAdded = isAlreadyAdded(profile.email);
              const isSelected = selectedIds.has(profile.id);

              return (
                <Card
                  key={profile.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-golf-green bg-golf-green/5'
                      : alreadyAdded
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => !alreadyAdded && toggleSelection(profile.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-golf-green text-white">
                          {getInitials(profile.first_name, profile.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {profile.first_name} {profile.last_name}
                        </p>
                        {profile.nickname && (
                          <p className="text-xs text-golf-green font-medium">
                            "{profile.nickname}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate">
                          {profile.email}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-xs">
                          HCP {profile.handicap || 0}
                        </Badge>
                        {alreadyAdded && (
                          <Badge variant="outline" className="text-xs">
                            Added
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedIds.size} player(s) selected
              </p>
              <Button onClick={handleAddSelected}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Selected
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
