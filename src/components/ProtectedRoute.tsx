import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requireAdmin = false 
}) => {
  const { user, loading, session, refreshSession } = useAuth();
  const location = useLocation();

  // Check session validity and refresh if needed
  useEffect(() => {
    if (session) {
      const expiresAt = new Date(session.expires_at! * 1000).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // If token will expire in less than 5 minutes, refresh it
      if (timeUntilExpiry < 1000 * 60 * 5) {
        refreshSession();
      }
    }
  }, [session, refreshSession]);

  // Check for CSRF protection
  useEffect(() => {
    // Save current page to localStorage to prevent CSRF attacks
    if (user) {
      localStorage.setItem('lastAuthenticatedPath', location.pathname);
    }
  }, [location.pathname, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If no user is authenticated, redirect to auth page
  if (!user) {
    // Store the attempted URL for redirect after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // For future admin-only routes
  if (requireAdmin) {
    // TODO: Implement admin role check
    // This would require checking against a roles table in the database
    // For now we return the children as we haven't implemented roles yet
  }

  return <>{children}</>;
};

export default ProtectedRoute;