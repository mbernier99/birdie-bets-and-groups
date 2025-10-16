import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Trophy, DollarSign, Target, Zap } from "lucide-react";
import { format } from "date-fns";

interface StatsTabProps {
  stats: {
    totalWinnings: number;
    totalLosses: number;
    netWinnings: number;
    tournamentsPlayed: number;
    tournamentsHosted: number;
    winRate: number;
    recentRounds: Array<{
      id: string;
      started_at: string;
      total_score: number | null;
      course_name: string | null;
    }>;
    biggestWin: number;
    activeBets: number;
  };
  loading: boolean;
}

export const StatsTab = ({ stats, loading }: StatsTabProps) => {
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Winnings Overview */}
      <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-foreground">Total Winnings</h3>
        </div>
        <div className="text-3xl font-bold text-green-600 mb-1">
          ${stats.totalWinnings.toFixed(0)}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Won: ${stats.totalWinnings}
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            Lost: ${stats.totalLosses}
          </span>
        </div>
        <div className={`mt-2 text-lg font-semibold ${stats.netWinnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          Net: ${stats.netWinnings >= 0 ? '+' : ''}{stats.netWinnings}
        </div>
      </Card>

      {/* Tournament Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Tournaments</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.tournamentsPlayed}</div>
          <div className="text-sm text-muted-foreground">
            Hosted: {stats.tournamentsHosted}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.winRate}%</div>
          <div className="text-sm text-muted-foreground">
            Best streak
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Biggest Win</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${stats.biggestWin}
          </div>
          <div className="text-sm text-muted-foreground">
            Single bet
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Active Bets</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{stats.activeBets}</div>
          <div className="text-sm text-muted-foreground">
            In progress
          </div>
        </Card>
      </div>

      {/* Recent Rounds */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-3">Recent Rounds</h3>
        {stats.recentRounds.length > 0 ? (
          <div className="space-y-2">
            {stats.recentRounds.map((round) => (
              <div
                key={round.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <div className="font-medium text-foreground">
                    {round.course_name || "Unknown Course"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(round.started_at), "MMM d, yyyy")}
                  </div>
                </div>
                {round.total_score && (
                  <div className="text-lg font-bold text-foreground">
                    {round.total_score}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No rounds recorded yet. Start tracking your golf!
          </p>
        )}
      </Card>
    </div>
  );
};
