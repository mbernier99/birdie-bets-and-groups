
import React from 'react';
import { Trophy, Users, DollarSign, BookOpen, Target, Gamepad2, Handshake, Play } from 'lucide-react';
import TutorialCard from './TutorialCard';
import SampleGameCard from './SampleGameCard';

interface WelcomeTutorialSectionProps {
  onCreateTournament: () => void;
  onPlayNow: () => void;
  onViewRules: () => void;
}

const WelcomeTutorialSection: React.FC<WelcomeTutorialSectionProps> = ({
  onCreateTournament,
  onPlayNow,
  onViewRules
}) => {
  return (
    <div className="space-y-16 mt-16">
      {/* Getting Started Section */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to BetLoopr!</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with golf tournaments, side bets, and competitive play. Here's everything you need to know.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TutorialCard
            title="Create Tournament"
            description="Set up your first private tournament with custom rules, teams, and wagering options."
            icon={Trophy}
            actionText="Start Creating"
            onAction={onCreateTournament}
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            iconColor="bg-emerald-500"
          />
          
          <TutorialCard
            title="Game Formats"
            description="Explore Match Play, Best Ball, Scramble, and Skins games with different skill levels."
            icon={Gamepad2}
            actionText="Try Quick Play"
            onAction={onPlayNow}
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            iconColor="bg-emerald-500"
          />
          
          <TutorialCard
            title="Side Betting"
            description="Learn about Presses, Nassau bets, Closest to Pin, and other exciting side wagers."
            icon={DollarSign}
            actionText="Explore Betting"
            onAction={() => {}}
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            iconColor="bg-emerald-500"
          />
          
          <TutorialCard
            title="Rules & Scoring"
            description="Master golf rules, handicap calculations, and different scoring systems."
            icon={BookOpen}
            actionText="Learn Rules"
            onAction={onViewRules}
            gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
            iconColor="bg-emerald-500"
          />
        </div>
      </div>

      {/* Sample Games Section */}
      <div>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Popular Game Formats</h3>
          <p className="text-lg text-gray-600">
            Try these exciting formats to get started with competitive golf
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SampleGameCard
            title="Sunday Singles"
            description="Head-to-head match play with individual scoring and side bets"
            gameType="Match Play"
            players="2-4"
            prize="$20-50"
            icon={Target}
            difficulty="Beginner"
          />
          
          <SampleGameCard
            title="Team Best Ball"
            description="Partner format where teams use their best score on each hole"
            gameType="Best Ball"
            players="4-8"
            prize="$30-80"
            icon={Users}
            difficulty="Beginner"
          />
          
          <SampleGameCard
            title="Nassau Classic"
            description="Three separate bets: front 9, back 9, and overall 18-hole match"
            gameType="Nassau"
            players="2-4"
            prize="$50-150"
            icon={Handshake}
            difficulty="Intermediate"
          />
          
          <SampleGameCard
            title="Skins Game"
            description="Hole-by-hole betting where lowest score wins the pot for that hole"
            gameType="Skins"
            players="3-6"
            prize="$100+"
            icon={Play}
            difficulty="Advanced"
          />
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Pro Tips for New Players</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-lg p-4">
              <Trophy className="h-8 w-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Start Small</h4>
              <p className="text-emerald-100 text-sm">Begin with low-stakes games to learn the ropes</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Find Your Group</h4>
              <p className="text-emerald-100 text-sm">Invite friends or join public tournaments</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <DollarSign className="h-8 w-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-2">Track Everything</h4>
              <p className="text-emerald-100 text-sm">Monitor your progress and betting performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeTutorialSection;
