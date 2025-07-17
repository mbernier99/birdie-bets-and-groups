import CryptoJS from 'crypto-js';

// Encryption/Decryption for sensitive data in localStorage
const ENCRYPTION_KEY = 'golf-tracker-secure-key'; // In production, this should be generated per session

export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
};

export const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: any, encrypt: boolean = true) => {
    try {
      const dataToStore = encrypt ? encryptData(value) : JSON.stringify(value);
      localStorage.setItem(key, dataToStore);
      
      // Set expiration timestamp
      const expirationKey = `${key}_expires`;
      const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      localStorage.setItem(expirationKey, expirationTime.toString());
    } catch (error) {
      console.error('Secure storage setItem failed:', error);
    }
  },

  getItem: (key: string, encrypted: boolean = true): any => {
    try {
      // Check if data has expired
      const expirationKey = `${key}_expires`;
      const expirationTime = localStorage.getItem(expirationKey);
      
      if (expirationTime && Date.now() > parseInt(expirationTime)) {
        secureStorage.removeItem(key);
        return null;
      }

      const storedData = localStorage.getItem(key);
      if (!storedData) return null;

      return encrypted ? decryptData(storedData) : JSON.parse(storedData);
    } catch (error) {
      console.error('Secure storage getItem failed:', error);
      return null;
    }
  },

  removeItem: (key: string) => {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_expires`);
  },

  clearExpired: () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.endsWith('_expires')) {
        const expirationTime = localStorage.getItem(key);
        if (expirationTime && Date.now() > parseInt(expirationTime)) {
          const dataKey = key.replace('_expires', '');
          secureStorage.removeItem(dataKey);
        }
      }
    });
  }
};

// Security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://oxwauckpccujkwfagogf.supabase.co https://api.golf.com; font-src 'self' data:;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()'
};

// Input validation for dangerous patterns
export const validateInput = (input: string): boolean => {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
};

// Secure error handling
export const handleSecureError = (error: any, context: string): string => {
  // Log the full error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error in ${context}:`, error);
  }

  // Return generic error messages for production
  const genericMessages: Record<string, string> = {
    authentication: 'Authentication failed. Please try again.',
    database: 'Unable to process request. Please try again later.',
    validation: 'Invalid input provided. Please check your data.',
    network: 'Network error. Please check your connection.',
    permission: 'You do not have permission to perform this action.',
    default: 'An unexpected error occurred. Please try again.'
  };

  // Determine error type and return appropriate message
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('auth') || errorMessage.includes('login')) {
    return genericMessages.authentication;
  }
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return genericMessages.network;
  }
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return genericMessages.permission;
  }
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return genericMessages.validation;
  }
  
  return genericMessages.default;
};

// Security event logging
export const logSecurityEvent = (event: string, details: any = {}) => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', securityLog);
  }

  // In production, you would send this to your logging service
  // Example: sendToLoggingService(securityLog);
};