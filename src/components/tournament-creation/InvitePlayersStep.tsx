import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Link as LinkIcon, Copy, Search, Plus } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import PlayerManagementModal from './PlayerManagementModal';
import { supabase } from '@/integrations/supabase/client';

interface InvitePlayersStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
  onNext?: () => void;
}

const InvitePlayersStep: React.FC<InvitePlayersStepProps> = ({ data, onDataChange, onNext }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentPlayers, setRecentPlayers] = useState<any[]>([]);

  const inviteCode = 'NBULA2'; // TODO: Generate unique code

  // Search for players in database
  useEffect(() => {
    const searchPlayers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data: profiles, error } = await supabase
          .rpc('search_profiles_for_tournament', { search_query: searchQuery });

        if (error) throw error;
        setSearchResults(profiles || []);
      } catch (error) {
        console.error('Error searching players:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchPlayers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Fetch recent players on mount
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const { data: profiles, error } = await supabase
          .rpc('search_profiles_for_tournament', { search_query: '' });
        if (error) throw error;
        setRecentPlayers((profiles || []).slice(0, 10));
      } catch (e) {
        console.error('Error loading recent players', e);
      }
    };
    loadRecent();
  }, []);

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/tournament-invite/${inviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${data.basicInfo.name}`,
          url: shareUrl,
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Link copied to clipboard' });
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ title: 'Link copied to clipboard' });
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/tournament-invite/${inviteCode}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied to clipboard' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({ title: 'Invite code copied' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const addPlayerFromSearch = (profile: any) => {
    const displayName = profile.nickname || `${profile.first_name} ${profile.last_name}`.trim() || profile.email;
    
    // Check if player already added
    if (data.players.some(p => p.id === profile.id)) {
      toast({ title: 'Player already added', variant: 'destructive' });
      return;
    }

    // Check max players
    if (data.players.length >= data.basicInfo.maxPlayers) {
      toast({ title: 'Maximum players reached', variant: 'destructive' });
      return;
    }

    const newPlayer = {
      id: profile.id,
      name: displayName,
      email: profile.email || '',
      handicapIndex: profile.handicap || 0,
      status: 'invited' as const
    };

    onDataChange('players', [...data.players, newPlayer]);
    toast({ title: `Added ${displayName}` });
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 px-1 py-4 pb-24">
        {/* Search */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">Search Players</h3>
            <span className="text-sm text-muted-foreground">{data.players.length}/{data.basicInfo.maxPlayers}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          {/* Search Results */}
          {searchQuery.trim().length >= 2 && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="text-center py-4 text-sm text-muted-foreground">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">No players found</div>
              ) : (
                searchResults.map((profile) => {
                  const displayName = profile.nickname || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email;
                  const isAdded = data.players.some(p => p.email === profile.email);
                  
                  return (
                    <div key={profile.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{displayName}</div>
                          {profile.email && (
                            <div className="text-xs text-muted-foreground truncate">{profile.email}</div>
                          )}
                          {typeof profile.handicap === 'number' && (
                            <div className="text-xs text-muted-foreground">HCP: {profile.handicap}</div>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => addPlayerFromSearch(profile)}
                        disabled={isAdded}
                        className="flex-shrink-0"
                      >
                        {isAdded ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {searchQuery.trim().length < 2 && recentPlayers.length > 0 && (
          <div className="mt-4">
            <h3 className="text-base font-semibold mb-3">Suggested</h3>
            <div className="space-y-2">
              {recentPlayers.map((profile) => {
                const displayName = profile.nickname || `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
                const isAdded = data.players.some(p => p.id === profile.id);
                return (
                  <div key={profile.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{displayName}</div>
                        {typeof profile.handicap === 'number' && (
                          <div className="text-xs text-muted-foreground">HCP: {profile.handicap}</div>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addPlayerFromSearch(profile)} disabled={isAdded}>
                      {isAdded ? 'Added' : 'Add'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Current players */}
        {data.players.length > 0 && (
          <div>
            <h3 className="text-base font-semibold mb-3">Added Players</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {data.players.map((player, index) => (
                <div key={index} className="flex flex-col items-center gap-1.5 min-w-[70px]">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="text-sm">{getInitials(player.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-center line-clamp-2 w-full">{player.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Guest Button */}
        <div>
          <Button
            variant="outline"
            onClick={() => setIsPlayerModalOpen(true)}
            className="w-full h-12 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Guest Player
          </Button>
        </div>
      </div>

      {/* Fixed Next Button */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t mt-auto">
        <Button
          onClick={onNext}
          size="lg"
          className="w-full h-14 text-lg font-semibold"
        >
          Next
        </Button>
      </div>

      <PlayerManagementModal
        players={data.players}
        onPlayersChange={(players) => onDataChange('players', players)}
        maxPlayers={data.basicInfo.maxPlayers}
      >
        <span />
      </PlayerManagementModal>
    </div>
  );
};

export default InvitePlayersStep;
