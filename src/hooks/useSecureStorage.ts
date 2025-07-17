import { useState, useEffect, useCallback } from 'react';
import { secureStorage } from '@/utils/securityHelpers';

// Custom hook for secure localStorage operations
export const useSecureStorage = <T>(key: string, defaultValue: T, encrypt: boolean = true) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedValue = secureStorage.getItem(key, encrypt);
      if (storedValue !== null) {
        setValue(storedValue);
      }
    } catch (error) {
      console.error(`Error loading ${key} from secure storage:`, error);
    } finally {
      setLoading(false);
    }
  }, [key, encrypt]);

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      secureStorage.setItem(key, valueToStore, encrypt);
    } catch (error) {
      console.error(`Error saving ${key} to secure storage:`, error);
    }
  }, [key, value, encrypt]);

  const removeStoredValue = useCallback(() => {
    try {
      setValue(defaultValue);
      secureStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from secure storage:`, error);
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue: setStoredValue,
    removeValue: removeStoredValue,
    loading
  };
};

// Hook for managing tournament draft data securely
export const useTournamentDraft = () => {
  return useSecureStorage('tournament_draft', null, true);
};

// Hook for managing user preferences securely
export const useUserPreferences = () => {
  return useSecureStorage('user_preferences', {
    theme: 'light',
    notifications: true,
    autoSave: true
  }, false);
};