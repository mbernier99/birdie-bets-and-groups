import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Target, Trophy, Award, Zap, Crosshair, TrendingUp } from 'lucide-react';

const faqs = [
  {
    question: 'How do I create a private tournament?',
    answer: 'After signing up, click "Create Tournament" and configure your tournament settings. You can then invite specific players via email - only invited players can join your tournament.'
  },
  {
    question: 'Can I track side bets and presses during play?',
    answer: 'Yes! BetLoopr includes comprehensive side bet tracking with real-time notifications and automatic settlement calculations based on your scores.'
  },
  {
    question: 'Does BetLoopr work offline on the golf course?',
    answer: 'The mobile app includes offline capabilities so you can track scores and bets even without cell service. Data syncs when you reconnect.'
  },
  {
    question: 'How accurate is the GPS shot tracking?',
    answer: 'Our GPS technology provides accuracy within 1-2 yards for distance measurements and shot location verification on most modern smartphones.'
  },
  {
    question: 'Can I import existing tournament formats?',
    answer: 'Yes, BetLoopr supports common tournament formats like Match Play, Stroke Play, Best Ball, and Scramble with customizable scoring rules.'
  },
  {
    question: 'Is my tournament data secure and private?',
    answer: 'Absolutely. All tournaments are private by default with invitation-only access. We use enterprise-grade security to protect your data.'
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Tournament Types Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tournament Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">2-Man Best Ball</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Teams of 2, lowest score on each hole counts</p>
              <a href="/rules#bestball" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Match Play</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Head-to-head competition, win holes not strokes</p>
              <a href="/rules#matchplay" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Wolf</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Rotating partnerships with betting strategy</p>
              <a href="/rules#wolf" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Nassau</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Three separate bets: front 9, back 9, and overall</p>
              <a href="/rules#nassau" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
          </div>
        </div>

        {/* Betting Types Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Betting Types</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">This Hole Only</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Single hole competition with immediate settlement</p>
              <a href="/rules#this-hole" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Head-to-Head Match</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Direct comparison between players with relative scoring</p>
              <a href="/rules#head-to-head" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Total Strokes</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Lowest cumulative score over multiple holes</p>
              <a href="/rules#total-strokes" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Remaining Holes</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Competition for all holes from current position to finish</p>
              <a href="/rules#remaining-holes" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Long Drive</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Compete for the longest drive on designated holes</p>
              <a href="/rules#long-drive" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <Crosshair className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Closest to the Pin</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Precision challenge on par 3s and approach shots</p>
              <a href="/rules#closest-to-pin" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-emerald-500 rounded-lg mr-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900">Dynamic Prop Bets</h4>
              </div>
              <p className="text-gray-700 text-sm mb-4">Real-time betting opportunities based on round progress</p>
              <a href="/rules#dynamic-props" className="inline-flex items-center text-emerald-700 hover:text-emerald-800 text-sm font-medium story-link">
                View Rules <ChevronDown className="h-4 w-4 ml-1 rotate-[-90deg]" />
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section - Now at the bottom */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about BetLoopr
          </p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;