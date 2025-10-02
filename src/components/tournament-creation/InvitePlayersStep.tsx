import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Link as LinkIcon, Copy, Search, Plus } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import PlayerManagementModal from './PlayerManagementModal';

interface InvitePlayersStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const InvitePlayersStep: React.FC<InvitePlayersStepProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  const inviteCode = 'NBULA2'; // TODO: Generate unique code

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/tournament-invite/${inviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${data.basicInfo.name}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Share options */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleShareLink}
            className="flex-1 flex flex-col h-auto py-4 gap-2"
          >
            <Share2 className="h-6 w-6" />
            <span className="text-sm">Share Link</span>
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleCopyLink}
            className="flex-1 flex flex-col h-auto py-4 gap-2"
          >
            <LinkIcon className="h-6 w-6" />
            <span className="text-sm">Copy Link</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleCopyCode}
            className="flex-1 flex flex-col h-auto py-4 gap-2"
          >
            <Copy className="h-6 w-6" />
            <span className="text-sm font-mono">{inviteCode}</span>
          </Button>
        </div>

        {/* Search */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Search on Leaderboard</h3>
            <span className="text-muted-foreground">{data.players.length}/{data.basicInfo.maxPlayers}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Name or Club"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Current players */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          <button
            onClick={() => setIsPlayerModalOpen(true)}
            className="flex flex-col items-center gap-2 min-w-[80px]"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Add Guest</span>
          </button>
          
          {data.players.map((player, index) => (
            <div key={index} className="flex flex-col items-center gap-2 min-w-[80px]">
              <Avatar className="w-16 h-16">
                <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-center line-clamp-2">{player.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Recent players */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent</h3>
          <div className="space-y-3">
            {/* TODO: Fetch recent players from groups/previous tournaments */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>T</AvatarFallback>
                </Avatar>
                <span className="font-medium">Recent players will appear here</span>
              </div>
              <Button size="sm" onClick={() => setIsPlayerModalOpen(true)}>Add</Button>
            </div>
          </div>
        </div>
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
