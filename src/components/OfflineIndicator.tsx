import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useOfflineStorage } from '../hooks/useOfflineStorage';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = "" }) => {
  const { isOnline, isSyncing, syncQueue } = useOfflineStorage();

  if (isOnline && syncQueue === 0) {
    return null; // Don't show anything when fully online and synced
  }

  return (
    <div className={`fixed top-4 left-4 z-50 ${className}`}>
      <Card className="shadow-lg bg-white border-l-4 border-l-emerald-500">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            
            <div className="text-sm">
              <div className="flex items-center space-x-2">
                <span className={isOnline ? 'text-green-700' : 'text-red-700'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                
                {isSyncing && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                    <span className="text-blue-700 text-xs">Syncing...</span>
                  </>
                )}
              </div>
              
              {syncQueue > 0 && (
                <div className="flex items-center space-x-1 mt-1">
                  <CloudOff className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-700">
                    {syncQueue} item{syncQueue !== 1 ? 's' : ''} pending sync
                  </span>
                </div>
              )}
            </div>
            
            {syncQueue > 0 && (
              <Badge variant="outline" className="text-xs">
                {syncQueue}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineIndicator;