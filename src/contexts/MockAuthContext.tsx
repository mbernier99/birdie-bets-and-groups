
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { MOCK_MODE, getMockSession, getCurrentMockUser } from '@/utils/mockData';
import { useAuth as useRealAuth } from './AuthContext';

interface MockAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

interface MockAuthProviderProps {
  children: React.ReactNode;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const realAuth = useRealAuth();
  const [mockUser, setMockUser] = useState<User | null>(null);
  const [mockSession, setMockSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (MOCK_MODE) {
      // Initialize mock session
      const session = getMockSession();
      setMockSession(session);
      setMockUser(session?.user || null);
      setLoading(false);

      // Listen for user changes in localStorage
      const handleStorageChange = () => {
        const newSession = getMockSession();
        setMockSession(newSession);
        setMockUser(newSession?.user || null);
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } else {
      // Use real auth
      setMockUser(realAuth.user);
      setMockSession(realAuth.session);
      setLoading(realAuth.loading);
    }
  }, [realAuth.user, realAuth.session, realAuth.loading]);

  const mockSignUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    if (MOCK_MODE) {
      console.log('Mock sign up:', { email, firstName, lastName });
      return { error: null };
    }
    return realAuth.signUp(email, password, firstName, lastName);
  };

  const mockSignIn = async (email: string, password: string) => {
    if (MOCK_MODE) {
      console.log('Mock sign in:', { email });
      return { error: null };
    }
    return realAuth.signIn(email, password);
  };

  const mockSignInWithGoogle = async () => {
    if (MOCK_MODE) {
      console.log('Mock Google sign in');
      return { error: null };
    }
    return realAuth.signInWithGoogle();
  };

  const mockSignOut = async () => {
    if (MOCK_MODE) {
      console.log('Mock sign out');
      localStorage.removeItem('mockUserId');
    } else {
      await realAuth.signOut();
    }
  };

  const mockRefreshSession = async () => {
    if (MOCK_MODE) {
      console.log('Mock refresh session');
    } else {
      await realAuth.refreshSession();
    }
  };

  const value = {
    user: MOCK_MODE ? mockUser : realAuth.user,
    session: MOCK_MODE ? mockSession : realAuth.session,
    loading: MOCK_MODE ? loading : realAuth.loading,
    signUp: mockSignUp,
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    signOut: mockSignOut,
    refreshSession: mockRefreshSession,
  };

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
};
