import React from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const NetworkStatusIndicator = () => {
  const { isOnline, isSlowConnection, connectionType } = useNetworkStatus();

  if (isOnline && !isSlowConnection) return null;

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 ${
      !isOnline ? 'bg-red-500' : 'bg-yellow-500'
    } text-white py-2 px-4 text-center text-sm font-medium`}>
      <div className="flex items-center justify-center space-x-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>No internet connection - Scores will sync when reconnected</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4" />
            <span>Slow connection ({connectionType}) - Some features may be delayed</span>
          </>
        )}
      </div>
    </div>
  );
};
