import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleSecureError, logSecurityEvent, secureStorage } from '@/utils/securityHelpers';
import { useAuthRateLimit } from '@/hooks/useRateLimiter';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Constants for security settings
const SESSION_REFRESH_INTERVAL = 1000 * 60 * 30; // 30 minutes
const SESSION_EXPIRY_BUFFER = 1000 * 60 * 5; // 5 minutes before expiry

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { withRateLimit } = useAuthRateLimit();

  // Function to refresh the session with exponential backoff
  const refreshSession = async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const BACKOFF_BASE = 2000; // 2 seconds

    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        // Retry with exponential backoff if network-related error
        if (retryCount < MAX_RETRIES && (error.message.includes('network') || error.message.includes('fetch'))) {
          const backoffDelay = BACKOFF_BASE * Math.pow(2, retryCount);
          console.log(`Session refresh failed, retrying in ${backoffDelay}ms...`);
          
          setTimeout(() => {
            refreshSession(retryCount + 1);
          }, backoffDelay);
          return;
        }
        
        console.error('Failed to refresh session:', error);
        
        // Cache failure for offline recovery - store last known session
        if (session) {
          localStorage.setItem('last_valid_session', JSON.stringify({
            expires_at: session.expires_at,
            user_id: session.user.id,
            cached_at: Date.now()
          }));
        }
        return;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        // Clear cached session on successful refresh
        localStorage.removeItem('last_valid_session');
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      
      // Attempt to recover from cache
      const cachedSession = localStorage.getItem('last_valid_session');
      if (cachedSession && retryCount < MAX_RETRIES) {
        const backoffDelay = BACKOFF_BASE * Math.pow(2, retryCount);
        setTimeout(() => {
          refreshSession(retryCount + 1);
        }, backoffDelay);
      }
    }
  };

  // Setup periodic session refresh
  useEffect(() => {
    if (!session) return;
    
    // Calculate time until token expiry
    const expiresAt = new Date(session.expires_at! * 1000).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now - SESSION_EXPIRY_BUFFER;
    
    // If token will expire soon, refresh it immediately
    if (timeUntilExpiry < SESSION_EXPIRY_BUFFER) {
      refreshSession();
    }
    
    // Set up periodic refresh
    const refreshInterval = setInterval(refreshSession, SESSION_REFRESH_INTERVAL);
    
    return () => clearInterval(refreshInterval);
  }, [session]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only use synchronous state updates in the callback
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle auth events
        if (event === 'SIGNED_IN') {
          // Defer additional actions with setTimeout to prevent deadlocks
          setTimeout(() => {
            toast({
              title: 'Signed in',
              description: 'You have successfully signed in.',
            });
            
            // Handle OAuth redirects
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
              sessionStorage.removeItem('redirectAfterLogin');
              window.location.href = redirectPath;
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setTimeout(() => {
            toast({
              title: 'Signed out',
              description: 'You have been signed out.',
            });
            
            // Clean up any sensitive data from localStorage on sign out
            const keysToPreserve = ['accountLock']; // Keep account security measures
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && !keysToPreserve.includes(key) && 
                  (key.includes('user') || 
                   key.includes('token') || 
                   key.includes('auth') ||
                   key.includes('profile'))) {
                localStorage.removeItem(key);
              }
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = withRateLimit(async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        logSecurityEvent('sign_up_failed', { email, error: error.message });
        return { error: new Error(handleSecureError(error, 'authentication')) };
      }

      logSecurityEvent('sign_up_success', { email });
      return { error };
    } catch (error: any) {
      logSecurityEvent('sign_up_error', { email, error: error.message });
      return { error: new Error(handleSecureError(error, 'authentication')) };
    }
  }, () => {
    logSecurityEvent('sign_up_rate_limited', {});
    return { error: new Error('Too many signup attempts. Please try again later.') };
  });

  const signIn = withRateLimit(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logSecurityEvent('sign_in_failed', { email, error: error.message });
        return { error: new Error(handleSecureError(error, 'authentication')) };
      }

      logSecurityEvent('sign_in_success', { email });
      return { error: null };
    } catch (error: any) {
      logSecurityEvent('sign_in_error', { email, error: error.message });
      return { error: new Error(handleSecureError(error, 'authentication')) };
    }
  }, () => {
    logSecurityEvent('sign_in_rate_limited', {});
    return { error: new Error('Too many login attempts. Please try again later.') };
  });

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          // Note: PKCE is the default for Supabase Auth OAuth
        }
      });
      return { error };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clear secure storage on logout
      secureStorage.clearExpired();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logSecurityEvent('sign_out_failed', { error: error.message });
        throw new Error(handleSecureError(error, 'authentication'));
      }

      logSecurityEvent('sign_out_success', {});
    } catch (error: any) {
      logSecurityEvent('sign_out_error', { error: error.message });
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};