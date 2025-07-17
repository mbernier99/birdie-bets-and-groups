import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'default',
  ...props 
}) => {
  const baseClasses = "animate-pulse bg-muted rounded";
  
  const variantClasses = {
    default: "h-4 w-full",
    card: "h-32 w-full",
    text: "h-3 w-3/4",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24"
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  );
};

// Page-specific skeleton components
export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton variant="text" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const TournamentSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton variant="avatar" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton variant="text" />
      </div>
    </div>
    <Skeleton variant="card" />
  </div>
);

export { Skeleton };