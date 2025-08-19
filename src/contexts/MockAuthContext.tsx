import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MockUser {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  role: 'organizer' | 'player';
}

interface MockAuthContextType {
  user: MockUser | null;
  signInAs: (user: MockUser) => void;
  signOut: () => void;
  isAuthenticated: boolean;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

// Mock users for Bandon Dunes demo
export const MOCK_USERS: MockUser[] = [
  { id: '1', displayName: 'John Smith', email: 'john.smith@email.com', role: 'organizer' },
  { id: '2', displayName: 'Mike Johnson', email: 'mike.johnson@email.com', role: 'player' },
  { id: '3', displayName: 'David Wilson', email: 'david.wilson@email.com', role: 'player' },
  { id: '4', displayName: 'Chris Brown', email: 'chris.brown@email.com', role: 'player' },
  { id: '5', displayName: 'Matt Davis', email: 'matt.davis@email.com', role: 'player' },
  { id: '6', displayName: 'Steve Miller', email: 'steve.miller@email.com', role: 'player' },
  { id: '7', displayName: 'Tom Anderson', email: 'tom.anderson@email.com', role: 'player' },
  { id: '8', displayName: 'Rob Taylor', email: 'rob.taylor@email.com', role: 'player' },
  { id: '9', displayName: 'Jake Williams', phone: '+15551234567', role: 'player' },
  { id: '10', displayName: 'Ryan Jones', phone: '+15551234568', role: 'player' },
  { id: '11', displayName: 'Kevin Garcia', email: 'kevin.garcia@email.com', role: 'player' },
  { id: '12', displayName: 'Brian Rodriguez', phone: '+15551234569', role: 'player' },
];

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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