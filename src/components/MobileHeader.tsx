
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const MobileHeader = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-emerald-100 md:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/fc297cde-a9d2-4fb0-acf6-d28aacc56592.png" 
            alt="Suntory Cup" 
            className="h-10 w-10"
          />
        </Link>
        
        <div className="flex items-center space-x-2">
          {user ? (
            <Button
              onClick={() => signOut()}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Link 
              to="/auth"
              className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700"
            >
              <User className="h-4 w-4" />
              <span className="text-sm">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
