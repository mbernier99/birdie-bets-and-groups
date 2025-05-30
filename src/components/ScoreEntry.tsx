
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Flag, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HoleData {
  number: number;
  par: number;
  yardage: number;
  handicap: number;
}

interface PlayerScore {
  hole: number;
  gross: number;
  net?: number;
}

interface ScoreEntryProps {
  playerId?: string;
  playerName?: string;
  onScoreChange?: (scores: PlayerScore[]) => void;
  onRoundComplete?: (finalScores: PlayerScore[]) => void;
}

const ScoreEntry: React.FC<ScoreEntryProps> = ({ 
  playerId = 'current-player',
  playerName = 'You',
  onScoreChange,
  onRoundComplete 
}) => {
  const [currentHole, setCurrentHole] = useState(1);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [roundInProgress, setRoundInProgress] = useState(false);

  // Mock course data - replace with actual course data
  const courseHoles: HoleData[] = Array.from({ length: 18 }, (_, i) => ({
    number: i + 1,
    par: i % 5 === 0 ? 5 : i % 3 === 0 ? 3 : 4,
    yardage: 150 + (i * 20),
    handicap: (i % 18) + 1
  }));

  const currentHoleData = courseHoles[currentHole - 1];
  const currentScore = scores.find(s => s.hole === currentHole)?.gross || null;

  useEffect(() => {
    loadSavedScores();
  }, []);

  const loadSavedScores = () => {
    const saved = localStorage.getItem('golf-round-scores');
    if (saved) {
      const savedScores = JSON.parse(saved);
      setScores(savedScores);
      setRoundInProgress(savedScores.length > 0);
      
      // Find the first hole without a score or last hole with score
      const lastScoredHole = savedScores.reduce((max: number, score: PlayerScore) => 
        Math.max(max, score.hole), 0);
      if (lastScoredHole < 18) {
        setCurrentHole(lastScoredHole + 1);
      }
    }
  };

  const saveScores = (newScores: PlayerScore[]) => {
    localStorage.setItem('golf-round-scores', JSON.stringify(newScores));
    onScoreChange?.(newScores);
  };

  const startRound = () => {
    setRoundInProgress(true);
    setCurrentHole(1);
    setScores([]);
    localStorage.removeItem('golf-round-scores');
  };

  const recordScore = (grossScore: number) => {
    const newScore: PlayerScore = {
      hole: currentHole,
      gross: grossScore
    };

    const updatedScores = scores.filter(s => s.hole !== currentHole);
    updatedScores.push(newScore);
    updatedScores.sort((a, b) => a.hole - b.hole);

    setScores(updatedScores);
    saveScores(updatedScores);

    // Auto-advance to next hole if not on hole 18
    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);
    } else {
      // Round complete
      onRoundComplete?.(updatedScores);
    }
  };

  const navigateToHole = (holeNumber: number) => {
    if (holeNumber >= 1 && holeNumber <= 18) {
      setCurrentHole(holeNumber);
    }
  };

  const getScoreColor = (score: number) => {
    const diff = score - currentHoleData.par;
    if (diff <= -2) return 'bg-yellow-500 text-white'; // Eagle or better
    if (diff === -1) return 'bg-red-500 text-white'; // Birdie
    if (diff === 0) return 'bg-gray-600 text-white'; // Par
    if (diff === 1) return 'bg-blue-600 text-white'; // Bogey
    return 'bg-gray-800 text-white'; // Double bogey or worse
  };

  const getTotalScore = () => {
    const totalGross = scores.reduce((sum, score) => sum + score.gross, 0);
    const holesPlayed = scores.length;
    const totalPar = scores.reduce((sum, score) => {
      const hole = courseHoles.find(h => h.number === score.hole);
      return sum + (hole?.par || 4);
    }, 0);
    
    return {
      gross: totalGross,
      toPar: totalGross - totalPar,
      holesPlayed
    };
  };

  if (!roundInProgress) {
    return (
      <div className="text-center p-6">
        <Flag className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Your Round</h2>
        <p className="text-gray-600 mb-6">Enter your scores hole by hole</p>
        <Button onClick={startRound} className="bg-emerald-600 hover:bg-emerald-700">
          <Flag className="h-4 w-4 mr-2" />
          Start Round
        </Button>
      </div>
    );
  }

  const totalScore = getTotalScore();

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(scores.length / 18) * 100}%` }}
        />
      </div>

      {/* Current Score Summary */}
      <div className="bg-emerald-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-emerald-600">Total Score</span>
            <div className="text-2xl font-bold text-emerald-900">
              {totalScore.gross} 
              <span className="text-lg ml-2">
                ({totalScore.toPar >= 0 ? '+' : ''}{totalScore.toPar})
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-emerald-600">Holes Played</span>
            <div className="text-xl font-semibold text-emerald-900">
              {totalScore.holesPlayed} / 18
            </div>
          </div>
        </div>
      </div>

      {/* Hole Navigation */}
      <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToHole(currentHole - 1)}
          disabled={currentHole === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">Hole {currentHole}</div>
          <div className="text-sm text-gray-600">
            Par {currentHoleData.par} • {currentHoleData.yardage} yards • HCP {currentHoleData.handicap}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToHole(currentHole + 1)}
          disabled={currentHole === 18}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Score Entry Buttons */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-lg font-semibold text-gray-700">Enter Your Score</span>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }, (_, i) => {
            const score = i + 1;
            const isSelected = currentScore === score;
            return (
              <Button
                key={score}
                onClick={() => recordScore(score)}
                className={`h-16 text-lg font-bold ${
                  isSelected 
                    ? getScoreColor(score)
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-500'
                }`}
                variant={isSelected ? "default" : "outline"}
              >
                {score}
              </Button>
            );
          })}
        </div>

        {/* Quick Par Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => recordScore(currentHoleData.par - 1)}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Birdie ({currentHoleData.par - 1})
          </Button>
          <Button
            onClick={() => recordScore(currentHoleData.par)}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Par ({currentHoleData.par})
          </Button>
          <Button
            onClick={() => recordScore(currentHoleData.par + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Bogey ({currentHoleData.par + 1})
          </Button>
        </div>
      </div>

      {/* Current Score Display */}
      {currentScore && (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <span className="text-sm text-gray-600">Current Score for Hole {currentHole}</span>
          <div className={`inline-block px-4 py-2 rounded-lg ml-2 font-bold ${getScoreColor(currentScore)}`}>
            {currentScore}
          </div>
        </div>
      )}

      {/* Round Complete */}
      {scores.length === 18 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
          <Target className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-emerald-900 mb-2">Round Complete!</h3>
          <p className="text-emerald-700 mb-4">
            Final Score: {totalScore.gross} ({totalScore.toPar >= 0 ? '+' : ''}{totalScore.toPar})
          </p>
          <Button onClick={startRound} className="bg-emerald-600 hover:bg-emerald-700">
            <Flag className="h-4 w-4 mr-2" />
            Start New Round
          </Button>
        </div>
      )}
    </div>
  );
};

export default ScoreEntry;
