
import React from 'react';
import { Target, TrendingUp, Award } from 'lucide-react';

interface PlayerScore {
  hole: number;
  gross: number;
  net?: number;
}

interface ScorecardSummaryProps {
  playerName: string;
  scores: PlayerScore[];
  handicap?: number;
  className?: string;
}

const ScorecardSummary: React.FC<ScorecardSummaryProps> = ({ 
  playerName, 
  scores, 
  handicap = 0,
  className = ""
}) => {
  const calculateTotals = () => {
    const totalGross = scores.reduce((sum, score) => sum + score.gross, 0);
    const holesPlayed = scores.length;
    
    // Mock par calculation - replace with actual course data
    const parPerHole = scores.map(score => {
      const holeNumber = score.hole;
      return holeNumber % 5 === 0 ? 5 : holeNumber % 3 === 0 ? 3 : 4;
    });
    const totalPar = parPerHole.reduce((sum, par) => sum + par, 0);
    
    return {
      gross: totalGross,
      toPar: totalGross - totalPar,
      holesPlayed,
      average: holesPlayed > 0 ? (totalGross / holesPlayed).toFixed(1) : '0.0'
    };
  };

  const getScoreBreakdown = () => {
    let eagles = 0, birdies = 0, pars = 0, bogeys = 0, others = 0;
    
    scores.forEach(score => {
      const holeNumber = score.hole;
      const par = holeNumber % 5 === 0 ? 5 : holeNumber % 3 === 0 ? 3 : 4;
      const diff = score.gross - par;
      
      if (diff <= -2) eagles++;
      else if (diff === -1) birdies++;
      else if (diff === 0) pars++;
      else if (diff === 1) bogeys++;
      else others++;
    });
    
    return { eagles, birdies, pars, bogeys, others };
  };

  const totals = calculateTotals();
  const breakdown = getScoreBreakdown();

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{playerName}</h3>
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-emerald-600" />
          <span className="text-sm text-gray-600">HCP {handicap}</span>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totals.gross}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${
            totals.toPar > 0 ? 'text-red-600' : totals.toPar < 0 ? 'text-green-600' : 'text-gray-900'
          }`}>
            {totals.toPar >= 0 ? '+' : ''}{totals.toPar}
          </div>
          <div className="text-xs text-gray-500">To Par</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totals.holesPlayed}</div>
          <div className="text-xs text-gray-500">Holes</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Eagles:</span>
          <span className="font-medium text-yellow-600">{breakdown.eagles}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Birdies:</span>
          <span className="font-medium text-red-500">{breakdown.birdies}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pars:</span>
          <span className="font-medium text-gray-700">{breakdown.pars}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Bogeys:</span>
          <span className="font-medium text-blue-600">{breakdown.bogeys}</span>
        </div>
        {breakdown.others > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Others:</span>
            <span className="font-medium text-gray-800">{breakdown.others}</span>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{totals.holesPlayed}/18</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(totals.holesPlayed / 18) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScorecardSummary;
