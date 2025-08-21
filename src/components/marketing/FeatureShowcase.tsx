
import React from 'react';
import { Trophy, Users, MapPin, TrendingUp, Shield, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Trophy,
    title: 'Private Tournament Management',
    description: 'Create and manage exclusive golf tournaments with customizable formats, scoring, and player invitations.',
    color: 'text-emerald-600'
  },
  {
    icon: Users,
    title: 'Side Bet Tracking',
    description: 'Track side bets, presses, and wagers throughout your round with real-time settlement and notifications.',
    color: 'text-blue-600'
  },
  {
    icon: MapPin,
    title: 'GPS Shot Verification',
    description: 'Accurate shot tracking and distance measurement using GPS technology for fair play verification.',
    color: 'text-purple-600'
  },
  {
    icon: TrendingUp,
    title: 'Real-time Scoring',
    description: 'Live leaderboards and scoring updates keep all players informed throughout the tournament.',
    color: 'text-orange-600'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your tournaments and data remain private with invitation-only access and secure data handling.',
    color: 'text-red-600'
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Full mobile experience designed for on-course use with offline capabilities and quick access.',
    color: 'text-green-600'
  }
];

const FeatureShowcase = () => {
  return (
    <div className="py-16 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <feature.icon className={`h-8 w-8 ${feature.color} mr-3`} />
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
