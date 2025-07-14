
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, AlertTriangle, Users, Target } from 'lucide-react';
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';

const GolfRules = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const rulesSections = [
    {
      id: 'basic-play',
      title: 'Basic Play',
      icon: BookOpen,
      color: 'emerald',
      rules: [
        {
          title: 'Teeing Off',
          description: 'The ball must be played from within the teeing area. You may tee your ball anywhere within the teeing area.'
        },
        {
          title: 'Order of Play',
          description: 'The player with the lowest score on the previous hole has the honor. Away from the tee, the player farthest from the hole plays first.'
        },
        {
          title: 'Ball at Rest Moved',
          description: 'If your ball at rest is moved by you, your partner, or your equipment, add one penalty stroke and replace the ball.'
        }
      ]
    },
    {
      id: 'penalties',
      title: 'Penalties & Relief',
      icon: AlertTriangle,
      color: 'red',
      rules: [
        {
          title: 'Out of Bounds',
          description: 'If your ball goes out of bounds, you must play another ball from where you last played, adding one penalty stroke.'
        },
        {
          title: 'Water Hazard',
          description: 'If your ball goes in a water hazard, you have several options: play it as it lies, drop behind the hazard, or return to where you last played (each with penalties).'
        },
        {
          title: 'Unplayable Ball',
          description: 'You may declare your ball unplayable anywhere except in a water hazard. Take one penalty stroke and choose from three relief options.'
        }
      ]
    },
    {
      id: 'etiquette',
      title: 'Etiquette',
      icon: Users,
      color: 'blue',
      rules: [
        {
          title: 'Pace of Play',
          description: 'Play without delay. Be ready to play when it\'s your turn. If your group falls behind, invite faster groups to play through.'
        },
        {
          title: 'Care for the Course',
          description: 'Replace divots, repair ball marks on greens, and rake bunkers after use.'
        },
        {
          title: 'Safety',
          description: 'Never play until the group ahead is out of range. Shout "Fore!" if your ball might hit someone.'
        }
      ]
    },
    {
      id: 'scoring',
      title: 'Scoring',
      icon: Target,
      color: 'purple',
      rules: [
        {
          title: 'Stroke Play',
          description: 'Count every stroke, including penalty strokes. The player with the lowest total score wins.'
        },
        {
          title: 'Match Play',
          description: 'Each hole is a separate contest. The player who completes the hole in fewer strokes wins that hole.'
        },
        {
          title: 'Handicap',
          description: 'Handicaps allow players of different abilities to compete fairly. Subtract your handicap from your gross score to get your net score.'
        }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      red: 'bg-red-50 border-red-200 text-red-600',
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.emerald;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Golf Rules</h1>
          <p className="text-gray-600">Essential rules and etiquette for the game of golf</p>
        </div>

        {/* Rules Sections */}
        <div className="space-y-6">
          {rulesSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.id];

            return (
              <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg border ${getColorClasses(section.color)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                      <p className="text-gray-600">{section.rules.length} rules</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="space-y-4">
                      {section.rules.map((rule, index) => (
                        <div key={index} className="border-l-4 border-emerald-200 pl-4">
                          <h3 className="font-medium text-gray-900 mb-1">{rule.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{rule.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Reference */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Quick Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Common Penalties</h4>
              <ul className="space-y-1 text-emerald-100">
                <li>• Out of bounds: +1 stroke, replay</li>
                <li>• Water hazard: +1 stroke, various options</li>
                <li>• Lost ball: +1 stroke, replay</li>
                <li>• Unplayable lie: +1 stroke, relief options</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Etiquette</h4>
              <ul className="space-y-1 text-emerald-100">
                <li>• Repair divots and ball marks</li>
                <li>• Rake bunkers after use</li>
                <li>• Keep pace with group ahead</li>
                <li>• Stay quiet during others' shots</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default GolfRules;
