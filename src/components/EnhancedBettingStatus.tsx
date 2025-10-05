import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EnhancedBettingStatusProps {
  totalWon: number;
  totalOwed: number;
  activeBets: number;
  skinsWinnings?: number;
  wolfWinnings?: number;
  snakeWinnings?: number;
  pressWinnings?: number;
}

export const EnhancedBettingStatus: React.FC<EnhancedBettingStatusProps> = ({
  totalWon,
  totalOwed,
  activeBets,
  skinsWinnings = 0,
  wolfWinnings = 0,
  snakeWinnings = 0,
  pressWinnings = 0
}) => {
  const netPosition = totalWon - totalOwed;
  const hasMultipleGames = 
    Math.abs(skinsWinnings) > 0 || 
    Math.abs(wolfWinnings) > 0 || 
    Math.abs(snakeWinnings) > 0;

  const getStatusIcon = () => {
    if (netPosition > 0) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (netPosition < 0) return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusColor = () => {
    if (netPosition > 0) return 'text-green-600';
    if (netPosition < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const formatMoney = (amount: number): string => {
    return `$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Betting Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Net Position */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <div>
                <div className="text-sm text-muted-foreground">Net Position</div>
                <div className={`text-2xl font-bold ${getStatusColor()}`}>
                  {netPosition > 0 ? '+' : netPosition < 0 ? '-' : ''}
                  {formatMoney(netPosition)}
                </div>
              </div>
            </div>
            {activeBets > 0 && (
              <Badge variant="secondary">{activeBets} Active</Badge>
            )}
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Won</div>
              <div className="text-lg font-semibold text-green-600">
                {formatMoney(totalWon)}
              </div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Owed</div>
              <div className="text-lg font-semibold text-red-600">
                {formatMoney(totalOwed)}
              </div>
            </div>
          </div>

          {/* Side Games Breakdown */}
          {hasMultipleGames && (
            <div className="space-y-2 pt-3 border-t">
              <div className="text-sm font-medium text-muted-foreground">By Game Type</div>
              <div className="grid grid-cols-2 gap-2">
                {Math.abs(skinsWinnings) > 0 && (
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Skins</span>
                    <span className={`text-sm font-semibold ${
                      skinsWinnings > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {skinsWinnings > 0 ? '+' : ''}{formatMoney(skinsWinnings)}
                    </span>
                  </div>
                )}
                {Math.abs(wolfWinnings) > 0 && (
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Wolf</span>
                    <span className={`text-sm font-semibold ${
                      wolfWinnings > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {wolfWinnings > 0 ? '+' : ''}{formatMoney(wolfWinnings)}
                    </span>
                  </div>
                )}
                {Math.abs(snakeWinnings) > 0 && (
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Snake 🐍</span>
                    <span className={`text-sm font-semibold ${
                      snakeWinnings > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {snakeWinnings > 0 ? '+' : ''}{formatMoney(snakeWinnings)}
                    </span>
                  </div>
                )}
                {Math.abs(pressWinnings) > 0 && (
                  <div className="flex justify-between items-center p-2 bg-background rounded">
                    <span className="text-sm">Press</span>
                    <span className={`text-sm font-semibold ${
                      pressWinnings > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {pressWinnings > 0 ? '+' : ''}{formatMoney(pressWinnings)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
