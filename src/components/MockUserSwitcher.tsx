import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMockAuth, MOCK_USERS } from '@/contexts/MockAuthContext';
import { User, LogOut } from 'lucide-react';

const MockUserSwitcher: React.FC = () => {
  const { user, signInAs, signOut, isAuthenticated } = useMockAuth();

  return (
    <div className="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <User className="h-4 w-4" />
        <span>Demo Mode</span>
      </div>
      
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <div className="font-medium">{user?.displayName}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Select onValueChange={(userId) => {
          const selectedUser = MOCK_USERS.find(u => u.id === userId);
          if (selectedUser) signInAs(selectedUser);
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sign in as..." />
          </SelectTrigger>
          <SelectContent>
            {MOCK_USERS.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{user.displayName}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default MockUserSwitcher;