import React from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Link as LinkIcon, Copy, MessageCircle } from "lucide-react";
import { QuickBetMode } from "@/hooks/useQuickBetRoom";

interface InviteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  mode?: QuickBetMode;
  amount?: number;
  name?: string;
}

const InviteSheet: React.FC<InviteSheetProps> = ({ open, onOpenChange, roomId, mode, amount, name }) => {
  const { toast } = useToast();
  const link = typeof window !== "undefined" ? `${window.location.origin}/bet-invite/${roomId}` : `/bet-invite/${roomId}`;
  const prettyMode = mode === 'ctp' ? 'Closest to Pin' : mode === 'long-drive' ? 'Long Drive' : 'Quick Bet';
  const message = `${name?.trim() || 'A golfer'} invited you to ${prettyMode}${amount ? ` – $${amount}` : ''}. Code: ${roomId}. Join: ${link}`;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copied` });
    } catch {
      toast({ title: `Failed to copy ${label.toLowerCase()}`, variant: 'destructive' });
    }
  };

  const shareNative = async () => {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: 'Quick Bet Invite', text: message, url: link });
      } catch {
        // user canceled or unsupported
      }
    } else {
      copy(message, 'Invite');
    }
  };

  const smsInvite = () => {
    const smsUrl = `sms:?&body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="space-y-4">
        <SheetHeader>
          <SheetTitle>Invite others</SheetTitle>
          <SheetDescription>Share this link or code so friends can join your bet.</SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Room code</div>
          <div className="flex items-center gap-2">
            <Input readOnly value={roomId} />
            <Button variant="secondary" onClick={() => copy(roomId, 'Code')} aria-label="Copy code">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Link</div>
          <div className="flex items-center gap-2">
            <Input readOnly value={link} />
            <Button variant="secondary" onClick={() => copy(link, 'Link')} aria-label="Copy link">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button onClick={shareNative}>
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button variant="secondary" onClick={smsInvite}>
            <MessageCircle className="h-4 w-4 mr-2" /> SMS
          </Button>
        </div>

        <SheetFooter />
      </SheetContent>
    </Sheet>
  );
};

export default InviteSheet;
