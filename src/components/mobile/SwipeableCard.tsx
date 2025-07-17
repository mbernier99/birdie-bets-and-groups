import React, { useRef, useState, ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
  className?: string;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    setCurrentX(e.touches[0].clientX);
    const deltaX = e.touches[0].clientX - startX;
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX}px)`;
      cardRef.current.style.opacity = `${1 - Math.abs(deltaX) / 300}`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const deltaX = currentX - startX;
    
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(0)';
      cardRef.current.style.opacity = '1';
    }
    
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
  };

  return (
    <Card
      ref={cardRef}
      className={`touch-none transition-transform duration-200 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </Card>
  );
};

export default SwipeableCard;