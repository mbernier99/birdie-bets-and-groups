import { useCallback, useRef } from 'react';
import { createRateLimiter } from '@/utils/validators';

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

export const useRateLimiter = (options: RateLimiterOptions) => {
  const { maxRequests, windowMs, identifier = 'default' } = options;
  const rateLimiterRef = useRef(createRateLimiter(maxRequests, windowMs));

  const checkRateLimit = useCallback(() => {
    return rateLimiterRef.current(identifier);
  }, [identifier]);

  const withRateLimit = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    onRateLimited?: () => void
  ) => {
    return (...args: T): R | undefined => {
      if (checkRateLimit()) {
        return fn(...args);
      } else {
        onRateLimited?.();
        return undefined;
      }
    };
  }, [checkRateLimit]);

  return {
    checkRateLimit,
    withRateLimit
  };
};

// Specific rate limiters for different actions
export const useAuthRateLimit = () => {
  return useRateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: 'auth'
  });
};

export const useAPIRateLimit = () => {
  return useRateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'api'
  });
};

export const useFormSubmissionRateLimit = () => {
  return useRateLimiter({
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    identifier: 'form_submission'
  });
};