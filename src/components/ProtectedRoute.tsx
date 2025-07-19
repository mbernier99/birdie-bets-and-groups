
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { Loader2 } from 'lucide-react';
import { MOCK_MODE } from '@/utils/mockData';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requireAdmin = false 
}) => {
  const { user, loading, session, refreshSession } = useMockAuth();
  const location = useLocation();

  // Check session validity and refresh if needed (skip in mock mode)
  useEffect(() => {
    if (!MOCK_MODE && session) {
      const expiresAt = new Date(session.expires_at! * 1000).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      
      // If token will expire in less than 5 minutes, refresh it
      if (timeUntilExpiry < 1000 * 60 * 5) {
        refreshSession();
      }
    }
  }, [session, refreshSession]);

  // Check for CSRF protection (skip in mock mode)
  useEffect(() => {
    if (!MOCK_MODE && user) {
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

  // In mock mode, always allow access
  if (MOCK_MODE) {
    return <>{children}</>;
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
