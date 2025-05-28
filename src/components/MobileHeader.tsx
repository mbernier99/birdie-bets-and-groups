
import React from 'react';
import { Link } from 'react-router-dom';

const MobileHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-emerald-100 md:hidden">
      <div className="flex items-center justify-center h-16 px-4">
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/fc297cde-a9d2-4fb0-acf6-d28aacc56592.png" 
            alt="Suntory Cup" 
            className="h-10 w-10"
          />
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
