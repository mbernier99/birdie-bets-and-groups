
import React, { memo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Target, User, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import MobileHeader from './MobileHeader';
import MobileNavigation from './MobileNavigation';
import { ProfileSheet } from './ProfileSheet';

const Navbar = memo(() => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <>
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-lg border-b border-emerald-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and navigation */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex-shrink-0">
                <img 
                  src="/lovable-uploads/loopr-logo.png" 
                  alt="LOOPR Logo" 
                  className="h-10 w-10 object-contain"
                />
              </Link>
              <Link 
                to="/" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/tournaments" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/tournaments') 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Tournaments</span>
              </Link>

              <Link 
                to="/rules" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/rules') 
                    ? 'text-emerald-600 bg-emerald-50' 
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Rules</span>
              </Link>
            </div>
            
            {/* Right side - Profile */}
            <div className="flex items-center">
              {user ? (
                <button 
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                  aria-label="Profile"
                >
                  <User className="h-4 w-4" />
                </button>
              ) : (
                <Link 
                  to="/auth"
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                  aria-label="Sign In"
                >
                  <User className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
      
      {/* Profile Sheet */}
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
});

export default Navbar;
