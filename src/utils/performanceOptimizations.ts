// Performance optimization utilities

// Debounce function for expensive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for high-frequency events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Request batching utility
class RequestBatcher {
  private requests: Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
  }[]> = new Map();
  
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  async batch<T>(
    key: string,
    executor: () => Promise<T>,
    delay: number = 50
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }
      
      this.requests.get(key)!.push({ resolve, reject, timestamp: Date.now() });
      
      // Clear existing timeout
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key)!);
      }
      
      // Set new timeout
      const timeout = setTimeout(async () => {
        const requests = this.requests.get(key) || [];
        this.requests.delete(key);
        this.timeouts.delete(key);
        
        try {
          const result = await executor();
          requests.forEach(req => req.resolve(result));
        } catch (error) {
          requests.forEach(req => req.reject(error));
        }
      }, delay);
      
      this.timeouts.set(key, timeout);
    });
  }
}

export const requestBatcher = new RequestBatcher();

// Memory cleanup utilities
export const cleanupMemory = () => {
  // Force garbage collection if available (dev only)
  if (process.env.NODE_ENV === 'development' && 'gc' in window) {
    (window as any).gc();
  }
};

// Image lazy loading utility
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if ('IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }
  return null;
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name} took ${end - start} milliseconds`);
  }
  
  return end - start;
};

// Bundle size optimization - conditional imports
export const loadComponentLazily = (importFunc: () => Promise<any>) => {
  const React = require('react');
  return React.lazy(() => 
    importFunc().catch(() => ({
      default: () => React.createElement('div', {}, 'Failed to load component')
    }))
  );
};