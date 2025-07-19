
import React from 'react';
import { UserPlus, Settings, Play, Trophy } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up and set up your golfer profile with handicap and preferences.',
    step: '01'
  },
  {
    icon: Settings,
    title: 'Setup Tournament',
    description: 'Create your tournament format, invite players, and configure scoring rules.',
    step: '02'
  },
  {
    icon: Play,
    title: 'Play & Track',
    description: 'Use the mobile app on-course to track scores, bets, and shots in real-time.',
    step: '03'
  },
  {
    icon: Trophy,
    title: 'Settle & Celebrate',
    description: 'Automatic calculation of winnings, payouts, and tournament results.',
    step: '04'
  }
];

const HowItWorksSection = () => {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with BetLoopr in four simple steps and transform your golf experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Step connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-emerald-200 transform translate-x-1/2"></div>
              )}
              
              <div className="relative bg-emerald-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-xl font-bold z-10">
                {step.step}
              </div>
              
              <div className="mb-4">
                <step.icon className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              </div>
              
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Join thousands of golfers who have elevated their game with BetLoopr's comprehensive tournament management tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
