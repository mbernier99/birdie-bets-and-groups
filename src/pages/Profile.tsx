import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import MobileNavigation from "@/components/MobileNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoTab } from "@/components/profile/PersonalInfoTab";
import { StatsTab } from "@/components/profile/StatsTab";
import { SettingsTab } from "@/components/profile/SettingsTab";
import { AvatarUploadModal } from "@/components/profile/AvatarUploadModal";
import { useProfileStats } from "@/hooks/useProfileStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const { stats, loading: statsLoading, refetch: refetchStats } = useProfileStats(user?.id);

  // Redirect to quick-login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/quick-login');
    }
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleUpdate = () => {
    fetchProfile();
    refetchStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {isMobile ? <MobileHeader /> : <Navbar />}
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
        {isMobile && <MobileNavigation />}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        {isMobile ? <MobileHeader /> : <Navbar />}
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Profile not found</p>
        </div>
        {isMobile && <MobileNavigation />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isMobile ? <MobileHeader /> : <Navbar />}
      
      <ProfileHeader 
        profile={profile} 
        stats={stats}
        onAvatarClick={() => setAvatarModalOpen(true)}
      />

      <div className="container max-w-2xl mx-auto px-4 py-6 pb-24">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Personal Info</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <PersonalInfoTab profile={profile} onUpdate={handleUpdate} />
          </TabsContent>

          <TabsContent value="stats" className="mt-4">
            <StatsTab stats={stats} loading={statsLoading} />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <SettingsTab profile={profile} onUpdate={handleUpdate} />
          </TabsContent>
        </Tabs>
      </div>

      {isMobile && <MobileNavigation />}

      <AvatarUploadModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        userId={user?.id || ''}
        onUploadSuccess={handleUpdate}
      />
    </div>
  );
};

export default Profile;
