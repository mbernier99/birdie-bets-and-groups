import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Users } from 'lucide-react';
import { WolfHoleResult } from '@/utils/wolfCalculations';

interface WolfGameTrackerProps {
  wolfResults: WolfHoleResult[];
  currentHole: number;
  currentWolfId: string;
  playerNames: Map<string, string>;
}

export const WolfGameTracker: React.FC<WolfGameTrackerProps> = ({
  wolfResults,
  currentHole,
  currentWolfId,
  playerNames
}) => {
  const recentResults = wolfResults.filter(r => r.holeNumber <= currentHole).slice(-5);
  const currentWolfName = playerNames.get(currentWolfId) || 'Unknown';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Wolf Game
          </div>
          <Badge variant="secondary">
            Wolf: {currentWolfName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentResults.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No holes completed yet
            </div>
          ) : (
            recentResults.map((result) => {
              const wolfName = playerNames.get(result.wolfPlayerId) || 'Unknown';
              const partnerName = result.partnerId 
                ? playerNames.get(result.partnerId) || 'Unknown'
                : null;

              const resultColor = 
                result.result === 'wolf_win' ? 'text-green-600' :
                result.result === 'opponents_win' ? 'text-red-600' :
                'text-muted-foreground';

              return (
                <div
                  key={result.holeNumber}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.isLoneWolf ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={result.isLoneWolf ? 'default' : 'secondary'}>
                      Hole {result.holeNumber}
                    </Badge>
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        {result.isLoneWolf && <Crown className="h-4 w-4 text-yellow-600" />}
                        {wolfName}
                        {partnerName && (
                          <>
                            <Users className="h-3 w-3 mx-1" />
                            {partnerName}
                          </>
                        )}
                      </div>
                      <div className={`text-sm ${resultColor}`}>
                        {result.result === 'wolf_win' ? 'Won' :
                         result.result === 'opponents_win' ? 'Lost' : 'Tied'}
                        {' '}({result.wolfTeamScore} vs {result.opponentsScore})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      result.result === 'wolf_win' ? 'text-green-600' :
                      result.result === 'opponents_win' ? 'text-red-600' :
                      'text-muted-foreground'
                    }`}>
                      {result.result === 'tie' ? 'Push' : `$${result.amount.toFixed(2)}`}
                    </div>
                    {result.isLoneWolf && (
                      <div className="text-xs text-muted-foreground">Lone Wolf 2x</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
