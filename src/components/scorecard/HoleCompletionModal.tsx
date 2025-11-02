import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Flame } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import type { GameNotification } from '@/utils/gameCalculationOrchestrator';

interface HoleCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: GameNotification[];
  currentUserId: string;
}

export function HoleCompletionModal({
  open,
  onOpenChange,
  notifications,
  currentUserId
}: HoleCompletionModalProps) {
  const { triggerImpact, triggerNotification } = useHapticFeedback();

  // Filter notifications for current user
  const relevantNotifications = notifications.filter(notif =>
    notif.playersInvolved.includes(currentUserId)
  );

  useEffect(() => {
    if (open && relevantNotifications.length > 0) {
      // Trigger haptic feedback for the most important notification
      const hasPositive = relevantNotifications.some(n => n.isPositive);
      if (hasPositive) {
        triggerNotification('success');
      } else {
        triggerImpact('light');
      }

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [open, relevantNotifications, triggerNotification, triggerImpact, onOpenChange]);

  if (relevantNotifications.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'team':
        return <Trophy className="h-5 w-5 text-primary" />;
      case 'skins':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'wolf':
      case 'snake':
        return <span className="text-2xl">🐺</span>;
      default:
        return <TrendingUp className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Hole Complete!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {relevantNotifications.map((notif, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                notif.isPositive
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-muted border-border'
              }`}
            >
              <div className="mt-0.5">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed">
                  {notif.message}
                </p>
                {notif.type && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Tap anywhere to dismiss
        </p>
      </DialogContent>
    </Dialog>
  );
}
