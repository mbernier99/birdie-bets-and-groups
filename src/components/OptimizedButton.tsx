import React, { memo } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface OptimizedButtonProps extends ButtonProps {
  hapticFeedback?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy';
  onClickOptimized?: () => void;
}

const OptimizedButton = memo<OptimizedButtonProps>(({ 
  children, 
  hapticFeedback = true, 
  hapticType = 'medium',
  onClickOptimized,
  onClick,
  ...props 
}) => {
  const { triggerImpact } = useHapticFeedback();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback) {
      await triggerImpact(hapticType);
    }
    
    onClick?.(e);
    onClickOptimized?.();
  };

  return (
    <Button 
      onClick={handleClick} 
      {...props}
      className={`
        touch-manipulation 
        active:scale-95 
        transition-transform 
        duration-100 
        ${props.className || ''}
      `}
    >
      {children}
    </Button>
  );
});

OptimizedButton.displayName = 'OptimizedButton';

export default OptimizedButton;