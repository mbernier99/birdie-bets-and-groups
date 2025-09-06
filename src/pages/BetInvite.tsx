import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Target, TrendingUp, Users, DollarSign } from 'lucide-react';

const BetInvite: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  
  // Mock bet data - in real app this would come from room/bet details
  const [betDetails, setBetDetails] = useState<{
    mode: 'ctp' | 'long-drive' | null;
    amount: number;
    hostName: string;
    participantCount: number;
  }>({
    mode: null,
    amount: 0,
    hostName: '',
    participantCount: 0
  });

  useEffect(() => {
    // Load bet details from localStorage or API
    const storedMode = sessionStorage.getItem(`qb_mode_${roomId}`);
    const storedAmount = sessionStorage.getItem(`qb_amount_${roomId}`) || '5';
    const storedName = localStorage.getItem('qb_name') || '';
    
    setBetDetails({
      mode: storedMode as 'ctp' | 'long-drive' || 'ctp',
      amount: Number(storedAmount),
      hostName: 'Friend', // Would come from API
      participantCount: 1
    });
    
    setName(storedName);
    
    document.title = `Join Bet • ${roomId}`;
  }, [roomId]);

  const handleAccept = () => {
    if (!name.trim()) {
      toast({
        title: "Enter your name",
        description: "We need your name to add you to the bet.",
        variant: "destructive"
      });
      return;
    }
    
    localStorage.setItem('qb_name', name.trim());
    navigate(`/quick-bet/${roomId}`);
    
    toast({
      title: "Bet joined!",
      description: "You've successfully joined the bet. Good luck!"
    });
  };

  const handleDecline = () => {
    toast({
      title: "Bet declined",
      description: "You've declined to join this bet."
    });
    
    // Could navigate to home or show a thank you message
    navigate('/');
  };

  if (!betDetails.mode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-lg font-semibold mb-2">Loading bet details...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Bet Details Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {betDetails.mode === 'ctp' ? (
                  <Target className="h-8 w-8 text-primary" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-primary" />
                )}
              </div>
              
              <h1 className="text-2xl font-bold mb-2">
                You're Invited to a Bet!
              </h1>
              
              <p className="text-muted-foreground">
                {betDetails.hostName} invited you to join
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Game Type</div>
                <div className="text-lg font-semibold">
                  {betDetails.mode === 'ctp' ? 'Closest to the Pin' : 'Long Drive Contest'}
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-sm text-muted-foreground">Wager</div>
                      <div className="text-xl font-bold text-green-600">
                        ${betDetails.amount}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm text-muted-foreground">Players</div>
                      <div className="text-xl font-bold text-blue-600">
                        {betDetails.participantCount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-left block mb-2">
                  Your Name
                </label>
                <Input
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-center"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleAccept}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700"
            disabled={!name.trim()}
          >
            Accept Bet
          </Button>
          
          <Button 
            onClick={handleDecline}
            variant="outline"
            size="lg"
            className="w-full h-14 text-lg font-semibold border-red-200 text-red-600 hover:bg-red-50"
          >
            Decline
          </Button>
        </div>

        {/* Room Code */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Room Code</div>
          <div className="text-sm font-mono font-semibold tracking-wider">
            {roomId}
          </div>
        </div>

        {/* How it works */}
        <Card className="border-0 bg-muted/30">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground text-center">
              <div className="font-medium mb-1">How it works:</div>
              <div>
                {betDetails.mode === 'ctp' 
                  ? 'Get closest to the pin using AR distance tracking'
                  : 'Hit the longest drive using AR distance tracking'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BetInvite;