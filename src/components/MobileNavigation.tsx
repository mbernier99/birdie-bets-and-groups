
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Target, User, Home, TrendingUp } from 'lucide-react';
import { ProfileSheet } from './ProfileSheet';

const MobileNavigation = () => {
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tracker', icon: Target, label: 'Track' },
    { path: '/tournaments', icon: TrendingUp, label: 'Bets' },
  ];
  
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 shadow-lg z-50 md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center min-w-[60px] h-14 rounded-lg transition-colors ${
                isActive(path)
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex flex-col items-center justify-center min-w-[60px] h-14 rounded-lg transition-colors text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
          >
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
      
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
};

export default MobileNavigation;
