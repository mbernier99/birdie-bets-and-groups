
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-emerald-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-600">
              Sorry, we couldn't find the page you're looking for. 
              The page might have been moved or doesn't exist.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors w-full sm:w-auto"
            >
              <Home className="h-5 w-5" />
              <span>Go Home</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center space-x-2 border border-emerald-200 text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors w-full sm:w-auto ml-0 sm:ml-3"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default NotFound;
