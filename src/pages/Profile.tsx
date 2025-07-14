
import React from 'react';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-semibold text-xl">JD</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">John Doe</h2>
              <p className="text-gray-600">Handicap: 12</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value="john.doe@example.com" 
                readOnly 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="tel" 
                value="+1 (555) 123-4567" 
                readOnly 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home Course</label>
              <input 
                type="text" 
                value="Pebble Beach Golf Links" 
                readOnly 
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
};

export default Profile;
