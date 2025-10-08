import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, DollarSign, Target, TrendingUp, Award } from 'lucide-react';

interface TournamentStatisticsProps {
  createdTournaments: any[];
  participatedTournaments: any[];
}

export const TournamentStatistics: React.FC<TournamentStatisticsProps> = ({
  createdTournaments,
  participatedTournaments,
}) => {
  const allTournaments = [...createdTournaments, ...participatedTournaments];
  
  // Calculate statistics
  const totalTournaments = allTournaments.length;
  const completedTournaments = allTournaments.filter(t => t.status === 'completed').length;
  const activeTournaments = allTournaments.filter(t => t.status === 'live').length;
  const totalEntryFees = allTournaments.reduce((sum, t) => sum + (Number(t.entry_fee) || 0), 0);
  const totalPrizePools = allTournaments.reduce((sum, t) => sum + (Number(t.prize_pool) || 0), 0);
  
  // Game type breakdown
  const gameTypeStats = allTournaments.reduce((acc, t) => {
    acc[t.game_type] = (acc[t.game_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Status breakdown
  const statusStats = allTournaments.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const StatCard = ({ icon: Icon, title, value, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Overall Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Trophy}
            title="Total Tournaments"
            value={totalTournaments}
            description="All tournaments you've been part of"
          />
          <StatCard
            icon={Target}
            title="Completed"
            value={completedTournaments}
            description={`${totalTournaments > 0 ? Math.round((completedTournaments / totalTournaments) * 100) : 0}% completion rate`}
          />
          <StatCard
            icon={TrendingUp}
            title="Active"
            value={activeTournaments}
            description="Currently in progress"
          />
          <StatCard
            icon={Users}
            title="Created"
            value={createdTournaments.length}
            description="Tournaments you organized"
          />
        </div>
      </div>

      {/* Financial Statistics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Financial Overview</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            icon={DollarSign}
            title="Total Entry Fees"
            value={`$${totalEntryFees.toFixed(2)}`}
            description="Sum of all entry fees"
          />
          <StatCard
            icon={Award}
            title="Total Prize Pools"
            value={`$${totalPrizePools.toFixed(2)}`}
            description="Sum of all prize pools"
          />
        </div>
      </div>

      {/* Game Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Game Type Distribution</CardTitle>
          <CardDescription>Your tournament preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(gameTypeStats).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="capitalize font-medium">{type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{String(count)} tournament{count !== 1 ? 's' : ''}</span>
                  <span className="font-medium">{totalTournaments > 0 ? Math.round((Number(count) / totalTournaments) * 100) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Status</CardTitle>
          <CardDescription>Current state of your tournaments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      status === 'completed' ? 'bg-gray-500' :
                      status === 'live' ? 'bg-green-500' :
                      status === 'lobby' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}
                  />
                  <span className="capitalize font-medium">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{String(count)} tournament{count !== 1 ? 's' : ''}</span>
                  <span className="font-medium">{totalTournaments > 0 ? Math.round((Number(count) / totalTournaments) * 100) : 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Created vs Participated */}
      <Card>
        <CardHeader>
          <CardTitle>Your Role</CardTitle>
          <CardDescription>Organizer vs Participant breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">As Organizer</span>
                <span className="text-muted-foreground">
                  {createdTournaments.length} / {totalTournaments} ({totalTournaments > 0 ? Math.round((createdTournaments.length / totalTournaments) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalTournaments > 0 ? (createdTournaments.length / totalTournaments) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">As Participant</span>
                <span className="text-muted-foreground">
                  {participatedTournaments.length} / {totalTournaments} ({totalTournaments > 0 ? Math.round((participatedTournaments.length / totalTournaments) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalTournaments > 0 ? (participatedTournaments.length / totalTournaments) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
