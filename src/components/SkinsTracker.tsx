import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame } from 'lucide-react';
import { SkinResult } from '@/utils/skinsCalculations';

interface SkinsTrackerProps {
  skinResults: SkinResult[];
  currentHole: number;
  playerNames: Map<string, string>;
}

export const SkinsTracker: React.FC<SkinsTrackerProps> = ({
  skinResults,
  currentHole,
  playerNames
}) => {
  const relevantSkins = skinResults.filter(r => r.holeNumber <= currentHole && r.holeNumber > 0);
  const activeSkins = relevantSkins.slice(-5); // Last 5 holes
  const currentPot = skinResults.find(r => r.holeNumber === currentHole);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Skins Game
          </div>
          {currentPot?.isCarryover && (
            <Badge variant="secondary" className="animate-pulse">
              Pot: ${currentPot.potAmount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeSkins.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No skins awarded yet
            </div>
          ) : (
            activeSkins.map((skin) => {
              const winnerName = skin.winnerId 
                ? playerNames.get(skin.winnerId) || 'Unknown'
                : 'Tied';
              
              return (
                <div
                  key={skin.holeNumber}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    skin.isCarryover ? 'border-orange-300 bg-orange-50 dark:bg-orange-950' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={skin.isCarryover ? 'secondary' : 'default'}>
                      Hole {skin.holeNumber}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {skin.isCarryover ? 'Carry Over' : winnerName}
                      </div>
                      {!skin.isCarryover && skin.winnerScore && (
                        <div className="text-sm text-muted-foreground">
                          Score: {skin.winnerScore}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ${skin.potAmount.toFixed(2)}
                    </div>
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
