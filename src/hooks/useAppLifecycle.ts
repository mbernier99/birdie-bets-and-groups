import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export interface AppLifecycleHooks {
  onAppStateChange?: (isActive: boolean) => void;
  onLowMemory?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export const useAppLifecycle = (hooks: AppLifecycleHooks) => {
  const { onAppStateChange, onLowMemory, onPause, onResume } = hooks;

  const handleVisibilityChange = useCallback(() => {
    const isActive = !document.hidden;
    onAppStateChange?.(isActive);
    
    if (isActive) {
      onResume?.();
    } else {
      onPause?.();
    }
  }, [onAppStateChange, onPause, onResume]);

  const handleLowMemory = useCallback(() => {
    onLowMemory?.();
  }, [onLowMemory]);

  useEffect(() => {
    // Web events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', () => onPause?.());

    // Native app lifecycle events
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('appStateChange', ({ isActive }) => {
          onAppStateChange?.(isActive);
          if (isActive) {
            onResume?.();
          } else {
            onPause?.();
          }
        });

        App.addListener('pause', () => onPause?.());
        App.addListener('resume', () => onResume?.());
      }).catch(() => {
        console.log('App plugin not available');
      });
    }

    // Memory pressure warning (experimental)
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (performance as any).memory;
        if (memInfo && memInfo.usedJSHeapSize / memInfo.totalJSHeapSize > 0.8) {
          handleLowMemory();
        }
      };

      const memoryInterval = setInterval(checkMemory, 30000); // Check every 30s
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(memoryInterval);
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange, handleLowMemory, onPause, onResume, onAppStateChange]);
};