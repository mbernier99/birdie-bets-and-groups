
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Zap, Users, Flag } from 'lucide-react';

const MobileNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/leaderboard', icon: TrendingUp, label: 'Leaderboard' },
    { path: '/groups', icon: Users, label: 'Groups' },
    { path: '/game-formats', icon: Flag, label: 'Games' },
  ];
  
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-emerald-100 shadow-lg z-50 md:hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(/lovable-uploads/125757c3-6d74-4891-ad71-d309d3795a1a.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="relative flex justify-around items-center h-16 px-2">
        {/* Left items */}
        {navItems.slice(0, 2).map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center flex-1 h-14 rounded-lg transition-colors ${
              isActive(path)
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
        
        {/* Center Bet Button - Floating */}
        <Link
          to="/bet"
          className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center justify-center"
        >
          <div className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all ${
            isActive('/bet')
              ? 'bg-emerald-600 scale-110'
              : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-105'
          }`}>
            <Zap className="h-8 w-8 text-white fill-white" />
          </div>
          <span className="text-xs font-medium text-emerald-600 mt-1">Bet</span>
        </Link>
        
        {/* Spacer for center button */}
        <div className="flex-1" />
        
        {/* Right items */}
        {navItems.slice(2).map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center flex-1 h-14 rounded-lg transition-colors ${
              isActive(path)
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
