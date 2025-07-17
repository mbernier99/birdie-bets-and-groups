import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Flag, 
  Target,
  MapPin,
  Timer
} from 'lucide-react';
import { Round, Hole, HoleScore } from '@/hooks/useGolfRound';

interface MobileScorecardProps {
  round: Round;
  holes: Hole[];
  holeScores: HoleScore[];
  currentHole: number;
  onHoleChange: (holeNumber: number) => void;
  onScoreChange: (holeNumber: number, strokes: number, putts?: number) => void;
  onCompleteRound: () => void;
}

const MobileScorecard: React.FC<MobileScorecardProps> = ({
  round,
  holes,
  holeScores,
  currentHole,
  onHoleChange,
  onScoreChange,
  onCompleteRound
}) => {
  const [activeTab, setActiveTab] = useState<'score' | 'stats'>('score');
  
  const currentHoleData = holes.find(h => h.hole_number === currentHole);
  const currentScore = holeScores.find(s => s.hole_number === currentHole);
  
  const totalStrokes = holeScores.reduce((sum, score) => sum + score.strokes, 0);
  const totalPar = holes.slice(0, holeScores.length).reduce((sum, hole) => sum + hole.par, 0);
  const scoreToPar = totalStrokes - totalPar;
  
  const holesCompleted = holeScores.length;
  const progress = (holesCompleted / holes.length) * 100;

  const adjustScore = (change: number) => {
    const currentStrokes = currentScore?.strokes || 0;
    const newStrokes = Math.max(1, currentStrokes + change);
    onScoreChange(currentHole, newStrokes, currentScore?.putts || 0);
  };

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -2) return 'text-blue-600 font-bold'; // Eagle or better
    if (diff === -1) return 'text-green-600 font-bold'; // Birdie
    if (diff === 0) return 'text-gray-700'; // Par
    if (diff === 1) return 'text-orange-600'; // Bogey
    return 'text-red-600 font-bold'; // Double bogey or worse
  };

  const getScoreToPar = () => {
    if (scoreToPar === 0) return 'Even';
    if (scoreToPar > 0) return `+${scoreToPar}`;
    return `${scoreToPar}`;
  };

  return (
    <div className="space-y-4">
      {/* Round Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{round.course?.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Timer className="h-4 w-4 mr-1" />
                Started {new Date(round.started_at).toLocaleTimeString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{getScoreToPar()}</div>
              <div className="text-sm text-muted-foreground">
                {totalStrokes} total
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{holesCompleted}/{holes.length} holes</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Current Hole */}
      {currentHoleData && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHoleChange(Math.max(1, currentHole - 1))}
                disabled={currentHole === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Flag className="h-5 w-5 text-primary" />
                  <span className="text-xl font-bold">Hole {currentHole}</span>
                </div>
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Par {currentHoleData.par}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {currentHoleData.yardage} yds
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHoleChange(Math.min(holes.length, currentHole + 1))}
                disabled={currentHole === holes.length}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Score Input */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => adjustScore(-1)}
                  disabled={!currentScore || currentScore.strokes <= 1}
                  className="h-12 w-12 rounded-full"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                
                <div className="text-center min-w-[80px]">
                  <div className={`text-4xl font-bold ${
                    currentScore && currentHoleData 
                      ? getScoreColor(currentScore.strokes, currentHoleData.par)
                      : 'text-gray-400'
                  }`}>
                    {currentScore?.strokes || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">strokes</div>
                </div>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => adjustScore(1)}
                  className="h-12 w-12 rounded-full"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Quick Score Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Eagle', score: currentHoleData.par - 2, color: 'bg-blue-500' },
                  { label: 'Birdie', score: currentHoleData.par - 1, color: 'bg-green-500' },
                  { label: 'Par', score: currentHoleData.par, color: 'bg-gray-500' },
                  { label: 'Bogey', score: currentHoleData.par + 1, color: 'bg-orange-500' },
                ].map((option) => (
                  <Button
                    key={option.label}
                    variant={currentScore?.strokes === option.score ? "default" : "outline"}
                    size="sm"
                    onClick={() => onScoreChange(currentHole, option.score)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scorecard Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scorecard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2 text-sm">
            {holes.slice(0, 9).map((hole) => {
              const score = holeScores.find(s => s.hole_number === hole.hole_number);
              return (
                <div key={hole.hole_number} className="text-center">
                  <div className="font-medium">{hole.hole_number}</div>
                  <div className="text-xs text-muted-foreground">Par {hole.par}</div>
                  <div className={`font-bold ${
                    score ? getScoreColor(score.strokes, hole.par) : 'text-gray-300'
                  }`}>
                    {score?.strokes || '-'}
                  </div>
                </div>
              );
            })}
          </div>
          
          {holes.length > 9 && (
            <div className="grid grid-cols-6 gap-2 text-sm mt-4 pt-4 border-t">
              {holes.slice(9).map((hole) => {
                const score = holeScores.find(s => s.hole_number === hole.hole_number);
                return (
                  <div key={hole.hole_number} className="text-center">
                    <div className="font-medium">{hole.hole_number}</div>
                    <div className="text-xs text-muted-foreground">Par {hole.par}</div>
                    <div className={`font-bold ${
                      score ? getScoreColor(score.strokes, hole.par) : 'text-gray-300'
                    }`}>
                      {score?.strokes || '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Round Button */}
      {holesCompleted === holes.length && (
        <Button 
          onClick={onCompleteRound}
          className="w-full"
          size="lg"
        >
          Complete Round
        </Button>
      )}
    </div>
  );
};

export default MobileScorecard;