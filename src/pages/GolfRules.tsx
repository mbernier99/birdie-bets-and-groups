
import React, { useState } from 'react';
import { Search, Users, Trophy, Target, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GolfRules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const golfGames = [
    {
      id: 'best-ball',
      name: 'Best Ball',
      category: 'Team',
      players: '4-16',
      description: 'Teams of 2 or 4 players where only the lowest score on each hole counts.',
      rules: [
        'Form teams of 2 or 4 players',
        'All team members play their own ball throughout the round',
        'On each hole, only the lowest score among team members counts',
        'Team with the lowest total score wins',
        'Handicaps can be applied to individual players or teams'
      ],
      betting: 'Teams can bet against each other, or individual buy-ins with winner-takes-all payout.'
    },
    {
      id: 'scramble',
      name: 'Scramble',
      category: 'Team',
      players: '4-16',
      description: 'Team format where all players hit from the location of the best shot.',
      rules: [
        'All team members tee off on each hole',
        'Team selects the best drive and all players hit their second shot from that location',
        'Continue this process until the ball is holed',
        'Each player must have a minimum number of drives used (typically 4 in an 18-hole round)',
        'Team with the lowest score wins'
      ],
      betting: 'Entry fee per team with payout to top finishing teams.'
    },
    {
      id: 'wolf',
      name: 'Wolf',
      category: 'Betting',
      players: '4',
      description: 'Rotating partnership game where one player (the Wolf) chooses a partner after seeing tee shots.',
      rules: [
        'Players rotate being the "Wolf" - designated order before starting',
        'Wolf tees off last on each hole',
        'After seeing all tee shots, Wolf chooses a partner or plays alone (Lone Wolf)',
        'If Wolf chooses partner: Wolf + Partner vs Other 2 players',
        'If Lone Wolf: Wolf vs all 3 other players',
        'Winning side splits points (typically 1 point per hole, 2 for Lone Wolf win)'
      ],
      betting: 'Points are worth agreed amount (e.g., $1 each). Lone Wolf wins are worth double.'
    },
    {
      id: 'nassau',
      name: 'Nassau',
      category: 'Betting',
      players: '2-8',
      description: 'Three separate match play competitions: front nine, back nine, and overall 18.',
      rules: [
        'Three separate bets: Front 9, Back 9, and Overall 18-hole match',
        'Each bet is won by the player/team with the lower score for that segment',
        'Can be played individually or in teams',
        'Automatic press option: when 2+ holes down, can start new bet for remaining holes',
        'Handicap strokes applied as usual'
      ],
      betting: 'Set amount for each of the three bets (e.g., $10 front, $10 back, $10 overall). Presses double the remaining bet.'
    },
    {
      id: 'skins',
      name: 'Skins',
      category: 'Betting',
      players: '2-8',
      description: 'Each hole is worth a "skin" - win outright or it carries over.',
      rules: [
        'Each hole is worth one "skin"',
        'Player with the lowest score on a hole wins the skin',
        'If tied for lowest, the skin carries over to the next hole',
        'Carried skins accumulate (next hole worth 2 skins, etc.)',
        'Player with most skins at the end wins'
      ],
      betting: 'Each skin worth set amount (e.g., $5). Total pot divided by number of skins won.'
    },
    {
      id: 'vegas',
      name: 'Vegas',
      category: 'Betting',
      players: '4',
      description: 'Partners combine scores to create two-digit numbers, lowest wins.',
      rules: [
        'Play in teams of 2',
        'Combine team scores to make a two-digit number (lower score first)',
        'Example: Team scores 4 and 6, their number is 46',
        'If a player scores birdie or better, opponents must flip their number (64 becomes 46)',
        'Team with lower number wins points equal to the difference',
        'Rotate partnerships every 6 holes'
      ],
      betting: 'Points worth agreed amount. Differences can get large, so set reasonable limits.'
    },
    {
      id: 'bingo-bango-bongo',
      name: 'Bingo Bango Bongo',
      category: 'Betting',
      players: '3-8',
      description: 'Three points available on every hole based on accomplishments.',
      rules: [
        'Three points available on each hole:',
        'Bingo: First player to get ball on the green',
        'Bango: Player closest to the pin once all balls are on green',
        'Bongo: First player to hole out',
        'Player furthest from hole always plays first',
        'Player with most points after 18 holes wins'
      ],
      betting: 'Each point worth set amount, or winner-takes-all pot based on total points.'
    },
    {
      id: 'dots',
      name: 'Dots (Garbage)',
      category: 'Betting',
      players: '2-8',
      description: 'Side bets for various achievements during the round.',
      rules: [
        'Various "dots" available for achievements:',
        'Sandies: Up and down from a bunker',
        'Birdies: Score one under par',
        'Greenies: Closest to pin on par 3s (must make par or better)',
        'Polies: Longest putt made',
        'Arnies: Make par or better after hitting a tree',
        'Hogans: Hit fairway and green in regulation'
      ],
      betting: 'Each dot worth set amount (e.g., $1). Can be won multiple times per round.'
    },
    {
      id: 'rabbit',
      name: 'Rabbit',
      category: 'Betting',
      players: '3-8',
      description: 'Catch the rabbit by winning holes, hold it by not losing.',
      rules: [
        'Rabbit starts "free" at the beginning',
        'Player who wins the first hole "catches" the rabbit',
        'Rabbit changes hands only when current holder loses a hole outright',
        'If hole is tied, rabbit stays with current holder',
        'Player holding rabbit at end of round wins the pot',
        'If rabbit is "free" at end (no one caught it on final holes), pot carries over'
      ],
      betting: 'Set pot amount, winner takes all. Can play multiple rabbits per round.'
    },
    {
      id: 'snake',
      name: 'Snake',
      category: 'Betting',
      players: '3-8',
      description: 'Penalty for three-putting that passes to the next three-putter.',
      rules: [
        'Anyone who three-putts gets the "snake"',
        'Snake stays with you until someone else three-putts',
        'Player holding the snake at the end of the round pays the penalty',
        'Variation: multiple snakes for multiple three-putts in one round',
        'Can be combined with other games as a side bet'
      ],
      betting: 'Snake holder pays set amount to the pot, or pays each other player.'
    },
    {
      id: 'chicago',
      name: 'Chicago',
      category: 'Betting',
      players: '2-8',
      description: 'Points-based system where par is worth your quota of points.',
      rules: [
        'Each player gets a quota based on their handicap (usually 36 - handicap)',
        'Scoring: Eagle = 8 points, Birdie = 4 points, Par = 2 points, Bogey = 1 point',
        'Double bogey or worse = 0 points',
        'Goal is to exceed your quota',
        'Player who exceeds quota by the most wins',
        'Can also play as team format'
      ],
      betting: 'Entry fee with payout to players who exceed quota, or winner-takes-all.'
    },
    {
      id: 'aces-and-deuces',
      name: 'Aces and Deuces',
      category: 'Betting',
      players: '3-8',
      description: 'Points awarded for being closest and farthest from the pin.',
      rules: [
        'On each hole, points awarded after everyone reaches the green:',
        'Ace (1 point): Closest to the pin',
        'Deuce (-1 point): Farthest from the pin',
        'All other players get 0 points for that hole',
        'Player with the highest point total after 18 holes wins',
        'Ties for closest/farthest result in no points awarded'
      ],
      betting: 'Winner takes pot, or pay based on final point standings.'
    },
    {
      id: 'quota',
      name: 'Quota',
      category: 'Individual',
      players: '2-16',
      description: 'Exceed your personal quota based on your handicap.',
      rules: [
        'Each player gets a quota: 36 minus their handicap',
        'Points: Eagle = 4, Birdie = 2, Par = 0, Bogey = -1, Double bogey+ = -3',
        'Goal is to exceed your quota',
        'Can play as individual competition or team format',
        'Rewards consistent play relative to ability'
      ],
      betting: 'Players who exceed quota split the pot, or entry fee with payouts by ranking.'
    },
    {
      id: 'defender',
      name: 'Defender',
      category: 'Betting',
      players: '3-8',
      description: 'Defend holes by winning or halving them against the field.',
      rules: [
        'Each player "defends" specific holes (rotate assignment)',
        'Defender wins points by winning or halving their assigned holes',
        'Lose points by losing the hole outright',
        'Can assign multiple holes per player',
        'Player with most points at end wins'
      ],
      betting: 'Entry fee with winner-takes-all, or points worth set amount.'
    },
    {
      id: 'low-ball-high-ball',
      name: 'Low Ball High Ball',
      category: 'Betting',
      players: '3-8',
      description: 'Points for having the lowest and highest scores in the group.',
      rules: [
        'On each hole, points awarded for:',
        'Low Ball: Lowest score in the group gets +1 point',
        'High Ball: Highest score in the group gets -1 point',
        'Middle scores get 0 points',
        'Ties result in split points',
        'Player with highest point total wins'
      ],
      betting: 'Winner takes pot, or pay per point differential.'
    },
    {
      id: 'alternate-shot',
      name: 'Alternate Shot (Foursomes)',
      category: 'Team',
      players: '4-8',
      description: 'Partners alternate hitting the same ball.',
      rules: [
        'Teams of 2 players share one ball',
        'Players alternate shots throughout the hole',
        'Player A tees off on odd holes, Player B on even holes',
        'Continue alternating until ball is holed',
        'Lowest team score wins',
        'Requires strong teamwork and strategy'
      ],
      betting: 'Team entry fees with payout to winning teams.'
    },
    {
      id: 'chapman',
      name: 'Chapman (Pinehurst)',
      category: 'Team',
      players: '4-8',
      description: 'Both players tee off, then play partner\'s ball for second shot.',
      rules: [
        'Both team members tee off',
        'Each player hits their partner\'s tee shot for the second shot',
        'Team selects the better of the two second shots',
        'Players alternate hitting the selected ball until holed',
        'Combines elements of scramble and alternate shot',
        'Lowest team score wins'
      ],
      betting: 'Team competition with entry fees and payouts to top finishers.'
    },
    {
      id: 'shamble',
      name: 'Shamble',
      category: 'Team',
      players: '4-16',
      description: 'All players tee off, then play individual balls from the best drive.',
      rules: [
        'All team members tee off',
        'Team selects the best drive',
        'All players play their own ball from the selected drive location',
        'Can use best score, best two scores, or all scores depending on format',
        'Combines scramble start with individual play',
        'Team with lowest score wins'
      ],
      betting: 'Team entry with various payout structures based on format used.'
    },
    {
      id: 'stroke-play',
      name: 'Stroke Play',
      category: 'Individual',
      players: '2-32',
      description: 'Traditional individual competition - lowest total score wins.',
      rules: [
        'Each player plays their own ball throughout',
        'Count every stroke taken during the round',
        'Handicap strokes applied to gross score for net competition',
        'Lowest gross or net score wins',
        'Can have multiple divisions based on handicap'
      ],
      betting: 'Entry fees with payouts to low gross, low net, and other categories.'
    },
    {
      id: 'match-play',
      name: 'Match Play',
      category: 'Match Play',
      players: '2-8',
      description: 'Head-to-head competition where you win holes, not strokes.',
      rules: [
        'Players compete head-to-head',
        'Win a hole by having the lower score',
        'Tie holes are "halved"',
        'Match ends when one player leads by more holes than remain',
        'Handicap strokes given on designated holes',
        'Winner advances in bracket-style tournament'
      ],
      betting: 'Entry fee with bracket-style elimination, winner takes largest share.'
    },
    {
      id: 'stableford',
      name: 'Stableford',
      category: 'Individual',
      players: '2-32',
      description: 'Points-based scoring system that rewards aggressive play.',
      rules: [
        'Points awarded based on score relative to par:',
        'Eagle = 4 points, Birdie = 3 points, Par = 2 points',
        'Bogey = 1 point, Double bogey or worse = 0 points',
        'Highest point total wins',
        'Encourages aggressive play and recovery from bad holes',
        'Handicap strokes add one point to the score on designated holes'
      ],
      betting: 'Entry fee with payouts based on point totals, or winner-takes-all.'
    }
  ];

  const categories = ['all', 'Team', 'Individual', 'Betting', 'Match Play'];

  const filteredGames = golfGames.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Team': return <Users className="h-4 w-4" />;
      case 'Individual': return <Trophy className="h-4 w-4" />;
      case 'Betting': return <DollarSign className="h-4 w-4" />;
      case 'Match Play': return <Target className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Golf Game Rules</h1>
          <p className="text-gray-600">Complete guide to golf betting games and tournament formats</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGames.map((game) => (
            <div key={game.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{game.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {getCategoryIcon(game.category)}
                    <span>{game.category}</span>
                    <span>•</span>
                    <span>{game.players} players</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{game.description}</p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Rules:</h4>
                  <ul className="space-y-1">
                    {game.rules.map((rule, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Betting Structure:</h4>
                  <p className="text-sm text-gray-600">{game.betting}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GolfRules;
