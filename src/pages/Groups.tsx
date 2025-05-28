
import React, { useState } from 'react';
import { Users, Plus, Crown, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import GameTypeSelector from '../components/GameTypeSelector';

const Groups = () => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');

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
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Create New Group</h2>
                <p className="text-gray-600 mt-1">Set up a private group for tournaments and betting</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Describe your group"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Members</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option>8</option>
                      <option>12</option>
                      <option>16</option>
                      <option>24</option>
                      <option>32</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option>Private (Invite Only)</option>
                      <option>Public</option>
                    </select>
                  </div>
                </div>
                
                <GameTypeSelector selectedGame={selectedGame} onGameSelect={setSelectedGame} />
              </div>
              
              <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
