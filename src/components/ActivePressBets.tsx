import React from 'react';
import { Target, Clock, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActivePressBetsProps {
  pressBets: any[];
  userId: string;
  onAccept: (betId: string) => void;
  onDecline: (betId: string) => void;
  profiles: Map<string, any>;
}

const ActivePressBets: React.FC<ActivePressBetsProps> = ({ 
  pressBets, 
  userId, 
  onAccept, 
  onDecline,
  profiles 
}) => {
  const activeBets = pressBets.filter(bet => 
    (bet.status === 'pending' || bet.status === 'accepted' || bet.status === 'active') &&
    (bet.initiator_id === userId || bet.target_id === userId)
  );

  if (activeBets.length === 0) {
    return null;
  }

  const getBetTypeDisplay = (betType: string) => {
    const types: Record<string, string> = {
      'closest-to-pin': 'Closest to Pin',
      'longest-drive': 'Longest Drive',
      'this-hole': 'This Hole',
      'remaining-holes': 'Remaining Holes',
      'total-strokes': 'Total Strokes',
      'head-to-head': 'Head to Head',
    };
    return types[betType] || betType;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Active Bets</h3>
        <Badge variant="secondary">{activeBets.length}</Badge>
      </div>

      {activeBets.map((bet) => {
        const isInitiator = bet.initiator_id === userId;
        const opponentId = isInitiator ? bet.target_id : bet.initiator_id;
        const opponent = profiles.get(opponentId);
        const opponentName = opponent?.nickname || opponent?.first_name || 'Player';
        const isPending = bet.status === 'pending' && !isInitiator;

        return (
          <Card key={bet.id} className={cn(
            "p-4 border-l-4 transition-all",
            isPending ? "border-l-orange-500 bg-orange-50/50" : "border-l-emerald-500"
          )}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {isInitiator ? 'vs' : 'from'} {opponentName}
                  </span>
                  <Badge className={getStatusColor(bet.status)} variant="secondary">
                    {bet.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getBetTypeDisplay(bet.bet_type)}
                  {bet.hole_number && ` • Hole ${bet.hole_number}`}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <DollarSign className="h-4 w-4" />
                  <span>{bet.amount}</span>
                </div>
              </div>
            </div>

            {bet.description && (
              <p className="text-xs text-gray-600 mb-3">{bet.description}</p>
            )}

            {isPending && (
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button
                  size="sm"
                  onClick={() => onAccept(bet.id)}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDecline(bet.id)}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {bet.expires_at && bet.status === 'pending' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <Clock className="h-3 w-3" />
                <span>Expires soon</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default ActivePressBets;
