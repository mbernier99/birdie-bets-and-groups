import React, { useRef, useState, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  pullThreshold?: number;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  pullThreshold = 80,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop !== 0) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    if (deltaY > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(deltaY, pullThreshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  const refreshIconStyle = {
    transform: `rotate(${(pullDistance / pullThreshold) * 360}deg)`,
    opacity: Math.min(pullDistance / pullThreshold, 1)
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isPulling ? `translateY(${Math.min(pullDistance / 2, 40)}px)` : 'none',
        transition: isPulling ? 'none' : 'transform 0.3s ease'
      }}
    >
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 -mt-16 text-muted-foreground"
        style={{
          transform: `translateY(${Math.min(pullDistance / 2, 40)}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        <RefreshCw 
          size={24} 
          style={refreshIconStyle}
          className={isRefreshing ? 'animate-spin' : ''}
        />
        <span className="ml-2 text-sm">
          {isRefreshing 
            ? 'Refreshing...' 
            : pullDistance >= pullThreshold 
              ? 'Release to refresh' 
              : 'Pull to refresh'
          }
        </span>
      </div>
      
      {children}
    </div>
  );
};

export default PullToRefresh;