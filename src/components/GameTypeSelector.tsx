
import React, { useState } from 'react';
import { Trophy, Users, Target, Award } from 'lucide-react';

const gameTypes = [
  {
    id: 'bestball',
    name: '2-Man Best Ball',
    description: 'Teams of 2, lowest score on each hole counts',
    icon: Users,
    minPlayers: 4,
    maxPlayers: 16
  },
  {
    id: 'matchplay',
    name: 'Match Play',
    description: 'Head-to-head competition, win holes not strokes',
    icon: Target,
    minPlayers: 2,
    maxPlayers: 8
  },
  {
    id: 'wolf',
    name: 'Wolf',
    description: 'Rotating partnerships with betting strategy',
    icon: Trophy,
    minPlayers: 4,
    maxPlayers: 4
  },
  {
    id: 'nassau',
    name: 'Nassau',
    description: 'Three separate bets: front 9, back 9, and overall',
    icon: Award,
    minPlayers: 2,
    maxPlayers: 8
  }
];

interface GameTypeSelectorProps {
  selectedGame: string;
  onGameSelect: (gameId: string) => void;
}

const GameTypeSelector: React.FC<GameTypeSelectorProps> = ({ selectedGame, onGameSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Game Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gameTypes.map((game) => {
          const IconComponent = game.icon;
          const isSelected = selectedGame === game.id;
          
          return (
            <div
              key={game.id}
              onClick={() => onGameSelect(game.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-25'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-500' : 'bg-gray-100'}`}>
                  <IconComponent className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{game.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{game.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {game.minPlayers === game.maxPlayers 
                      ? `${game.minPlayers} players` 
                      : `${game.minPlayers}-${game.maxPlayers} players`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameTypeSelector;
