
import React, { useState } from 'react';
import { User, Edit, Save, X, Trophy, Target } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Smith',
    email: 'john.smith@email.com',
    ghinNumber: '1234567',
    handicapIndex: 12.4,
    preferredTees: 'Blue',
    homeCourse: 'Pine Valley Golf Club'
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    console.log('Profile saved:', editedProfile);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const validateGHIN = async (ghinNumber: string) => {
    // Simulated GHIN validation - in real implementation would call GHIN API
    console.log('Validating GHIN:', ghinNumber);
    return ghinNumber.length === 7;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <User className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                  <p className="text-gray-600">Manage your golf profile and handicap information</p>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={isEditing ? editedProfile.name : profile.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? editedProfile.email : profile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
              </div>
            </div>

            {/* GHIN & Handicap */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">GHIN & Handicap</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ghin">GHIN Number</Label>
                  <Input
                    id="ghin"
                    value={isEditing ? editedProfile.ghinNumber : profile.ghinNumber}
                    onChange={(e) => setEditedProfile({...editedProfile, ghinNumber: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="handicap">Current Handicap Index</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="handicap"
                      value={profile.handicapIndex}
                      disabled
                      className="bg-gray-50"
                    />
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Trophy className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Automatically updated from GHIN</p>
                </div>
              </div>
            </div>

            {/* Golf Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Golf Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tees">Preferred Tees</Label>
                  <select
                    id="tees"
                    value={isEditing ? editedProfile.preferredTees : profile.preferredTees}
                    onChange={(e) => setEditedProfile({...editedProfile, preferredTees: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background ${!isEditing ? "bg-gray-50" : ""}`}
                  >
                    <option value="Black">Black Tees</option>
                    <option value="Blue">Blue Tees</option>
                    <option value="White">White Tees</option>
                    <option value="Gold">Gold Tees</option>
                    <option value="Red">Red Tees</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Home Course</Label>
                  <Input
                    id="course"
                    value={isEditing ? editedProfile.homeCourse : profile.homeCourse}
                    onChange={(e) => setEditedProfile({...editedProfile, homeCourse: e.target.value})}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Your home golf course"
                  />
                </div>
              </div>
            </div>

            {/* Handicap Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Handicap Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Current Index</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">{profile.handicapIndex}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Lowest Index</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">8.2</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Rounds Posted</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">47</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
