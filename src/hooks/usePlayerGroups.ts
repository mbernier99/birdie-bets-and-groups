import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GroupMember {
  profile_id: string;
  handicap: number;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    nickname: string | null;
    email: string;
  };
}

export interface PlayerGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  group_members: GroupMember[];
}

export const usePlayerGroups = (userId?: string) => {
  const [groups, setGroups] = useState<PlayerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGroups = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('player_groups')
        .select(`
          *,
          group_members(
            profile_id,
            handicap,
            profiles(first_name, last_name, nickname, email)
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load player groups',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveGroup = async (
    name: string,
    playerIds: string[],
    playerHandicaps: Record<string, number>,
    description?: string
  ) => {
    if (!userId) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to save groups',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // Create the group
      const { data: groupData, error: groupError } = await supabase
        .from('player_groups')
        .insert({
          user_id: userId,
          name,
          description: description || null,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add members to the group
      const members = playerIds.map(profileId => ({
        group_id: groupData.id,
        profile_id: profileId,
        handicap: playerHandicaps[profileId] || 18,
      }));

      const { error: membersError } = await supabase
        .from('group_members')
        .insert(members);

      if (membersError) throw membersError;

      toast({
        title: 'Group Saved',
        description: `"${name}" has been saved with ${playerIds.length} players`,
      });

      await fetchGroups();
      return groupData.id;
    } catch (error: any) {
      console.error('Error saving group:', error);
      
      if (error.code === '23505') {
        toast({
          title: 'Group Already Exists',
          description: 'You already have a group with this name',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save group',
          variant: 'destructive',
        });
      }
      return null;
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('player_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: 'Group Deleted',
        description: 'The group has been removed',
      });

      await fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete group',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [userId]);

  return {
    groups,
    loading,
    saveGroup,
    deleteGroup,
    refreshGroups: fetchGroups,
  };
};
