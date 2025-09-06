import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MockUser {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  role: 'organizer' | 'player';
  avatar_url?: string | null;
}

interface MockAuthContextType {
  user: MockUser | null;
  signInAs: (user: MockUser) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

// Bandon Dunes Golfers for testing
export const MOCK_USERS: MockUser[] = [
  { id: '1', displayName: 'Matt Bernier', email: 'matt.bernier@email.com', phone: '+15551234501', role: 'organizer', avatar_url: null },
  { id: '2', displayName: 'Erin Whalen', email: 'erin.whalen@email.com', phone: '+15551234502', role: 'player', avatar_url: null },
  { id: '3', displayName: 'Scott Gannon', email: 'scott.gannon@email.com', phone: '+15551234503', role: 'player', avatar_url: null },
  { id: '4', displayName: 'Matt Traiman', email: 'matt.traiman@email.com', phone: '+15551234504', role: 'player', avatar_url: null },
  { id: '5', displayName: 'Drew Tornga', email: 'drew.tornga@email.com', phone: '+15551234505', role: 'player', avatar_url: null },
  { id: '6', displayName: 'Hector Saldivar', email: 'hector.saldivar@email.com', phone: '+15551234506', role: 'player', avatar_url: null },
  { id: '7', displayName: 'Lee Crocker', email: 'lee.crocker@email.com', phone: '+15551234507', role: 'player', avatar_url: null },
  { id: '8', displayName: "Whalen's Guest", email: 'guest@email.com', phone: '+15551234508', role: 'player', avatar_url: null },
];

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Auto-login as the first user (Matt Bernier, the organizer) if no saved user
      const defaultUser = MOCK_USERS[0]; // Matt Bernier
      setUser(defaultUser);
      localStorage.setItem('mockUser', JSON.stringify(defaultUser));
    }
  }, []);

  const signInAs = (user: MockUser) => {
    setUser(user);
    localStorage.setItem('mockUser', JSON.stringify(user));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  return (
    <MockAuthContext.Provider value={{
      user,
      signInAs,
      signOut,
      isAuthenticated: !!user
    }}>
      {children}
    </MockAuthContext.Provider>
  );
};

export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};