import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, LogOut, Trash2, Key } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface SettingsTabProps {
  profile: any;
  onUpdate: () => void;
}

export const SettingsTab = ({ profile, onUpdate }: SettingsTabProps) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(
    profile.notification_preferences || {
      bet_notifications: true,
      score_updates: true,
      tournament_invites: true,
      chat_messages: true,
      sound_enabled: true,
      haptic_enabled: true,
    }
  );

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: preferences })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success("Notification preferences updated");
      onUpdate();
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success("Password reset email sent. Check your inbox.");
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error("Failed to send password reset email");
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out");
    }
  };

  const handleDeleteAccount = async () => {
    toast.error("Account deletion is not yet available. Please contact support.");
  };

  return (
    <div className="space-y-6 p-4">
      {/* Notification Preferences */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="bet_notifications" className="text-foreground">
              Bet Notifications
              <p className="text-sm text-muted-foreground font-normal">
                When someone presses you
              </p>
            </Label>
            <Switch
              id="bet_notifications"
              checked={preferences.bet_notifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, bet_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="score_updates" className="text-foreground">
              Score Updates
              <p className="text-sm text-muted-foreground font-normal">
                When opponents update scores
              </p>
            </Label>
            <Switch
              id="score_updates"
              checked={preferences.score_updates}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, score_updates: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="tournament_invites" className="text-foreground">
              Tournament Invites
              <p className="text-sm text-muted-foreground font-normal">
                When added to tournaments
              </p>
            </Label>
            <Switch
              id="tournament_invites"
              checked={preferences.tournament_invites}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, tournament_invites: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="chat_messages" className="text-foreground">
              Chat Messages
              <p className="text-sm text-muted-foreground font-normal">
                Tournament chat notifications
              </p>
            </Label>
            <Switch
              id="chat_messages"
              checked={preferences.chat_messages}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, chat_messages: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sound_enabled" className="text-foreground">
              Sound Effects
              <p className="text-sm text-muted-foreground font-normal">
                Play sounds for actions
              </p>
            </Label>
            <Switch
              id="sound_enabled"
              checked={preferences.sound_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, sound_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="haptic_enabled" className="text-foreground">
              Haptic Feedback
              <p className="text-sm text-muted-foreground font-normal">
                Vibration on mobile devices
              </p>
            </Label>
            <Switch
              id="haptic_enabled"
              checked={preferences.haptic_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, haptic_enabled: checked })
              }
            />
          </div>

          <Button onClick={handleSavePreferences} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-4">Account</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleChangePassword}
          >
            <Key className="mr-2 h-4 w-4" />
            Change Password
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
};
