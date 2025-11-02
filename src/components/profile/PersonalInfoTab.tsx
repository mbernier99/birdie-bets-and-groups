import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

interface PersonalInfoTabProps {
  profile: any;
  onUpdate: () => void;
}

export const PersonalInfoTab = ({ profile, onUpdate }: PersonalInfoTabProps) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    nickname: profile.nickname || "",
    phone: profile.phone || "",
    home_course: profile.home_course || "",
    handicap: profile.handicap || "",
    ghin_number: profile.ghin_number || "",
    bio: profile.bio || "",
    preferred_tees: profile.preferred_tees || "blue",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          nickname: formData.nickname,
          phone: formData.phone,
          home_course: formData.home_course,
          handicap: formData.handicap ? parseFloat(formData.handicap) : null,
          ghin_number: formData.ghin_number,
          bio: formData.bio,
          preferred_tees: formData.preferred_tees,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyGHIN = () => {
    toast.info("GHIN verification coming soon! We'll integrate with the official GHIN API.");
  };

  if (!editing) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-end">
          <Button onClick={() => setEditing(true)}>Edit Profile</Button>
        </div>

        <div className="grid gap-4">
          <div>
            <Label className="text-muted-foreground">First Name</Label>
            <p className="text-lg text-foreground">{profile.first_name || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Last Name</Label>
            <p className="text-lg text-foreground">{profile.last_name || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Nickname</Label>
            <p className="text-lg text-foreground">{profile.nickname || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="text-lg text-foreground">{profile.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Phone</Label>
            <p className="text-lg text-foreground">{profile.phone || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Handicap Index</Label>
            <p className="text-lg text-foreground">{profile.handicap ?? "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">GHIN Number</Label>
            <div className="flex items-center gap-2">
              <p className="text-lg text-foreground">{profile.ghin_number || "—"}</p>
              {profile.ghin_number && profile.ghin_last_verified && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>
            {profile.ghin_last_verified && (
              <p className="text-sm text-muted-foreground mt-1">
                Verified {new Date(profile.ghin_last_verified).toLocaleDateString()}
              </p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Home Course</Label>
            <p className="text-lg text-foreground">{profile.home_course || "—"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Preferred Tees</Label>
            <p className="text-lg text-foreground capitalize">{profile.preferred_tees || "blue"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">About Me</Label>
            <p className="text-lg text-foreground whitespace-pre-wrap">{profile.bio || "—"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setEditing(false);
          setFormData({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            nickname: profile.nickname || "",
            phone: profile.phone || "",
            home_course: profile.home_course || "",
            handicap: profile.handicap || "",
            ghin_number: profile.ghin_number || "",
            bio: profile.bio || "",
            preferred_tees: profile.preferred_tees || "blue",
          });
        }}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            placeholder="Optional golf nickname"
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={profile.email} disabled className="bg-muted" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="handicap">Handicap Index</Label>
          <Input
            id="handicap"
            type="number"
            step="0.1"
            value={formData.handicap}
            onChange={(e) => setFormData({ ...formData, handicap: e.target.value })}
            placeholder="e.g., 16.5"
          />
        </div>
        <div>
          <Label htmlFor="ghin_number">GHIN Number</Label>
          <div className="flex gap-2">
            <Input
              id="ghin_number"
              value={formData.ghin_number}
              onChange={(e) => setFormData({ ...formData, ghin_number: e.target.value })}
              placeholder="Enter your GHIN number"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleVerifyGHIN}
            >
              Verify
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            GHIN verification will be available soon
          </p>
        </div>
        <div>
          <Label htmlFor="home_course">Home Course</Label>
          <Input
            id="home_course"
            value={formData.home_course}
            onChange={(e) => setFormData({ ...formData, home_course: e.target.value })}
            placeholder="e.g., Castlewood Country Club"
          />
        </div>
        <div>
          <Label htmlFor="preferred_tees">Preferred Tees</Label>
          <Select value={formData.preferred_tees} onValueChange={(value) => setFormData({ ...formData, preferred_tees: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="black">Black (Championship)</SelectItem>
              <SelectItem value="blue">Blue (Men's)</SelectItem>
              <SelectItem value="white">White (Senior)</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="red">Red (Forward)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="bio">About Me</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about your golf game..."
            rows={4}
            maxLength={200}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {formData.bio.length}/200 characters
          </p>
        </div>
      </div>
    </div>
  );
};
