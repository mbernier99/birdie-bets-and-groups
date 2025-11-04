import React from 'react';
import { Shield, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface AdminPlayerSelectorProps {
  participants: Array<{
    user_id: string;
    status: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
      nickname: string | null;
      email: string;
    } | null;
  }>;
  selectedPlayerId: string;
  onSelectPlayer: (playerId: string) => void;
  currentUserId: string;
}

export const AdminPlayerSelector: React.FC<AdminPlayerSelectorProps> = ({
  participants,
  selectedPlayerId,
  onSelectPlayer,
  currentUserId
}) => {
  const getPlayerName = (participant: typeof participants[0]) => {
    const profile = participant.profiles;
    if (profile?.nickname) return profile.nickname;
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) return profile.first_name;
    return profile?.email?.split('@')[0] || 'Unknown Player';
  };

  const selectedParticipant = participants.find(p => p.user_id === selectedPlayerId);

  return (
    <Card className="mb-4 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 flex-1">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <span className="font-medium text-sm text-amber-900">Admin Mode:</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">Entering scores as</span>
          </div>
          <Select value={selectedPlayerId} onValueChange={onSelectPlayer}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {participants.map(p => (
                <SelectItem key={p.user_id} value={p.user_id}>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>{getPlayerName(p)}</span>
                    {p.status === 'pending' && (
                      <Badge variant="outline" className="ml-1 text-xs">Pending</Badge>
                    )}
                    {p.user_id === currentUserId && (
                      <Badge variant="secondary" className="ml-1 text-xs">You</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedParticipant && selectedParticipant.status === 'pending' && (
          <div className="mt-2 text-xs text-amber-700 flex items-center gap-1">
            <span>⚠️</span>
            <span>This player hasn't joined yet. You're entering scores on their behalf.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
