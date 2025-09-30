import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, Users, Target, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MobileHeader from '@/components/MobileHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const bettingTypes = [
  {
    id: 'press',
    name: 'Press',
    icon: Zap,
    description: 'Double the bet when trailing to increase stakes',
    risk: 'Medium',
    howItWorks: 'When losing by 2+ holes in match play, either player can call "Press" to start a new side bet for the remaining holes.',
    example: 'Down 0-2 after hole 4? Press! Now you have two bets running simultaneously.',
    tips: 'Use strategically when you have momentum. Don\'t press on every loss.',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 'side-bets',
    name: 'Side Bets',
    icon: Target,
    description: 'Additional wagers on specific outcomes during play',
    risk: 'Low to High',
    howItWorks: 'Bet on specific achievements like closest to pin, longest drive, birdies, or other hole-specific outcomes.',
    example: 'Bet $5 on closest to pin on par 3s, or $10 for longest drive on designated holes.',
    tips: 'Keep track of all side bets on your scorecard. Settle up after the round.',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'skins-betting',
    name: 'Skins Betting',
    icon: DollarSign,
    description: 'Each hole is worth money; winner takes the pot',
    risk: 'Medium',
    howItWorks: 'Everyone contributes to the pot. Win a hole outright to win the skin. Tied holes carry over the value to the next hole.',
    example: '$5 per hole × 18 holes = $90 pot. Win 3 holes outright, earn $15.',
    tips: 'Carryovers create big pots. Focus on winning holes outright rather than just beating one player.',
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 'nassau-betting',
    name: 'Nassau Betting',
    icon: TrendingUp,
    description: 'Three separate bets: front, back, and total',
    risk: 'Medium',
    howItWorks: 'Three independent bets for the front 9, back 9, and overall 18. Each bet is settled separately.',
    example: '$10 Nassau = $10 for front 9, $10 for back 9, $10 for overall. Total exposure: $30.',
    tips: 'You can lose the front but still win the back and overall. Presses can be added to each bet.',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'team-betting',
    name: 'Team Betting',
    icon: Users,
    description: 'Partner formats with combined betting',
    risk: 'Medium',
    howItWorks: 'Best ball or alternate shot formats where teams compete for the pot. Various point systems available.',
    example: '2v2 best ball for $20/team. Winning team splits $40.',
    tips: 'Choose partners wisely. Communication is key in alternate shot formats.',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'prop-bets',
    name: 'Prop Bets',
    icon: AlertCircle,
    description: 'Fun wagers on unusual outcomes',
    risk: 'Low',
    howItWorks: 'Bet on quirky outcomes like first to lose a ball, most sand shots, three-putts, or hitting a tree.',
    example: '$5 for each three-putt, $10 for first ball in the water.',
    tips: 'Keep it fun and light. These add entertainment without high stakes.',
    gradient: 'from-pink-500 to-pink-600'
  }
];

const bettingTips = [
  'Always agree on stakes before teeing off',
  'Keep detailed records during play',
  'Settle bets immediately after the round',
  'Only bet what you can afford to lose',
  'Know your group\'s betting culture',
  'Clear communication prevents disputes'
];

const BettingInfo = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {isMobile && <MobileHeader title="Betting Guide" />}
      
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
        {!isMobile && (
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Golf Betting Guide</h1>
          <p className="text-lg text-gray-600">
            Learn about different betting formats to add excitement to your rounds
          </p>
        </div>

        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Responsible Gambling:</strong> Only wager what you can afford to lose. Golf betting should enhance fun, not create financial stress.
          </AlertDescription>
        </Alert>

        <div className="space-y-6 mb-8">
          {bettingTypes.map((bet) => {
            const Icon = bet.icon;
            return (
              <Card key={bet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-2 bg-gradient-to-r ${bet.gradient}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${bet.gradient}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{bet.name}</CardTitle>
                        <CardDescription className="mt-1">{bet.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      Risk: {bet.risk}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">How It Works</h4>
                    <p className="text-sm text-gray-600">{bet.howItWorks}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Example</h4>
                    <p className="text-sm text-gray-600 italic">{bet.example}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Pro Tips</h4>
                    <p className="text-sm text-gray-600">{bet.tips}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white">Essential Betting Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {bettingTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-emerald-300 mt-1">✓</span>
                  <span className="text-emerald-50">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default BettingInfo;
