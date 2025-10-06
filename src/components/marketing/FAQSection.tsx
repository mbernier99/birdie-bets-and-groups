import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'How do I create a private tournament?',
    answer: 'After signing up, click "Create Tournament" and configure your tournament settings. You can then invite specific players via email - only invited players can join your tournament.'
  },
  {
    question: 'What unique betting and side game options does BetLoopr offer?',
    answer: 'BetLoopr supports 10+ game formats including Nassau, Skins, Wolf, Snake, Match Play, and more. You can run multiple side bets simultaneously alongside your main tournament, with configurable settings for each game type including press bets, carryovers, and point-based scoring.'
  },
  {
    question: 'Does BetLoopr work offline on the golf course?',
    answer: 'The mobile app includes offline capabilities so you can track scores and bets even without cell service. Data syncs automatically when you reconnect.'
  },
  {
    question: 'How does the mobile AR tracking work for closest to pin and long drive?',
    answer: 'BetLoopr uses native mobile AR technology to accurately measure distances for closest-to-pin and long drive competitions. Simply use your phone\'s camera to capture and verify shot distances in real-time, with measurements stored for automatic competition resolution.'
  },
  {
    question: 'How does handicap management work?',
    answer: 'BetLoopr allows you to set and manage handicaps for all players. Handicaps are automatically applied to scoring calculations for fair competition across skill levels. You can use official USGA handicaps or set custom handicaps for your group.'
  },
  {
    question: 'Can I see live leaderboards during play?',
    answer: 'Yes! BetLoopr provides real-time live leaderboards that update automatically as scores are entered. Track your main tournament standings, side game results, press bets, and individual player performance all in one dynamic view.'
  },
  {
    question: 'Can I track side bets and presses during play?',
    answer: 'Absolutely! BetLoopr includes comprehensive side bet tracking with real-time notifications and automatic settlement calculations. Set up presses to auto-trigger when down by a certain number of holes, or initiate them manually at any time.'
  },
  {
    question: 'Is my tournament data secure and private?',
    answer: 'Yes. All tournaments are private by default with invitation-only access. We use enterprise-grade security to protect your data and ensure only invited participants can view or join your tournaments.'
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