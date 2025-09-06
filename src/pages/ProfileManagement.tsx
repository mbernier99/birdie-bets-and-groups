import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileManager from '@/components/ProfileManager';
import { useMockAuth } from '@/contexts/MockAuthContext';

const ProfileManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useMockAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold">Profile Management</h1>
          </div>
          
          {user && (
            <div className="text-sm text-muted-foreground">
              Current: {user.displayName}
            </div>
          )}
        </div>
      </header>

      <main className="container py-6">
        <ProfileManager />
      </main>
    </div>
  );
};

export default ProfileManagement;