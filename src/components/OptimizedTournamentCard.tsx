import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, DollarSign } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import SwipeableCard from './mobile/SwipeableCard';
import OptimizedButton from './OptimizedButton';

interface Tournament {
  id: string;
  name: string;
  description?: string;
  course?: string;
  startTime?: string;
  participants?: number;
  maxPlayers?: number;
  entryFee?: number;
  status: string;
}

interface OptimizedTournamentCardProps {
  tournament: Tournament;
  onJoin?: (id: string) => void;
  onView?: (id: string) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const OptimizedTournamentCard = memo<OptimizedTournamentCardProps>(({
  tournament,
  onJoin,
  onView,
  onSwipeLeft,
  onSwipeRight
}) => {
  const { triggerImpact } = useHapticFeedback();
  const networkStatus = useNetworkStatus();

  const handleJoin = async () => {
    await triggerImpact('medium');
    onJoin?.(tournament.id);
  };

  const handleView = async () => {
    await triggerImpact('light');
    onView?.(tournament.id);
  };

  const cardContent = (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{tournament.name}</CardTitle>
            {tournament.description && (
              <CardDescription className="line-clamp-2">
                {tournament.description}
              </CardDescription>
            )}
          </div>
          <Badge 
            variant={tournament.status === 'active' ? 'default' : 'secondary'}
            className="shrink-0 ml-2"
          >
            {tournament.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          {tournament.course && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{tournament.course}</span>
            </div>
          )}
          {tournament.startTime && (
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span className="truncate">
                {new Date(tournament.startTime).toLocaleDateString()}
              </span>
            </div>
          )}
          {tournament.participants !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{tournament.participants}/{tournament.maxPlayers || '∞'}</span>
            </div>
          )}
          {tournament.entryFee && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>${tournament.entryFee}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          <OptimizedButton
            variant="outline"
            size="sm"
            className="flex-1"
            onClickOptimized={handleView}
            hapticType="light"
          >
            View Details
          </OptimizedButton>
          {tournament.status === 'open' && (
            <OptimizedButton
              size="sm"
              className="flex-1"
              onClickOptimized={handleJoin}
              hapticType="medium"
              disabled={networkStatus.isSlowConnection}
            >
              {networkStatus.isSlowConnection ? 'Slow Connection' : 'Join'}
            </OptimizedButton>
          )}
        </div>
      </CardContent>
    </>
  );

  // Use swipeable card on mobile platforms
  if (onSwipeLeft || onSwipeRight) {
    return (
      <SwipeableCard
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        className="h-full"
      >
        {cardContent}
      </SwipeableCard>
    );
  }

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200">
      {cardContent}
    </Card>
  );
});

OptimizedTournamentCard.displayName = 'OptimizedTournamentCard';

export default OptimizedTournamentCard;