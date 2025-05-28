
import React, { useState } from 'react';
import { Users, Plus, Crown, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import CreateGroupModal from '../components/CreateGroupModal';

const Groups = () => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const mockGroups = [
    {
      id: 1,
      name: 'Weekend Warriors',
      members: 12,
      maxMembers: 16,
      isOwner: true,
      isPrivate: true,
      gameTypes: ['Best Ball', 'Nassau']
    },
    {
      id: 2,
      name: 'Pine Valley Regulars',
      members: 8,
      maxMembers: 12,
      isOwner: false,
      isPrivate: false,
      gameTypes: ['Wolf', 'Match Play']
    },
    {
      id: 3,
      name: 'Corporate League',
      members: 24,
      maxMembers: 32,
      isOwner: false,
      isPrivate: true,
      gameTypes: ['Best Ball', 'Nassau', 'Match Play']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
            <p className="text-gray-600 mt-2">Manage your private golf groups and tournaments</p>
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Group</span>
          </button>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockGroups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                  <div className="flex items-center space-x-2">
                    {group.isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                    {group.isPrivate && <Lock className="h-4 w-4 text-gray-500" />}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{group.members}/{group.maxMembers} Members</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {group.gameTypes.map((gameType, index) => (
                      <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        {gameType}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
                    View Group
                  </button>
                  {group.isOwner && (
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Manage
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Group Modal */}
        <CreateGroupModal 
          isOpen={showCreateGroup} 
          onClose={() => setShowCreateGroup(false)} 
        />
      </div>
    </div>
  );
};

export default Groups;
