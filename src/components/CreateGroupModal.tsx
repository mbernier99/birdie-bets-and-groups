
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import GameTypeSelector from './GameTypeSelector';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GroupFormData {
  // Basic Info
  name: string;
  description: string;
  maxMembers: string;
  privacy: string;
  
  // Game Settings
  primaryGameType: string;
  handicapSystem: string;
  scoringMethod: string;
  tournamentFormat: string;
  
  // Betting & Wagering
  defaultBetAmount: string;
  sideBetLimit: string;
  payoutStructure: string;
  settlementMethod: string;
  
  // Communication & Notifications
  sideBetAlerts: boolean;
  notificationTimeout: string;
  autoJoinSideBets: boolean;
  
  // Course & Location
  homeCourse: string;
  defaultTees: string;
  gpsTracking: boolean;
  
  // Group Management
  tournamentDirector: string;
  betModerator: string;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    maxMembers: '12',
    privacy: 'private',
    primaryGameType: '',
    handicapSystem: 'official',
    scoringMethod: 'stroke',
    tournamentFormat: 'single-round',
    defaultBetAmount: '10',
    sideBetLimit: '50',
    payoutStructure: 'winner-takes-all',
    settlementMethod: 'cash',
    sideBetAlerts: true,
    notificationTimeout: '15',
    autoJoinSideBets: false,
    homeCourse: '',
    defaultTees: 'white',
    gpsTracking: true,
    tournamentDirector: 'creator',
    betModerator: 'creator'
  });

  const totalSteps = 5;

  const updateFormData = (field: keyof GroupFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Creating group with data:', formData);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div>
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Describe your group"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxMembers">Max Members</Label>
                <Select value={formData.maxMembers} onValueChange={(value) => updateFormData('maxMembers', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="privacy">Privacy</Label>
                <Select value={formData.privacy} onValueChange={(value) => updateFormData('privacy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Invite Only)</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Game Settings</h3>
            <GameTypeSelector 
              selectedGame={formData.primaryGameType} 
              onGameSelect={(game) => updateFormData('primaryGameType', game)} 
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="handicapSystem">Handicap System</Label>
                <Select value={formData.handicapSystem} onValueChange={(value) => updateFormData('handicapSystem', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="official">Official USGA</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="none">No Handicaps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scoringMethod">Scoring Method</Label>
                <Select value={formData.scoringMethod} onValueChange={(value) => updateFormData('scoringMethod', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stroke">Stroke Play</SelectItem>
                    <SelectItem value="match">Match Play</SelectItem>
                    <SelectItem value="stableford">Stableford</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tournamentFormat">Tournament Format</Label>
              <Select value={formData.tournamentFormat} onValueChange={(value) => updateFormData('tournamentFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-round">Single Round</SelectItem>
                  <SelectItem value="multi-round">Multi-Round</SelectItem>
                  <SelectItem value="elimination">Elimination</SelectItem>
                  <SelectItem value="round-robin">Round Robin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Betting & Wagering</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultBetAmount">Default Bet Amount ($)</Label>
                <Input
                  id="defaultBetAmount"
                  type="number"
                  value={formData.defaultBetAmount}
                  onChange={(e) => updateFormData('defaultBetAmount', e.target.value)}
                  placeholder="10"
                />
              </div>
              <div>
                <Label htmlFor="sideBetLimit">Side Bet Limit ($)</Label>
                <Input
                  id="sideBetLimit"
                  type="number"
                  value={formData.sideBetLimit}
                  onChange={(e) => updateFormData('sideBetLimit', e.target.value)}
                  placeholder="50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payoutStructure">Payout Structure</Label>
                <Select value={formData.payoutStructure} onValueChange={(value) => updateFormData('payoutStructure', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="winner-takes-all">Winner Takes All</SelectItem>
                    <SelectItem value="70-30">70% / 30% Split</SelectItem>
                    <SelectItem value="60-40">60% / 40% Split</SelectItem>
                    <SelectItem value="top-3">Top 3 Payouts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="settlementMethod">Settlement Method</Label>
                <Select value={formData.settlementMethod} onValueChange={(value) => updateFormData('settlementMethod', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="venmo">Venmo</SelectItem>
                    <SelectItem value="app-wallet">App Wallet</SelectItem>
                    <SelectItem value="honor-system">Honor System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notifications & Communication</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sideBetAlerts">Enable Side Bet Alerts</Label>
                <input
                  id="sideBetAlerts"
                  type="checkbox"
                  checked={formData.sideBetAlerts}
                  onChange={(e) => updateFormData('sideBetAlerts', e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoJoinSideBets">Auto-join Side Bets</Label>
                <input
                  id="autoJoinSideBets"
                  type="checkbox"
                  checked={formData.autoJoinSideBets}
                  onChange={(e) => updateFormData('autoJoinSideBets', e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notificationTimeout">Alert Timeout (minutes)</Label>
              <Select value={formData.notificationTimeout} onValueChange={(value) => updateFormData('notificationTimeout', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Course & Management</h3>
            <div>
              <Label htmlFor="homeCourse">Home Course (Optional)</Label>
              <Input
                id="homeCourse"
                value={formData.homeCourse}
                onChange={(e) => updateFormData('homeCourse', e.target.value)}
                placeholder="Enter course name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultTees">Default Tees</Label>
                <Select value={formData.defaultTees} onValueChange={(value) => updateFormData('defaultTees', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black">Black Tees</SelectItem>
                    <SelectItem value="blue">Blue Tees</SelectItem>
                    <SelectItem value="white">White Tees</SelectItem>
                    <SelectItem value="red">Red Tees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="gpsTracking">Enable GPS Tracking</Label>
                <input
                  id="gpsTracking"
                  type="checkbox"
                  checked={formData.gpsTracking}
                  onChange={(e) => updateFormData('gpsTracking', e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tournamentDirector">Tournament Director</Label>
                <Select value={formData.tournamentDirector} onValueChange={(value) => updateFormData('tournamentDirector', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creator">Group Creator</SelectItem>
                    <SelectItem value="rotate">Rotate Weekly</SelectItem>
                    <SelectItem value="volunteer">Volunteer Basis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="betModerator">Bet Moderator</Label>
                <Select value={formData.betModerator} onValueChange={(value) => updateFormData('betModerator', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creator">Group Creator</SelectItem>
                    <SelectItem value="tournament-director">Tournament Director</SelectItem>
                    <SelectItem value="separate">Separate Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Step {currentStep} of {totalSteps}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {renderStepContent()}
        </div>
        
        <div className="flex justify-between pt-6 border-t border-gray-100">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          
          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Create Group
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
