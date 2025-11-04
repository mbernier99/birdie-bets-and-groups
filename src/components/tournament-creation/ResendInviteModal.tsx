import React, { useState } from 'react';
import { Mail, Link2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ResendInviteModalProps {
  open: boolean;
  onClose: () => void;
  participant: {
    id: string;
    user_id: string;
    profiles: {
      email: string;
      first_name: string | null;
      last_name: string | null;
      nickname: string | null;
    } | null;
  } | null;
  tournamentId: string;
}

export const ResendInviteModal: React.FC<ResendInviteModalProps> = ({
  open,
  onClose,
  participant,
  tournamentId
}) => {
  const [sending, setSending] = useState(false);

  if (!participant) return null;

  const playerName = participant.profiles?.nickname || 
    participant.profiles?.first_name || 
    participant.profiles?.email?.split('@')[0] || 
    'Player';

  const handleResendEmail = async () => {
    if (!participant.profiles?.email) {
      toast({
        title: "No email address",
        description: "This player doesn't have an email address on file",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-tournament-invitation', {
        body: {
          tournamentId,
          players: [{
            email: participant.profiles.email,
            name: playerName
          }]
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation resent!",
        description: `Email sent to ${participant.profiles.email}`
      });
      onClose();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/tournament/invite/${tournamentId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link copied!",
      description: "Share this link with the player"
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Invitation to {playerName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button 
            onClick={handleResendEmail} 
            disabled={sending || !participant.profiles?.email}
            className="w-full justify-start h-auto py-4"
            variant="outline"
          >
            <Mail className="h-5 w-5 mr-3 text-emerald-600" />
            <div className="text-left">
              <div className="font-medium">Resend Email Invitation</div>
              <div className="text-xs text-muted-foreground">
                {participant.profiles?.email || 'No email on file'}
              </div>
            </div>
          </Button>
          
          <Button 
            onClick={handleCopyLink} 
            className="w-full justify-start h-auto py-4"
            variant="outline"
          >
            <Link2 className="h-5 w-5 mr-3 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Copy Invite Link</div>
              <div className="text-xs text-muted-foreground">
                Share via text or messaging app
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
