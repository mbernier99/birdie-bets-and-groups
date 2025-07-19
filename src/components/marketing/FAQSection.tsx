
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
