
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title?: string;
}

const MobileHeader = ({ title }: MobileHeaderProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-emerald-100 md:hidden fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - LOOPR Logo */}
        <Link to="/" className="flex-shrink-0">
          <img 
            src="/lovable-uploads/loopr-logo.png" 
            alt="LOOPR Logo" 
            className="h-8 w-8 object-contain"
          />
        </Link>

        {/* Center - Title (if provided) */}
        {title && (
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        )}
        
        {/* Right side - Profile icon */}
        <div className="flex items-center">
          {user ? (
            <button
              onClick={() => signOut()}
              className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground"
              aria-label="Profile"
            >
              <User className="h-4 w-4" />
            </button>
          ) : (
            <Link 
              to="/auth"
              className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground"
              aria-label="Sign In"
            >
              <User className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
