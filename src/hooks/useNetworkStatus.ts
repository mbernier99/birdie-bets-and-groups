import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  isSlowConnection: boolean;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    isSlowConnection: false
  });

  useEffect(() => {
    const updateNetworkStatus = async () => {
      const isOnline = navigator.onLine;
      let connectionType = 'unknown';
      let isSlowConnection = false;

      if (Capacitor.isNativePlatform()) {
        try {
          const { Network } = await import('@capacitor/network');
          const status = await Network.getStatus();
          connectionType = status.connectionType;
          isSlowConnection = status.connectionType === 'none' || 
                           (connectionType && ['2g', 'slow'].some(slow => connectionType.includes(slow)));
        } catch (error) {
          console.log('Network plugin not available');
        }
      } else {
        // Web API for connection type
        const connection = (navigator as any).connection || 
                          (navigator as any).mozConnection || 
                          (navigator as any).webkitConnection;
        
        if (connection) {
          connectionType = connection.effectiveType || connection.type || 'unknown';
          isSlowConnection = connection.effectiveType === 'slow-2g' || 
                           connection.effectiveType === '2g' ||
                           connection.downlink < 1;
        }
      }

      setNetworkStatus({
        isOnline,
        connectionType,
        isSlowConnection
      });
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    updateNetworkStatus();

    // Set up network status listener for native platforms
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/network').then(({ Network }) => {
        Network.addListener('networkStatusChange', updateNetworkStatus);
      }).catch(() => {
        console.log('Network plugin not available');
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return networkStatus;
};