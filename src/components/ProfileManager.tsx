import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Camera, Edit3, Save, X } from 'lucide-react';
import { useMockAuth, MOCK_USERS, MockUser } from '@/contexts/MockAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ProfileManager: React.FC = () => {
  const { user, signInAs } = useMockAuth();
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleProfileUpdate = (updatedUser: MockUser) => {
    // Update the user in localStorage and context
    const updatedUsers = MOCK_USERS.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    );
    
    // Update MOCK_USERS array (this is a reference update for the session)
    Object.assign(MOCK_USERS, updatedUsers);
    
    // If this is the current user, update the context
    if (user?.id === updatedUser.id) {
      signInAs(updatedUser);
    }

    // Store updated users in localStorage for persistence
    localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
    
    setEditingUser(null);
    toast({
      title: "Profile updated",
      description: `${updatedUser.displayName}'s profile has been updated.`
    });
  };

  const handleImageUpload = async (file: File, userId: string) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Update user's avatar_url
      const userToUpdate = MOCK_USERS.find(u => u.id === userId);
      if (userToUpdate) {
        const updatedUser = { ...userToUpdate, avatar_url: data.publicUrl };
        handleProfileUpdate(updatedUser);
      }

    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Load users from localStorage on component mount
  React.useEffect(() => {
    const savedUsers = localStorage.getItem('mockUsers');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        Object.assign(MOCK_USERS, parsedUsers);
      } catch (error) {
        console.log('Failed to parse saved users');
      }
    }
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Bandon Dunes Golfers</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_USERS.map((golfer) => (
          <Card key={golfer.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={golfer.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10">
                      {golfer.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <label 
                    htmlFor={`avatar-${golfer.id}`}
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-3 w-3" />
                    <input
                      id={`avatar-${golfer.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, golfer.id);
                      }}
                      disabled={uploading}
                    />
                  </label>
                </div>
                
                <div className="flex-1">
                  <CardTitle className="text-base">{golfer.displayName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {golfer.role === 'organizer' ? 'Organizer' : 'Player'}
                  </p>
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingUser({ ...golfer })}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Edit Profile</SheetTitle>
                    </SheetHeader>
                    
                    {editingUser && editingUser.id === golfer.id && (
                      <ProfileEditForm 
                        user={editingUser}
                        onSave={handleProfileUpdate}
                        onCancel={() => setEditingUser(null)}
                      />
                    )}
                  </SheetContent>
                </Sheet>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-1 text-sm">
                {golfer.email && (
                  <p className="text-muted-foreground">{golfer.email}</p>
                )}
                {golfer.phone && (
                  <p className="text-muted-foreground">{golfer.phone}</p>
                )}
              </div>
              
              <Button 
                className="w-full mt-3" 
                variant={user?.id === golfer.id ? "default" : "outline"}
                onClick={() => signInAs(golfer)}
              >
                {user?.id === golfer.id ? "Current User" : "Switch to User"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface ProfileEditFormProps {
  user: MockUser;
  onSave: (user: MockUser) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          placeholder="Enter name"
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Enter email"
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Mobile</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Enter mobile number"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProfileManager;