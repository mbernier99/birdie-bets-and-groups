import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, DollarSign, TrendingUp } from 'lucide-react';
import { profileSchema, validateAndSanitizeForm } from '@/utils/validators';
import { handleSecureError, logSecurityEvent } from '@/utils/securityHelpers';
import { useProfileStats } from '@/hooks/useProfileStats';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface ProfileData {
  first_name: string;
  last_name: string;
  nickname: string;
  email: string;
  phone: string;
  home_course: string;
  handicap: number;
}

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileSheet = ({ open, onOpenChange }: ProfileSheetProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { stats, loading: statsLoading } = useProfileStats(user?.id);

  useEffect(() => {
    if (user && open) {
      fetchProfile();
    }
  }, [user, open]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Validate and sanitize form data
      const formData = {
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        phone: profile?.phone || '',
        handicap: (profile?.handicap || 0).toString(),
        homeCourse: profile?.home_course || '',
      };

      const validation = validateAndSanitizeForm(profileSchema, formData);

      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors || {}).join(', ');
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
        logSecurityEvent('profile_validation_failed', { errors: validation.errors });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: validation.data!.firstName,
          last_name: validation.data!.lastName,
          nickname: profile?.nickname || null,
          phone: validation.data!.phone || null,
          handicap: validation.data!.handicap ? Math.round(validation.data!.handicap) : null,
          home_course: validation.data!.homeCourse || null,
        })
        .eq('id', user.id);

      if (error) {
        const errorMessage = handleSecureError(error, 'profile_update');
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        logSecurityEvent('profile_update_failed', { userId: user.id, error: error.message });
        return;
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      
      setEditing(false);
      logSecurityEvent('profile_updated', { userId: user.id });
    } catch (error) {
      const errorMessage = handleSecureError(error, 'profile_update');
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      logSecurityEvent('profile_update_error', { userId: user.id, error: error.message });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const firstInitial = profile?.first_name?.charAt(0) || '';
    const lastInitial = profile?.last_name?.charAt(0) || '';
    return `${firstInitial}${lastInitial}` || 'U';
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditing(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Profile</SheetTitle>
          <SheetDescription>
            Manage your account and preferences
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Profile Header with Avatar */}
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                {profile?.nickname && (
                  <p className="text-sm text-muted-foreground">"{profile.nickname}"</p>
                )}
                <p className="text-sm text-muted-foreground">Handicap: {profile?.handicap ?? '—'}</p>
              </div>
            </div>

            {/* Quick Stats */}
            {!statsLoading && (
              <div className="grid grid-cols-2 gap-3 py-3 border-y">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs">Win Rate</span>
                  </div>
                  <div className="text-lg font-bold text-foreground">{stats.winRate}%</div>
                </div>
                <div className="text-center border-l">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="text-xs">Net Winnings</span>
                  </div>
                  <div className={`text-lg font-bold ${stats.netWinnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${stats.netWinnings >= 0 ? '+' : ''}{stats.netWinnings}
                  </div>
                </div>
              </div>
            )}

            {/* View Full Profile Button */}
            <Link to="/profile" onClick={() => onOpenChange(false)}>
              <Button variant="outline" className="w-full justify-between">
                View Full Profile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Quick Edit Section */}
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground">Quick Edit</h4>
                {!editing && (
                  <Button size="sm" onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
            
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-sm">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile?.first_name || ''}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      disabled={!editing}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile?.last_name || ''}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      disabled={!editing}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="handicap" className="text-sm">Handicap</Label>
                  <Input
                    id="handicap"
                    type="number"
                    value={profile?.handicap || ''}
                    onChange={(e) => setProfile({ ...profile, handicap: parseInt(e.target.value) || 0 })}
                    disabled={!editing}
                    placeholder="Enter your handicap"
                    className="h-9"
                  />
                </div>
              </div>

              {editing && (
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveProfile} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};