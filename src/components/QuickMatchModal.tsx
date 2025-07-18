
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Target, Trophy, Users, DollarSign, Play, UserPlus, Smartphone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickMatchModal: React.FC<QuickMatchModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'bet-type' | 'invite' | 'stake'>('bet-type');
  const [selectedBetType, setSelectedBetType] = useState<string>('');
  const [inviteMethod, setInviteMethod] = useState<'phone' | 'email'>('phone');
  const [inviteValue, setInviteValue] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const { toast } = useToast();

  const betTypes = [
    {
      id: 'long-drive',
      title: 'Long Drive Challenge',
      description: 'Longest drive from tee wins',
      icon: <Target className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'closest-pin',
      title: 'Closest to Pin',
      description: 'Most accurate shot to pin wins',
      icon: <Trophy className="h-6 w-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'head-to-head',
      title: 'Head-to-Head Match',
      description: 'Best score on hole wins',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'custom-bet',
      title: 'Custom Side Bet',
      description: 'Define your own challenge',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-orange-500'
    }
  ];

  const quickStakes = ['5', '10', '20', '50'];

  const handleBetTypeSelect = (betTypeId: string) => {
    setSelectedBetType(betTypeId);
    setStep('invite');
  };

  const handleInviteSend = () => {
    if (!inviteValue.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a phone number or email address.",
        variant: "destructive"
      });
      return;
    }
    setStep('stake');
  };

  const handleStartMatch = () => {
    const selectedBet = betTypes.find(bet => bet.id === selectedBetType);
    
    toast({
      title: "Challenge Sent!",
      description: `${selectedBet?.title} challenge for $${stakeAmount} sent. Starting shot tracker...`,
    });

    // Reset and close
    setStep('bet-type');
    setSelectedBetType('');
    setInviteValue('');
    setStakeAmount('');
    onClose();
  };

  const handleBack = () => {
    if (step === 'invite') {
      setStep('bet-type');
    } else if (step === 'stake') {
      setStep('invite');
    }
  };

  const selectedBet = betTypes.find(bet => bet.id === selectedBetType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Play className="h-5 w-5 text-emerald-600" />
            <span>Quick Match</span>
          </DialogTitle>
        </DialogHeader>

        {step === 'bet-type' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-gray-600">Choose your challenge type</p>
            </div>
            
            <div className="space-y-3">
              {betTypes.map((bet) => (
                <Card key={bet.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleBetTypeSelect(bet.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`${bet.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                        {bet.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{bet.title}</h3>
                        <p className="text-sm text-gray-600">{bet.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'invite' && selectedBet && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className={`${selectedBet.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mx-auto mb-3`}>
                {selectedBet.icon}
              </div>
              <h3 className="font-medium text-lg">{selectedBet.title}</h3>
              <p className="text-gray-600">{selectedBet.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Invite Player</Label>
                <Select value={inviteMethod} onValueChange={(value: 'phone' | 'email') => setInviteMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Phone Number</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email Address</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  type={inviteMethod === 'phone' ? 'tel' : 'email'}
                  placeholder={inviteMethod === 'phone' ? '+1 (555) 123-4567' : 'player@example.com'}
                  value={inviteValue}
                  onChange={(e) => setInviteValue(e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button onClick={handleInviteSend} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'stake' && selectedBet && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className={`${selectedBet.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mx-auto mb-3`}>
                {selectedBet.icon}
              </div>
              <h3 className="font-medium text-lg">{selectedBet.title}</h3>
              <p className="text-gray-600">vs {inviteValue}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Stake Amount</Label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {quickStakes.map((amount) => (
                    <Button
                      key={amount}
                      variant={stakeAmount === amount ? "default" : "outline"}
                      className="h-12"
                      onClick={() => setStakeAmount(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Custom amount"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="text-lg text-center"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span>Challenge:</span>
                  <span className="font-medium">{selectedBet.title}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Opponent:</span>
                  <span className="font-medium">{inviteValue}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Stake:</span>
                  <span className="font-medium text-green-600">${stakeAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleStartMatch} 
                disabled={!stakeAmount}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Match
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickMatchModal;
