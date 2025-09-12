import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Target, Zap, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { EnhancedARMeasurement } from '@/components/ar/EnhancedARMeasurement';

interface ShotData {
  id: string;
  playerId: string;
  playerName: string;
  measurement: EnhancedARMeasurement;
  distanceYards: number;
  timestamp: number;
  ranking: number;
}

interface EnhancedLeaderboardProps {
  shots: ShotData[];
  gameMode: 'ctp' | 'long-drive';
  currentPlayerId: string;
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  shotCount: number;
  bestDistance: number;
  averageDistance: number;
  bestShot: ShotData;
  latestShot: ShotData;
  trend: 'improving' | 'declining' | 'stable';
  averageAccuracy: number;
  averageConfidence: number;
}

const EnhancedLeaderboard: React.FC<EnhancedLeaderboardProps> = ({
  shots,
  gameMode,
  currentPlayerId
}) => {
  const playerStats = useMemo(() => {
    const statsMap = new Map<string, PlayerStats>();
    
    shots.forEach(shot => {
      const existing = statsMap.get(shot.playerId);
      
      if (!existing) {
        statsMap.set(shot.playerId, {
          playerId: shot.playerId,
          playerName: shot.playerName,
          shotCount: 1,
          bestDistance: shot.distanceYards,
          averageDistance: shot.distanceYards,
          bestShot: shot,
          latestShot: shot,
          trend: 'stable',
          averageAccuracy: shot.measurement.accuracy,
          averageConfidence: shot.measurement.confidence === 'high' ? 3 : 
                            shot.measurement.confidence === 'medium' ? 2 : 1
        });
      } else {
        const playerShots = shots.filter(s => s.playerId === shot.playerId);
        const distances = playerShots.map(s => s.distanceYards);
        const accuracies = playerShots.map(s => s.measurement.accuracy);
        const confidences = playerShots.map(s => 
          s.measurement.confidence === 'high' ? 3 : 
          s.measurement.confidence === 'medium' ? 2 : 1
        );
        
        // Determine best distance based on game mode
        const bestDistance = gameMode === 'ctp' ? 
          Math.min(...distances) : 
          Math.max(...distances);
          
        const isBestShot = gameMode === 'ctp' ? 
          shot.distanceYards <= existing.bestDistance :
          shot.distanceYards >= existing.bestDistance;
        
        // Calculate trend
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (playerShots.length >= 2) {
          const recent = playerShots.slice(-2);
          if (gameMode === 'ctp') {
            trend = recent[1].distanceYards < recent[0].distanceYards ? 'improving' : 
                   recent[1].distanceYards > recent[0].distanceYards ? 'declining' : 'stable';
          } else {
            trend = recent[1].distanceYards > recent[0].distanceYards ? 'improving' :
                   recent[1].distanceYards < recent[0].distanceYards ? 'declining' : 'stable';
          }
        }
        
        statsMap.set(shot.playerId, {
          playerId: shot.playerId,
          playerName: shot.playerName,
          shotCount: playerShots.length,
          bestDistance,
          averageDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
          bestShot: isBestShot ? shot : existing.bestShot,
          latestShot: shot.timestamp > existing.latestShot.timestamp ? shot : existing.latestShot,
          trend,
          averageAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
          averageConfidence: confidences.reduce((a, b) => a + b, 0) / confidences.length
        });
      }
    });
    
    // Sort players by best distance
    const sortedStats = Array.from(statsMap.values()).sort((a, b) => {
      if (gameMode === 'ctp') {
        return a.bestDistance - b.bestDistance; // Closest to pin wins
      } else {
        return b.bestDistance - a.bestDistance; // Longest drive wins
      }
    });
    
    return sortedStats;
  }, [shots, gameMode]);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3: return <Trophy className="h-5 w-5 text-amber-600" />;
      default: return <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{position}</div>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 2.5) return <Badge variant="default" className="text-xs">High</Badge>;
    if (confidence >= 1.5) return <Badge variant="secondary" className="text-xs">Medium</Badge>;
    return <Badge variant="outline" className="text-xs">Low</Badge>;
  };

  if (shots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No shots recorded yet</p>
            <p className="text-sm">Be the first to record a shot!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {gameMode === 'ctp' ? 'Closest to Pin' : 'Long Drive'} Leaderboard
            <Badge variant="outline" className="text-xs">
              {playerStats.length} player{playerStats.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {playerStats.map((player, index) => {
              const position = index + 1;
              const isCurrentPlayer = player.playerId === currentPlayerId;
              
              return (
                <div
                  key={player.playerId}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isCurrentPlayer ? 'bg-purple-50 border-purple-200' : 'bg-muted/50'
                  }`}
                >
                  {/* Position */}
                  <div className="flex-shrink-0">
                    {getPositionIcon(position)}
                  </div>
                  
                  {/* Player Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {player.playerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate">
                          {player.playerName}
                          {isCurrentPlayer && (
                            <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                          )}
                        </div>
                        {getTrendIcon(player.trend)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {player.shotCount} shot{player.shotCount !== 1 ? 's' : ''} • 
                        Avg: {player.averageDistance.toFixed(1)} yards
                      </div>
                    </div>
                  </div>
                  
                  {/* Best Distance */}
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {player.bestDistance.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">yards</div>
                  </div>
                  
                  {/* Accuracy Badge */}
                  <div className="flex-shrink-0">
                    {getConfidenceBadge(player.averageConfidence)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shots
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 5)
              .map((shot) => (
                <div key={shot.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {shot.playerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{shot.playerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(shot.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {shot.distanceYards.toFixed(1)} yards
                    </div>
                    <div className="flex items-center gap-1">
                      {shot.measurement.method === 'enhanced-ar' && (
                        <Zap className="h-3 w-3 text-yellow-500" />
                      )}
                      <Badge 
                        variant={shot.measurement.confidence === 'high' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {shot.measurement.confidence.charAt(0).toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Game Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {shots.length}
              </div>
              <div className="text-muted-foreground">Total Shots</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {playerStats.length}
              </div>
              <div className="text-muted-foreground">Players</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {playerStats.length > 0 ? 
                  (gameMode === 'ctp' ? 
                    Math.min(...playerStats.map(p => p.bestDistance)).toFixed(1) :
                    Math.max(...playerStats.map(p => p.bestDistance)).toFixed(1)
                  ) : '0'
                }
              </div>
              <div className="text-muted-foreground">
                {gameMode === 'ctp' ? 'Closest' : 'Longest'} (yards)
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {shots.filter(s => s.measurement.method === 'enhanced-ar').length}
              </div>
              <div className="text-muted-foreground">Enhanced AR</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLeaderboard;