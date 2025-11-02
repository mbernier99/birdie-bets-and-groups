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
    id: 'wolf-turd',
    name: 'Wolf Turd',
    icon: Zap,
    description: 'The ultimate chaos game - Wolf tees off first and gets stuck with the worst shot!',
    players: '4 players',
    difficulty: 'Advanced',
    howToPlay: 'Wolf hits first instead of last. After everyone tees off, Wolf must partner with whoever hit the worst shot (the "Turd"). The player with the worst score becomes the Turd and loses points. It\'s Wolf with a twist of karma!',
    idealFor: 'Groups who love chaos and aren\'t afraid to laugh at themselves',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: '2-man-best-ball',
    name: '2 Man Best Ball',
    icon: Users,
    description: 'Teamwork makes the dream work - combine both scores for ultimate team dominance',
    players: '4 players (2 teams)',
    difficulty: 'Beginner',
    howToPlay: 'Both players play their own ball. Add up both scores on each hole. It\'s like a trust fall, but with golf clubs. Miss a putt? Your partner\'s got your back... or do they?',
    idealFor: 'Partners who actually trust each other (or want to test that theory)',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: '2-man-better-ball',
    name: '2 Man Better Ball',
    icon: Trophy,
    description: 'Only the best score counts - no pressure, just rely on your partner completely',
    players: '4 players (2 teams)',
    difficulty: 'Beginner',
    howToPlay: 'Both players play their own ball, but only the better score counts. It\'s the perfect format for when one of you is "having a day" (read: melting down).',
    idealFor: 'Teams with one strong player who enjoys carrying their buddy',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 'match-play',
    name: 'Match Play',
    icon: Target,
    description: 'Mano a mano, hole by hole warfare. Every hole is its own battle!',
    players: '2-8 players',
    difficulty: 'Beginner',
    howToPlay: 'Win individual holes. Lowest score wins the hole. Win the most holes, win the match. Simple math, intense competition. Perfect for trash talk.',
    idealFor: 'Competitive players who want to crush their friends one hole at a time',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'scramble',
    name: 'Scramble',
    icon: Users,
    description: 'Democracy in action - everyone hits, team picks the best shot, repeat',
    players: '4-16 players (teams of 2-4)',
    difficulty: 'Beginner',
    howToPlay: 'Everyone tees off, pick the best shot, everyone hits from there. It\'s like a mulligan on steroids. Great for when you want to blame the team instead of yourself.',
    idealFor: 'Corporate events, charity tournaments, and hiding your slice',
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'nassau',
    name: 'Nassau',
    icon: Zap,
    description: 'Three bets, endless drama - front nine, back nine, and overall. Plus presses!',
    players: '2-8 players',
    difficulty: 'Intermediate',
    howToPlay: 'Three separate match play bets: front 9, back 9, and full 18. Down by 2? Press it! Create new side bets mid-round for maximum wallet danger.',
    idealFor: 'Gamblers who never learned when to quit (in the best way)',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'chapman',
    name: 'Chapman',
    icon: Users,
    description: 'The ultimate trust exercise - swap balls after tee shots, then alternate',
    players: '4 players (2 teams)',
    difficulty: 'Advanced',
    howToPlay: 'Both partners tee off. Then you swap balls and hit second shots. Pick one ball and alternate from there. It\'s like marriage counseling with golf clubs.',
    idealFor: 'Teams who communicate well (or want to destroy their friendship)',
    gradient: 'from-violet-500 to-purple-600'
  },
  {
    id: 'skins',
    name: 'Skins',
    icon: Target,
    description: 'Win the hole outright, win the cash. Ties? Money carries over. Drama ensues.',
    players: '2-8 players',
    difficulty: 'Intermediate',
    howToPlay: 'Each hole is worth money. Beat everyone to win the skin. Tie? All that money rolls to the next hole. Watch the pot grow and the pressure mount.',
    idealFor: 'Players who want action on every single hole and love carryovers',
    gradient: 'from-red-500 to-rose-600'
  },
  {
    id: 'snake',
    name: 'Snake',
    icon: Zap,
    description: 'Three-putt and hold the bag of snakes until someone else does. Don\'t be last!',
    players: '2-8 players',
    difficulty: 'Beginner',
    howToPlay: 'Three-putt? Congrats, you\'re holding the snake! It stays with you until someone else three-putts. Whoever has it at the end pays the pot. Putt pressure intensifies.',
    idealFor: 'Adding fear to every putt, especially after you\'ve had a few beers',
    gradient: 'from-lime-500 to-green-600'
  },
  {
    id: 'wolf',
    name: 'Wolf',
    icon: Trophy,
    description: 'Tee off last, pick your partner (or go alone for glory). Strategy meets chaos!',
    players: '4 players',
    difficulty: 'Advanced',
    howToPlay: 'Wolf tees last, watches everyone hit, then picks a partner or goes "Lone Wolf" for double points. Choose wisely - your wallet depends on it.',
    idealFor: 'Strategic players who love mind games and high-risk decisions',
    gradient: 'from-yellow-500 to-amber-600'
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
