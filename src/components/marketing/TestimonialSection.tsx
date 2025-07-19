
import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "BetLoopr transformed how we organize our monthly tournaments. The side bet tracking alone has saved us countless arguments!",
    author: "Mike J.",
    role: "Tournament Organizer",
    rating: 5
  },
  {
    quote: "The GPS verification feature ensures fair play. No more disputes about distances or shot locations.",
    author: "Sarah C.",
    role: "Club Member",
    rating: 5
  },
  {
    quote: "Easy to use, even for the less tech-savvy members of our group. The mobile interface is perfect for on-course use.",
    author: "Tom R.",
    role: "Weekend Golfer",
    rating: 5
  }
];

const stats = [
  { number: '1,000+', label: 'Tournaments Organized' },
  { number: '10,000+', label: 'Rounds Tracked' },
  { number: '50,000+', label: 'Bets Settled' },
  { number: '99%', label: 'User Satisfaction' }
];

const TestimonialSection = () => {
  return (
    <div className="py-16 bg-gradient-to-br from-emerald-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Trusted by Golf Enthusiasts</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-emerald-600 mb-4" />
              <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
