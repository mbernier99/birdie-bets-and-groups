
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, Target, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-white shadow-lg border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">GolfBet Pro</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
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
              to="/groups" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/groups') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Groups</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <button className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
