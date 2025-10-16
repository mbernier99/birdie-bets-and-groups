import React, { useState } from 'react';
import { Trophy, Award, TrendingUp, TrendingDown, Minus, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { PlayerScore } from '@/hooks/useLiveTournamentData';

interface RealTimeLeaderboardProps {
  players: PlayerScore[];
  myPosition: number | null;
  userId: string;
  loading?: boolean;
}

export const RealTimeLeaderboard: React.FC<RealTimeLeaderboardProps> = ({
  players,
  myPosition,
  userId,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('overall');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-medium w-5 text-center">{rank}</span>;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'steady') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getScoreColor = (toPar: number) => {
    if (toPar < 0) return 'text-emerald-600';
    if (toPar > 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-accent rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* My Position Card */}
      {myPosition && (
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Your Position</div>
              <div className="text-2xl font-bold">#{myPosition}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">To Par</div>
              <div className={cn("text-2xl font-bold", getScoreColor(players[myPosition - 1]?.toPar || 0))}>
                {players[myPosition - 1]?.toPar > 0 ? '+' : ''}
                {players[myPosition - 1]?.toPar || 0}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overall">
            <Trophy className="h-4 w-4 mr-2" />
            Overall
          </TabsTrigger>
          <TabsTrigger value="mybets">
            <DollarSign className="h-4 w-4 mr-2" />
            My Bets
          </TabsTrigger>
          <TabsTrigger value="sidegames">
            <Users className="h-4 w-4 mr-2" />
            Side Games
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="mt-4">
          <Card>
            <div className="divide-y">
              {players.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No scores yet</p>
                  <p className="text-xs mt-1">Start entering scores to see the leaderboard</p>
                </div>
              ) : (
                players.map((player, index) => {
                  const isMe = player.userId === userId;
                  const rank = index + 1;
                  
                  return (
                    <div
                      key={player.id}
                      className={cn(
                        "p-4 hover:bg-accent/50 transition-colors",
                        isMe && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(rank)}
                        </div>

                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("font-medium", isMe && "text-primary")}>
                              {player.name}
                              {isMe && " (You)"}
                            </span>
                            {getTrendIcon(player.trend)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Thru {player.thru} • On hole {player.currentHole}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <div className={cn("text-lg font-bold", getScoreColor(player.toPar))}>
                            {player.toPar > 0 ? '+' : ''}{player.toPar}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {player.score} strokes
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mybets" className="mt-4">
          <Card className="p-8 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Individual bet tracking</p>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </Card>
        </TabsContent>

        <TabsContent value="sidegames" className="mt-4">
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Skins, Snake, and Wolf tracking</p>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
