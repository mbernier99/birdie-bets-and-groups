
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title?: string;
}

const MobileHeader = ({ title }: MobileHeaderProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <header className={`md:hidden fixed top-0 left-0 right-0 z-50 ${
      isHomePage 
        ? 'bg-transparent' 
        : 'bg-white shadow-sm border-b border-emerald-100'
    }`}>
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - LOOPR Logo */}
        <Link to="/" className="flex-shrink-0 drop-shadow-lg">
          <img 
            src="/lovable-uploads/loopr-logo-new.png" 
            alt="LOOPR Logo" 
            className="object-contain"
            style={{
              height: '41.4px',
              width: '41.4px',
              ...(isHomePage ? { filter: 'brightness(0) invert(1)' } : {})
            }}
          />
        </Link>

        {/* Center - Title (if provided) */}
        {title && (
          <h1 className={`text-lg font-bold ${isHomePage ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}>
            {title}
          </h1>
        )}
        
        {/* Right side - Profile icon */}
        <div className="flex items-center">
          {user ? (
            <button
              onClick={() => signOut()}
              className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors drop-shadow-lg ${
                isHomePage 
                  ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30' 
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
              aria-label="Profile"
            >
              <User className="h-4 w-4" />
            </button>
          ) : (
            <Link 
              to="/auth"
              className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors drop-shadow-lg ${
                isHomePage 
                  ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30' 
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
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
