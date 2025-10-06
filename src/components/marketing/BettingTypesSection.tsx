import React from 'react';
import { DollarSign, TrendingUp, Zap, Target, Flame, Users } from 'lucide-react';

interface BettingType {
  icon: React.ReactNode;
  name: string;
  description: string;
  details: string[];
  gradient: string;
}

const bettingTypes: BettingType[] = [
  {
    icon: <TrendingUp className="h-7 w-7" />,
    name: 'Press Bets',
    description: 'Double down when behind to create comeback opportunities',
    details: [
      'Auto-trigger when down by 2+ holes',
      'Manual presses anytime during play',
      'Multiple presses can run simultaneously',
      'Creates new side bets alongside main game'
    ],
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    icon: <Flame className="h-7 w-7" />,
    name: 'Skins Game',
    description: 'Each hole is worth money - win it or it carries over',
    details: [
      'Set value per hole',
      'Lowest score wins the skin',
      'Tied holes carry over value',
      'Optional birdies-only mode'
    ],
    gradient: 'from-orange-500 to-red-600'
  },
  {
    icon: <Zap className="h-7 w-7" />,
    name: 'Snake',
    description: 'Last player to 3-putt pays the penalty',
    details: [
      'Pass the snake with each 3-putt',
      'Final holder pays the pot',
      'Optional escalating penalties',
      'Adds pressure to putting game'
    ],
    gradient: 'from-yellow-500 to-amber-600'
  },
  {
    icon: <Users className="h-7 w-7" />,
    name: 'Wolf/Wolf Turd',
    description: 'Dynamic partner selection with point-based payouts',
    details: [
      'Rotating Wolf each hole',
      'Choose partner or go solo for double points',
      'Wolf Turd: partner with worst shot',
      'Points convert to money at end'
    ],
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    icon: <Target className="h-7 w-7" />,
    name: 'Location-Based Bets',
    description: 'Challenge opponents from anywhere on the course',
    details: [
      'Initiate bets from your exact position',
      'GPS-verified locations',
      'Accept or decline challenges',
      'Auto-resolve based on hole results'
    ],
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    icon: <DollarSign className="h-7 w-7" />,
    name: 'Side Games',
    description: 'Stack multiple betting games for maximum action',
    details: [
      'Run multiple side games simultaneously',
      'Independent from main tournament',
      'Configurable player participation',
      'Automatic settlement tracking'
    ],
    gradient: 'from-pink-500 to-rose-600'
  }
];

const BettingTypesSection: React.FC = () => {
  return (
    <div className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-emerald-200 font-semibold text-sm uppercase tracking-wider">
              Wagering Options
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-orbitron mb-4 text-white">
            Betting & Side Games
          </h2>
          <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
            Elevate the stakes with dynamic betting options and side games that run alongside your main tournament
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bettingTypes.map((type, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${type.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {type.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                {type.name}
              </h3>
              
              <p className="text-emerald-100 mb-4 text-sm leading-relaxed">
                {type.description}
              </p>
              
              <ul className="space-y-2.5">
                {type.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start text-sm text-white/80">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 mr-2.5 flex-shrink-0 group-hover:bg-emerald-300"></span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-3xl">
            <h3 className="text-2xl font-bold text-white mb-3">Flexible Wagering System</h3>
            <p className="text-emerald-100 leading-relaxed">
              BetLoopr handles all bet tracking, settlements, and real-time updates automatically. 
              Run your main tournament game alongside multiple side bets and games. 
              Everything is tracked live with GPS verification and instant notifications when bets are won or lost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingTypesSection;