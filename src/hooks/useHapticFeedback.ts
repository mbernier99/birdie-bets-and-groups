import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export type HapticImpactStyle = 'light' | 'medium' | 'heavy';
export type HapticNotificationType = 'success' | 'warning' | 'error';

export const useHapticFeedback = () => {
  const triggerImpact = useCallback(async (style: HapticImpactStyle = 'medium') => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[style];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.log('Haptics not available');
    }
  }, []);

  const triggerNotification = useCallback(async (type: HapticNotificationType) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      
      const notificationType = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error
      }[type];

      await Haptics.notification({ type: notificationType });
    } catch (error) {
      console.log('Haptics not available');
    }
  }, []);

  const triggerSelection = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.selectionStart();
    } catch (error) {
      console.log('Haptics not available');
    }
  }, []);

  return {
    triggerImpact,
    triggerNotification,
    triggerSelection
  };
};