
import React from 'react';

interface GameTypeInfoProps {
  gameType: string;
}

export const GameTypeInfo: React.FC<GameTypeInfoProps> = ({ gameType }) => {
  if (gameType !== 'best-ball-match-play') return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h5 className="font-medium text-blue-900 mb-2">2-Man Best Ball Match Play Format</h5>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Teams are automatically created with 2 players each</li>
        <li>• Use numerical team assignment for easy organization</li>
        <li>• Players can edit their display names for the leaderboard</li>
        <li>• Teams will be paired against each other for matches</li>
        <li>• Each hole is won, lost, or halved between teams</li>
      </ul>
    </div>
  );
};
