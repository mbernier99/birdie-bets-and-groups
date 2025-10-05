import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { MultiGameScore } from '@/utils/multiGameScoring';

interface MultiGameLeaderboardProps {
  scores: MultiGameScore[];
  gameType: string;
  currentUserId?: string;
}

export const MultiGameLeaderboard: React.FC<MultiGameLeaderboardProps> = ({
  scores,
  gameType,
  currentUserId
}) => {
  const sortedScores = [...scores].sort((a, b) => a.primaryGamePosition - b.primaryGamePosition);

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    return null;
  };

  const formatMoney = (amount: number): string => {
    return amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Multi-Game Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedScores.map((score) => {
            const isCurrentUser = score.playerId === currentUserId;
            const hasWinnings = score.netPosition !== 0;

            return (
              <div
                key={score.playerId}
                className={`p-4 rounded-lg border ${
                  isCurrentUser ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPositionIcon(score.primaryGamePosition)}
                    <div>
                      <div className="font-semibold">{score.playerName}</div>
                      <div className="text-sm text-muted-foreground">
                        Position: {score.primaryGamePosition} | Score: {score.primaryGameScore}
                      </div>
                    </div>
                  </div>
                  {hasWinnings && (
                    <Badge variant={score.netPosition > 0 ? 'default' : 'destructive'}>
                      {formatMoney(score.netPosition)}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mt-3">
                  {score.skinsWinnings !== 0 && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Skins</span>
                      <span className={score.skinsWinnings > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatMoney(score.skinsWinnings)}
                      </span>
                    </div>
                  )}
                  {score.wolfWinnings !== 0 && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Wolf</span>
                      <span className={score.wolfWinnings > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatMoney(score.wolfWinnings)}
                      </span>
                    </div>
                  )}
                  {score.snakeWinnings !== 0 && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Snake</span>
                      <span className={score.snakeWinnings > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatMoney(score.snakeWinnings)}
                      </span>
                    </div>
                  )}
                  {score.pressWinnings !== 0 && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Press</span>
                      <span className={score.pressWinnings > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatMoney(score.pressWinnings)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
