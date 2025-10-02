import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, UserPlus, Users, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayerGroups } from '@/hooks/usePlayerGroups';
import { Separator } from '@/components/ui/separator';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  handicap: number;
  avatar_url: string;
}

interface Player {
  id: string;
  name: string;
  email: string;
  handicapIndex: number;
  status: 'invited' | 'accepted' | 'declined';
  userId?: string; // Add userId to link to profile
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
  const { user } = useAuth();
  const { groups, loading: groupsLoading, deleteGroup } = usePlayerGroups(user?.id);

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
            p.nickname?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, profiles]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      // Use secure search function that doesn't expose sensitive data
      const { data, error } = await supabase
        .rpc('search_profiles_for_tournament', { search_query: '' });

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
      id: profile.id, // Use the profile ID directly
      name: profile.nickname || `${profile.first_name} ${profile.last_name}`,
      email: '', // Email will be looked up server-side using userId
      handicapIndex: profile.handicap || 0,
      status: 'invited',
      userId: profile.id, // Store the profile ID for server-side email lookup
    }));

    onAddPlayers(players);
    setSelectedIds(new Set());
    
    toast({
      title: 'Players added',
      description: `Added ${players.length} player(s) to the tournament`,
    });
  };

  const handleLoadGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const players: Player[] = group.group_members.map((member) => ({
      id: member.profile_id,
      name: member.profile?.nickname || 
            `${member.profile?.first_name || ''} ${member.profile?.last_name || ''}`.trim(),
      email: member.profile?.email || '',
      handicapIndex: member.handicap || 0,
      status: 'invited',
      userId: member.profile_id,
    }));

    onAddPlayers(players);
    
    toast({
      title: 'Group loaded',
      description: `Loaded ${players.length} player(s) from "${group.name}"`,
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const isAlreadyAdded = (profileId: string) => {
    // Check if profile is already added (you may need to update this logic based on how you track added players)
    return false; // TODO: Update this if needed based on your player tracking
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Saved Groups Section */}
      {groups.length > 0 && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Saved Groups</h4>
            <div className="grid gap-2">
              {groups.map((group) => (
                <Card 
                  key={group.id}
                  className="hover:shadow-md transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-golf-green/10 rounded-full">
                          <Users className="h-5 w-5 text-golf-green" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-sm">{group.name}</h5>
                          <p className="text-xs text-muted-foreground">
                            {group.group_members.length} player(s)
                            {group.description && ` • ${group.description}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadGroup(group.id)}
                        >
                          Load Group
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteGroup(group.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <Separator className="my-4" />
        </>
      )}

      {/* Individual Players Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Individual Players</h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players by name or nickname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? 'No players found matching your search' : 'No players in roster yet'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 md:max-h-96 overflow-y-auto">
            {filteredProfiles.map((profile) => {
              const alreadyAdded = isAlreadyAdded(profile.id);
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
