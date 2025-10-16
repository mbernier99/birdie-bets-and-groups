import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface InvitationRequest {
  tournamentName: string;
  tournamentId: string;
  players: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    userId?: string; // Support userId for roster players
    handicapIndex: number;
  }>;
  tournamentDetails?: {
    gameType?: string;
    courseName?: string;
    maxPlayers?: number;
    entryFee?: number;
    teams?: Array<{ id: string; name: string; playerIds: string[] }>;
    teeTimeGroups?: Array<{ id: string; time: string; playerIds: string[] }>;
    pairings?: Array<{ id: string; name: string; playerIds: string[]; teeTime?: string }>;
  };
}

interface InvitationResult {
  email: string;
  name: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export const useTournamentInvitations = () => {
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const sendInvitations = async ({
    tournamentName,
    tournamentId,
    players,
    tournamentDetails
  }: InvitationRequest): Promise<InvitationResult[]> => {
    if (!user) {
      throw new Error('Must be authenticated to send invitations');
    }

    // Filter players with valid emails or userIds
    const playersWithContact = players.filter(p => 
      (p.email && p.email.trim()) || p.userId
    ).filter(p => p.name && p.name.trim());
    
    if (playersWithContact.length === 0) {
      toast({
        title: "No invitations to send",
        description: "No players with valid contact information found.",
        variant: "destructive"
      });
      return [];
    }

    setSending(true);

    try {
      // Get user profile for host information
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      const hostName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Tournament Host'
        : 'Tournament Host';

      const hostEmail = profile?.email || user.email || '';

      // Add player assignments
      const playersWithAssignments = playersWithContact.map(player => ({
        ...player,
        assignment: getPlayerAssignment(player.id, tournamentDetails)
      }));

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('send-tournament-invitation', {
        body: {
          tournamentName,
          tournamentId,
          hostName,
          hostEmail,
          invitees: playersWithAssignments,
          tournamentDetails
        }
      });

      if (error) throw error;

      const results = data?.results || [];
      const successCount = data?.totalSent || 0;
      const failedCount = data?.totalFailed || 0;

      // Show success toast
      if (successCount > 0) {
        toast({
          title: "Invitations sent!",
          description: `Successfully sent ${successCount} invitation${successCount === 1 ? '' : 's'}${failedCount > 0 ? ` (${failedCount} failed)` : ''}.`
        });
      }

      // Show error details if any failed
      if (failedCount > 0) {
        const failedEmails = results.filter((r: InvitationResult) => !r.success).map((r: InvitationResult) => r.email);
        toast({
          title: "Some invitations failed",
          description: `Failed to send to: ${failedEmails.join(', ')}`,
          variant: "destructive"
        });
      }

      return results;
    } catch (error: any) {
      console.error('Error sending tournament invitations:', error);
      toast({
        title: "Error sending invitations",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSending(false);
    }
  };

  return {
    sendInvitations,
    sending
  };
};

// Helper function to get player assignment details
const getPlayerAssignment = (playerId: string, tournamentDetails?: any): string => {
  if (!tournamentDetails) return 'No assignment yet';

  // Check teams
  if (tournamentDetails.teams?.length > 0) {
    const team = tournamentDetails.teams.find((t: any) => 
      t.playerIds?.includes(playerId)
    );
    if (team) return `Team: ${team.name}`;
  }

  // Check tee times
  if (tournamentDetails.teeTimeGroups?.length > 0) {
    const teeTime = tournamentDetails.teeTimeGroups.find((t: any) => 
      t.playerIds?.includes(playerId)
    );
    if (teeTime) return `Tee Time: ${teeTime.time}`;
  }

  // Check pairings
  if (tournamentDetails.pairings?.length > 0) {
    const pairing = tournamentDetails.pairings.find((p: any) => 
      p.playerIds?.includes(playerId)
    );
    if (pairing) {
      return `${pairing.name}${pairing.teeTime ? ` at ${pairing.teeTime}` : ''}`;
    }
  }

  return 'No assignment yet';
};