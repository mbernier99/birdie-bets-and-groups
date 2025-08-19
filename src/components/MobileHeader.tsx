
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const MobileHeader = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-emerald-100 md:hidden">
      <div className="flex items-center justify-center h-16 px-4 relative">
        {/* Centered Puffin Logo */}
        <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
          <img 
            src="/lovable-uploads/471c923e-8ed4-4255-8e79-e902970029d3.png" 
            alt="Puffin Logo" 
            className="h-10 w-10 object-contain"
          />
        </Link>
        
        {/* Right side user actions */}
        <div className="absolute right-4 flex items-center space-x-2">
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
