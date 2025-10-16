import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Smile } from 'lucide-react';

interface QuickReactionsProps {
  onSendReaction: (emoji: string, message: string) => void;
  disabled?: boolean;
}

const reactions = [
  { emoji: '🔥', message: 'Nice shot!' },
  { emoji: '😬', message: 'Tough break' },
  { emoji: '💪', message: 'Great par' },
  { emoji: '🎯', message: 'Clutch putt' },
  { emoji: '⛳', message: 'On the green' },
  { emoji: '👏', message: 'Well played' },
];

export const QuickReactions: React.FC<QuickReactionsProps> = ({
  onSendReaction,
  disabled = false
}) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Smile className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Quick Reactions</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {reactions.map((reaction) => (
          <Button
            key={reaction.emoji}
            variant="outline"
            size="sm"
            onClick={() => onSendReaction(reaction.emoji, reaction.message)}
            disabled={disabled}
            className="h-auto flex flex-col items-center gap-1 py-2"
          >
            <span className="text-2xl">{reaction.emoji}</span>
            <span className="text-xs">{reaction.message}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
};
