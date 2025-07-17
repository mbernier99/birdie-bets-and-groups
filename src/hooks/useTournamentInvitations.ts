import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface InvitationRequest {
  tournamentName: string;
  tournamentId: string;
  players: Array<{
    name: string;
    email: string;
    handicapIndex: number;
  }>;
  tournamentDetails?: {
    gameType?: string;
    courseName?: string;
    maxPlayers?: number;
    entryFee?: number;
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

    // Filter players with valid emails
    const playersWithEmails = players.filter(p => p.email && p.email.trim() && p.name && p.name.trim());
    
    if (playersWithEmails.length === 0) {
      toast({
        title: "No invitations to send",
        description: "No players with valid email addresses found.",
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

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('send-tournament-invitation', {
        body: {
          tournamentName,
          tournamentId,
          hostName,
          hostEmail,
          invitees: playersWithEmails,
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