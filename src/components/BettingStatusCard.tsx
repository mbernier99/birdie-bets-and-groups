import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BettingStatusCardProps {
  pressBets: any[];
  userId: string;
}

const BettingStatusCard: React.FC<BettingStatusCardProps> = ({ pressBets, userId }) => {
  // Calculate total amounts
  const calculateTotals = () => {
    let totalWon = 0;
    let totalOwed = 0;
    let activeBets = 0;

    pressBets.forEach(bet => {
      if (bet.status === 'completed' && bet.winner_id) {
        const amount = parseFloat(bet.amount || 0);
        if (bet.winner_id === userId) {
          totalWon += amount;
        } else if (bet.initiator_id === userId || bet.target_id === userId) {
          totalOwed += amount;
        }
      } else if (bet.status === 'active' || bet.status === 'accepted') {
        activeBets++;
      }
    });

    return { totalWon, totalOwed, activeBets };
  };

  const { totalWon, totalOwed, activeBets } = calculateTotals();
  const netPosition = totalWon - totalOwed;

  return (
    <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Betting Status</h3>
        <DollarSign className="h-5 w-5 text-emerald-600" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className={cn(
            "text-xl font-bold",
            netPosition > 0 ? "text-emerald-600" : netPosition < 0 ? "text-red-600" : "text-gray-900"
          )}>
            ${Math.abs(netPosition)}
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
            {netPosition > 0 ? (
              <>
                <TrendingUp className="h-3 w-3" />
                <span>Up</span>
              </>
            ) : netPosition < 0 ? (
              <>
                <TrendingDown className="h-3 w-3" />
                <span>Down</span>
              </>
            ) : (
              <span>Even</span>
            )}
          </div>
        </div>

        <div className="text-center border-x border-emerald-200">
          <div className="text-xl font-bold text-emerald-600">
            ${totalWon}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Won</div>
        </div>

        <div className="text-center">
          <div className="text-xl font-bold text-orange-600">
            {activeBets}
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
            <Clock className="h-3 w-3" />
            <span>Active</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BettingStatusCard;
