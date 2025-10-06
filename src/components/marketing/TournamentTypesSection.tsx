import React from 'react';
import { Users, Star, Target, Shuffle, Grid, Flame, Zap, Trophy } from 'lucide-react';

interface TournamentType {
  icon: React.ReactNode;
  name: string;
  description: string;
  rules: string[];
  color: string;
}

const tournamentTypes: TournamentType[] = [
  {
    icon: <Users className="h-8 w-8" />,
    name: '2 Man Best Ball',
    description: 'Combined team scoring for maximum collaboration',
    rules: [
      'Both players play their own ball',
      'Combined total of both scores counts',
      'Lowest team total wins'
    ],
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: <Star className="h-8 w-8" />,
    name: '2 Man Better Ball',
    description: 'Best score from each team counts',
    rules: [
      'Both players play their own ball',
      'Only best score per hole counts',
      'Lowest total using best balls wins'
    ],
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: <Target className="h-8 w-8" />,
    name: 'Match Play',
    description: 'Head-to-head hole-by-hole competition',
    rules: [
      'Win holes individually',
      'Match ends when lead exceeds remaining holes',
      'Individual or team formats available'
    ],
    color: 'from-red-500 to-red-600'
  },
  {
    icon: <Users className="h-8 w-8" />,
    name: 'Scramble',
    description: 'Team selects best shot each time',
    rules: [
      'All players tee off',
      'Team picks best shot',
      'All play from that spot until holed'
    ],
    color: 'from-green-500 to-green-600'
  },
  {
    icon: <Grid className="h-8 w-8" />,
    name: 'Nassau',
    description: 'Three bets: Front 9, Back 9, Overall',
    rules: [
      'Three separate match play bets',
      'Auto or manual press options',
      'Presses create comeback opportunities'
    ],
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: <Shuffle className="h-8 w-8" />,
    name: 'Chapman',
    description: 'Alternate shot after partner swap',
    rules: [
      'Both partners tee off',
      'Swap balls for second shots',
      'Pick one ball, alternate shots to finish'
    ],
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: <Flame className="h-8 w-8" />,
    name: 'Skins',
    description: 'Win the hole, win the skin',
    rules: [
      'Lowest score wins the skin',
      'Ties carry over to next hole',
      'Carryovers multiply the value'
    ],
    color: 'from-rose-500 to-rose-600'
  },
  {
    icon: <Zap className="h-8 w-8" />,
    name: 'Snake',
    description: 'Avoid the 3-putt penalty',
    rules: [
      'Last player to 3-putt holds the snake',
      'Snake holder pays at round end',
      'Optional escalating penalties'
    ],
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: <Star className="h-8 w-8" />,
    name: 'Wolf',
    description: 'Choose partners or go lone wolf',
    rules: [
      'Wolf tees off last, picks partner',
      'Pass on all = Lone Wolf (double points)',
      'Points determine final payouts'
    ],
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    icon: <Trophy className="h-8 w-8" />,
    name: 'Wolf Turd',
    description: 'Wolf must partner with worst shot',
    rules: [
      'Wolf tees off first',
      'Must partner with worst tee shot',
      'Turd penalty for worst hole score'
    ],
    color: 'from-pink-500 to-pink-600'
  }
];

const TournamentTypesSection: React.FC = () => {
  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-6 py-2 bg-emerald-100 rounded-full">
            <span className="text-emerald-700 font-semibold text-sm uppercase tracking-wider">
              Game Formats
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-orbitron mb-4 text-gray-900">
            Tournament Types
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From classic formats to exciting variations, choose the perfect game for your group
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournamentTypes.map((type, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${type.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {type.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {type.name}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm">
                {type.description}
              </p>
              
              <ul className="space-y-2">
                {type.rules.map((rule, ruleIndex) => (
                  <li key={ruleIndex} className="flex items-start text-sm text-gray-700">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-2 flex-shrink-0"></span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentTypesSection;