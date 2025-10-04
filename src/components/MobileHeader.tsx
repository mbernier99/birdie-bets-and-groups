
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
            src="/lovable-uploads/loopr-logo-white.png" 
            alt="LOOPR Logo" 
            className="object-contain"
            style={{
              height: '50px',
              width: '50px'
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
              className={`flex items-center justify-center rounded-full transition-colors drop-shadow-lg ${
                isHomePage 
                  ? 'bg-white/20 backdrop-blur-sm text-white border-2 border-emerald-600 hover:bg-white/30' 
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
              style={{ height: '38px', width: '38px' }}
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </button>
          ) : (
            <Link 
              to="/auth"
              className={`flex items-center justify-center rounded-full transition-colors drop-shadow-lg ${
                isHomePage 
                  ? 'bg-white/20 backdrop-blur-sm text-white border-2 border-emerald-600 hover:bg-white/30' 
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
              style={{ height: '38px', width: '38px' }}
              aria-label="Sign In"
            >
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
