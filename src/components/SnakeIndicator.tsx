import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SnakeState, getSnakeEmoji } from '@/utils/snakeTracking';

interface SnakeIndicatorProps {
  snakes: SnakeState[];
  playerNames: Map<string, string>;
}

export const SnakeIndicator: React.FC<SnakeIndicatorProps> = ({
  snakes,
  playerNames
}) => {
  const getSnakeLabel = (type: string): string => {
    switch (type) {
      case 'front_nine': return 'Front 9';
      case 'back_nine': return 'Back 9';
      case 'overall': return 'Overall';
      default: return type;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{getSnakeEmoji()}</span>
          Snake Game
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {snakes.map((snake) => {
            const holderName = snake.currentHolderId 
              ? playerNames.get(snake.currentHolderId) || 'Unknown'
              : 'No holder';

            return (
              <div
                key={snake.snakeType}
                className={`p-3 rounded-lg border ${
                  snake.isFinal ? 'border-green-300 bg-green-50 dark:bg-green-950' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={snake.isFinal ? 'default' : 'secondary'}>
                      {getSnakeLabel(snake.snakeType)}
                    </Badge>
                    <div>
                      <div className="font-medium">{holderName}</div>
                      {snake.lastHoleUpdated > 0 && !snake.isFinal && (
                        <div className="text-xs text-muted-foreground">
                          Through hole {snake.lastHoleUpdated}
                        </div>
                      )}
                      {snake.isFinal && (
                        <div className="text-xs text-green-600 font-semibold">
                          Winner!
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      snake.isFinal ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      ${snake.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
