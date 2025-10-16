import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ActivePressBets from '../ActivePressBets';

interface InlineBettingPanelProps {
  pressBets: any[];
  userId: string;
  onAccept: (betId: string) => void;
  onDecline: (betId: string) => void;
  onInitiateBet: () => void;
  profiles: Map<string, any>;
}

export const InlineBettingPanel: React.FC<InlineBettingPanelProps> = ({
  pressBets,
  userId,
  onAccept,
  onDecline,
  onInitiateBet,
  profiles
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculateNetPosition = () => {
    let totalWon = 0;
    let totalOwed = 0;

    pressBets.forEach(bet => {
      if (bet.status === 'completed' && bet.winner_id) {
        const amount = parseFloat(bet.amount || 0);
        if (bet.winner_id === userId) {
          totalWon += amount;
        } else if (bet.initiator_id === userId || bet.target_id === userId) {
          totalOwed += amount;
        }
      }
    });

    return totalWon - totalOwed;
  };

  const activeBetsCount = pressBets.filter(
    b => b.status === 'active' || b.status === 'pending'
  ).length;

  const netPosition = calculateNetPosition();

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      {/* Collapsed Status Bar */}
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-lg font-bold",
                    netPosition > 0 ? "text-emerald-600" : netPosition < 0 ? "text-red-600" : "text-muted-foreground"
                  )}>
                    {netPosition > 0 ? '+' : ''}${netPosition}
                  </span>
                  {netPosition > 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : netPosition < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeBetsCount} active {activeBetsCount === 1 ? 'bet' : 'bets'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onInitiateBet();
                }}
              >
                New Bet
              </Button>
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </Card>
      </CollapsibleTrigger>

      {/* Expanded Content */}
      <CollapsibleContent>
        <div className="mt-3 space-y-3">
          {pressBets.length > 0 ? (
            <ActivePressBets
              pressBets={pressBets}
              userId={userId}
              onAccept={onAccept}
              onDecline={onDecline}
              profiles={profiles}
            />
          ) : (
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">No active bets</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onInitiateBet}
              >
                Start Your First Bet
              </Button>
            </Card>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
