import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Target, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MobileHeader from '@/components/MobileHeader';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const gameFormats = [
  {
    id: 'match-play',
    name: 'Match Play',
    icon: Trophy,
    description: 'Head-to-head competition where each hole is a separate contest',
    players: '2-8 players',
    difficulty: 'Beginner',
    howToPlay: 'Win individual holes. The player with the lowest score on a hole wins that hole. The player who wins the most holes wins the match.',
    idealFor: 'Competitive one-on-one or team matches',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'stroke-play',
    name: 'Stroke Play',
    icon: Target,
    description: 'Traditional format where total strokes determine the winner',
    players: '2-20 players',
    difficulty: 'Beginner',
    howToPlay: 'Count every stroke for every hole. The player with the lowest total score wins.',
    idealFor: 'Tournaments and large group competitions',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'best-ball',
    name: 'Best Ball',
    icon: Users,
    description: 'Team format using the best score from each team on every hole',
    players: '4-16 players (teams of 2-4)',
    difficulty: 'Beginner',
    howToPlay: 'Each team member plays their own ball. Only the best score from the team counts for each hole.',
    idealFor: 'Casual team play and scrambles',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'nassau',
    name: 'Nassau',
    icon: Zap,
    description: 'Three separate matches: front nine, back nine, and overall',
    players: '2-8 players',
    difficulty: 'Intermediate',
    howToPlay: 'Three separate bets: one for the front 9, one for the back 9, and one for the full 18 holes.',
    idealFor: 'Adding wagering excitement to any round',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 'skins',
    name: 'Skins',
    icon: Target,
    description: 'Win money for winning individual holes outright',
    players: '2-8 players',
    difficulty: 'Intermediate',
    howToPlay: 'Each hole has a value (skin). Win a hole outright to win the skin. Tied holes carry over to the next hole.',
    idealFor: 'Groups who like action on every hole',
    gradient: 'from-red-500 to-red-600'
  },
  {
    id: 'stableford',
    name: 'Stableford',
    icon: Trophy,
    description: 'Points-based scoring system that rewards good holes',
    players: '2-20 players',
    difficulty: 'Intermediate',
    howToPlay: 'Earn points based on your score relative to par. Bogey = 1pt, Par = 2pts, Birdie = 3pts, Eagle = 4pts.',
    idealFor: 'Players of varying skill levels',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'scramble',
    name: 'Scramble',
    icon: Users,
    description: 'Team format where everyone plays from the best shot',
    players: '8-16 players (teams of 4)',
    difficulty: 'Beginner',
    howToPlay: 'All team members hit, then choose the best shot. Everyone plays from that spot. Repeat until the hole is complete.',
    idealFor: 'Corporate outings and charity events',
    gradient: 'from-teal-500 to-teal-600'
  }
];

const GameFormats = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20">
      {isMobile && <MobileHeader title="Game Formats" />}
      
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Golf Game Formats</h1>
          <p className="text-lg text-gray-600">
            Choose from a variety of formats to make your round more exciting
          </p>
        </div>

        <div className="space-y-6">
          {gameFormats.map((format) => {
            const Icon = format.icon;
            return (
              <Card key={format.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-2 bg-gradient-to-r ${format.gradient}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${format.gradient}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{format.name}</CardTitle>
                        <CardDescription className="mt-1">{format.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{format.players}</Badge>
                    <Badge variant="outline">{format.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">How to Play</h4>
                    <p className="text-sm text-gray-600">{format.howToPlay}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Ideal For</h4>
                    <p className="text-sm text-gray-600">{format.idealFor}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default GameFormats;
