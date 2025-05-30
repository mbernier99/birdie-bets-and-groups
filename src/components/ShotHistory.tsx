
import React from 'react';
import { Shot } from '../hooks/useShots';

interface ShotHistoryProps {
  shots: Shot[];
  currentHole: number;
  calculateDistance: (shot1: Shot, shot2: Shot) => number;
}

const ShotHistory: React.FC<ShotHistoryProps> = ({ shots, currentHole, calculateDistance }) => {
  const currentHoleShots = shots.filter(shot => shot.hole === currentHole).slice(-3);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Recent Shots</h3>
      {currentHoleShots.map((shot, index, arr) => {
        return (
          <div key={shot.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Shot {index + 1} - Hole {shot.hole}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(shot.timestamp).toLocaleTimeString()}
              </span>
            </div>
            {index > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Distance: {calculateDistance(arr[index - 1], shot).toFixed(0)}m
              </div>
            )}
            {shot.photo && (
              <div className="mt-2">
                <img
                  src={`data:image/jpeg;base64,${shot.photo}`}
                  alt="Shot"
                  className="w-16 h-16 rounded object-cover"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShotHistory;
