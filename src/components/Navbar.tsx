
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
          <div className="flex justify-center items-center h-16 relative">
            {/* Centered Puffin Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img 
                src="/lovable-uploads/471c923e-8ed4-4255-8e79-e902970029d3.png" 
                alt="Puffin Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
            
            {/* Left side navigation */}
            <div className="absolute left-0 flex items-center space-x-8">
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
            
            {/* Right side user actions */}
            <div className="absolute right-0 flex items-center space-x-4">
              {user ? (
                <>
                  <button 
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <Link 
                  to="/auth"
                  className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
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
