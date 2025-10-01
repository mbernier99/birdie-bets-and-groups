import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Users, Shield, Zap, Target, TrendingUp } from 'lucide-react';
import { TournamentData } from '../CreateTournamentModal';

interface MobileAdminBettingStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const MobileAdminBettingStep: React.FC<MobileAdminBettingStepProps> = ({ data, onDataChange }) => {
  const handleAdminBettingChange = (field: string, value: any) => {
    onDataChange('adminBetting', {
      ...data.adminBetting,
      [field]: value
    });
  };

  const handleSidePoolChange = (poolType: string, field: string, value: any) => {
    const sidePools = data.adminBetting?.sidePools || {};
    onDataChange('adminBetting', {
      ...data.adminBetting,
      sidePools: {
        ...sidePools,
        [poolType]: {
          ...(sidePools[poolType] || {}),
          [field]: value
        }
      }
    });
  };

  const handlePermissionChange = (field: string, value: any) => {
    const permissions = data.adminBetting?.livePermissions || {};
    onDataChange('adminBetting', {
      ...data.adminBetting,
      livePermissions: {
        ...permissions,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Live Betting Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Live Betting</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Control player-initiated bets during tournament
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Enable Live Betting</Label>
              <div className="text-xs text-muted-foreground">
                Allow players to create bets during play
              </div>
            </div>
            <Switch
              checked={data.adminBetting?.liveEnabled || false}
              onCheckedChange={(checked) => handleAdminBettingChange('liveEnabled', checked)}
            />
          </div>

          {data.adminBetting?.liveEnabled && (
            <>
              <Separator />
              <div>
                <Label className="text-xs">Maximum Bet Amount</Label>
                <Input
                  type="number"
                  value={data.adminBetting?.maxBetAmount || 100}
                  onChange={(e) => handleAdminBettingChange('maxBetAmount', parseFloat(e.target.value))}
                  className="h-9 mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Who Can Initiate Bets</Label>
                <Select 
                  value={data.adminBetting?.livePermissions?.initiators || 'all-players'}
                  onValueChange={(v) => handlePermissionChange('initiators', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-players">All Players</SelectItem>
                    <SelectItem value="admin-only">Admin Only</SelectItem>
                    <SelectItem value="verified-only">Verified Players Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Settlement Method</Label>
                <Select 
                  value={data.adminBetting?.livePermissions?.settlement || 'auto'}
                  onValueChange={(v) => handlePermissionChange('settlement', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-Settlement</SelectItem>
                    <SelectItem value="admin-review">Requires Admin Review</SelectItem>
                    <SelectItem value="gps-verified">GPS Verified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preset Side Pools */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Side Bet Pools</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Tournament-wide side competitions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Longest Drive */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Longest Drive</Label>
              <Switch
                checked={data.adminBetting?.sidePools?.longestDrive?.enabled || false}
                onCheckedChange={(checked) => handleSidePoolChange('longestDrive', 'enabled', checked)}
              />
            </div>
            {data.adminBetting?.sidePools?.longestDrive?.enabled && (
              <div className="pl-4 space-y-2">
                <div>
                  <Label className="text-xs">Entry Fee</Label>
                  <Input
                    type="number"
                    value={data.adminBetting?.sidePools?.longestDrive?.entryFee || 5}
                    onChange={(e) => handleSidePoolChange('longestDrive', 'entryFee', parseFloat(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Eligible Holes (comma-separated)</Label>
                  <Input
                    placeholder="1, 5, 9, 14, 18"
                    value={data.adminBetting?.sidePools?.longestDrive?.holes || ''}
                    onChange={(e) => handleSidePoolChange('longestDrive', 'holes', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Closest to Pin */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Closest to Pin</Label>
              <Switch
                checked={data.adminBetting?.sidePools?.closestToPin?.enabled || false}
                onCheckedChange={(checked) => handleSidePoolChange('closestToPin', 'enabled', checked)}
              />
            </div>
            {data.adminBetting?.sidePools?.closestToPin?.enabled && (
              <div className="pl-4 space-y-2">
                <div>
                  <Label className="text-xs">Entry Fee</Label>
                  <Input
                    type="number"
                    value={data.adminBetting?.sidePools?.closestToPin?.entryFee || 5}
                    onChange={(e) => handleSidePoolChange('closestToPin', 'entryFee', parseFloat(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Par 3 Holes (comma-separated)</Label>
                  <Input
                    placeholder="3, 8, 12, 16"
                    value={data.adminBetting?.sidePools?.closestToPin?.holes || ''}
                    onChange={(e) => handleSidePoolChange('closestToPin', 'holes', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Most Birdies */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Most Birdies</Label>
              <Switch
                checked={data.adminBetting?.sidePools?.mostBirdies?.enabled || false}
                onCheckedChange={(checked) => handleSidePoolChange('mostBirdies', 'enabled', checked)}
              />
            </div>
            {data.adminBetting?.sidePools?.mostBirdies?.enabled && (
              <div className="pl-4">
                <Label className="text-xs">Entry Fee</Label>
                <Input
                  type="number"
                  value={data.adminBetting?.sidePools?.mostBirdies?.entryFee || 10}
                  onChange={(e) => handleSidePoolChange('mostBirdies', 'entryFee', parseFloat(e.target.value))}
                  className="h-8"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Betting Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Live betting:</span>
            <span className="font-medium">
              {data.adminBetting?.liveEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Side pools:</span>
            <span className="font-medium">
              {[
                data.adminBetting?.sidePools?.longestDrive?.enabled && 'Longest Drive',
                data.adminBetting?.sidePools?.closestToPin?.enabled && 'Closest to Pin',
                data.adminBetting?.sidePools?.mostBirdies?.enabled && 'Most Birdies'
              ].filter(Boolean).length || 'None'}
            </span>
          </div>
          {data.adminBetting?.liveEnabled && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max bet:</span>
              <span className="font-medium">${data.adminBetting?.maxBetAmount || 100}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
        <Shield className="h-4 w-4 inline mr-1" />
        You can modify these settings anytime during the tournament from the admin panel
      </div>
    </div>
  );
};

export default MobileAdminBettingStep;
