import { supabase } from '@/integrations/supabase/client';

export interface UserActivity {
  hasPlayedTournaments: boolean;
  totalTournaments: number;
  totalWinnings: number;
  lastActivity: Date | null;
}

export const detectUserActivity = async (userId?: string): Promise<UserActivity> => {
  try {
    if (!userId) {
      return {
        hasPlayedTournaments: false,
        totalTournaments: 0,
        totalWinnings: 0,
        lastActivity: null
      };
    }

    // Get tournaments created by user
    const { data: createdTournaments, error: createdError } = await supabase
      .from('tournaments')
      .select('id, created_at')
      .eq('created_by', userId);

    if (createdError) throw createdError;

    // Get tournaments user is participating in
    const { data: participatedTournaments, error: participatedError } = await supabase
      .from('tournament_participants')
      .select('tournament_id, joined_at')
      .eq('user_id', userId);

    if (participatedError) throw participatedError;

    // Get user's rounds for stats
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('id, started_at')
      .eq('user_id', userId);

    if (roundsError) throw roundsError;

    const totalTournaments = (createdTournaments?.length || 0) + (participatedTournaments?.length || 0);
    const hasActivity = totalTournaments > 0 || (rounds?.length || 0) > 0;

    // Find most recent activity
    const allDates = [
      ...(createdTournaments || []).map(t => new Date(t.created_at)),
      ...(participatedTournaments || []).map(p => new Date(p.joined_at)),
      ...(rounds || []).map(r => new Date(r.started_at))
    ];
    
    const lastActivity = allDates.length > 0 
      ? new Date(Math.max(...allDates.map(d => d.getTime())))
      : null;

    return {
      hasPlayedTournaments: hasActivity,
      totalTournaments,
      totalWinnings: 0, // TODO: Calculate from tournament results when implemented
      lastActivity
    };
  } catch (error) {
    console.error('Error detecting user activity:', error);
    return {
      hasPlayedTournaments: false,
      totalTournaments: 0,
      totalWinnings: 0,
      lastActivity: null
    };
  }
};

export const isFirstTimeUser = async (userId?: string): Promise<boolean> => {
  const activity = await detectUserActivity(userId);
  return !activity.hasPlayedTournaments;
};
