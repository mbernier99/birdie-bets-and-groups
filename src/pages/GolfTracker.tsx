import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Target, 
  TrendingUp,
  Calendar,
  Activity,
  Gamepad2
} from 'lucide-react';
import MobileNavigation from '@/components/MobileNavigation';
import MobileHeader from '@/components/MobileHeader';
import CourseSelector from '@/components/golf/CourseSelector';
import MobileScorecard from '@/components/golf/MobileScorecard';
import EnhancedShotTracker from '@/components/golf/EnhancedShotTracker';
import { useGolfRound } from '@/hooks/useGolfRound';

const GolfTracker = () => {
  const [currentHole, setCurrentHole] = useState(1);
  const [activeTab, setActiveTab] = useState('scorecard');
  
  const {
    currentRound,
    courses,
    holes,
    holeScores,
    shots,
    loading,
    startRound,
    completeRound,
    recordHoleScore,
    recordShot
  } = useGolfRound();

  const handleStartRound = async (courseId: string, teeId?: string) => {
    await startRound(courseId, teeId);
    setCurrentHole(1);
    setActiveTab('scorecard');
  };

  const handleRecordShot = async (
    holeNumber: number,
    shotNumber: number,
    latitude: number,
    longitude: number,
    shotType: any,
    club?: string,
    accuracy?: any,
    distanceYards?: number,
    photoUrl?: string,
    notes?: string
  ) => {
    await recordShot(
      holeNumber,
      shotNumber,
      latitude,
      longitude,
      shotType,
      club,
      accuracy,
      distanceYards,
      photoUrl,
      notes
    );
  };

  // If no current round, show course selector
  if (!currentRound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
        <MobileHeader />
        <div className="max-w-md mx-auto px-4 sm:px-6 py-6">
          <CourseSelector 
            onSelectCourse={handleStartRound}
            loading={loading}
          />
        </div>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      
      <div className="max-w-md mx-auto px-4 sm:px-6 py-6">
        {/* Round Header */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Gamepad2 className="h-5 w-5 mr-2 text-primary" />
                  {currentRound.course?.name}
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  Started {new Date(currentRound.started_at).toLocaleString()}
                </div>
              </div>
              <Badge variant="secondary">
                Live Round
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scorecard" className="text-xs">
              <Target className="h-4 w-4 mr-1" />
              Score
            </TabsTrigger>
            <TabsTrigger value="shots" className="text-xs">
              <MapPin className="h-4 w-4 mr-1" />
              Shots
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">
              <TrendingUp className="h-4 w-4 mr-1" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scorecard" className="space-y-4">
            <MobileScorecard
              round={currentRound}
              holes={holes}
              holeScores={holeScores}
              currentHole={currentHole}
              onHoleChange={setCurrentHole}
              onScoreChange={recordHoleScore}
              onCompleteRound={completeRound}
            />
          </TabsContent>

          <TabsContent value="shots" className="space-y-4">
            <EnhancedShotTracker
              currentHole={currentHole}
              onRecordShot={handleRecordShot}
              shots={shots}
              roundId={currentRound.id}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Round Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {holeScores.reduce((sum, score) => sum + score.strokes, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Strokes</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {holeScores.reduce((sum, score) => sum + score.putts, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Putts</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {holeScores.filter(score => score.fairway_hit).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Fairways Hit</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {holeScores.filter(score => score.green_in_regulation).length}
                    </div>
                    <div className="text-sm text-muted-foreground">GIR</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {shots.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Shots Tracked</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {holeScores.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Holes Played</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shot Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shot Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['drive', 'approach', 'chip', 'putt', 'penalty'].map((type) => {
                    const typeShots = shots.filter(shot => shot.shot_type === type);
                    const percentage = shots.length > 0 ? (typeShots.length / shots.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{type}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{typeShots.length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default GolfTracker;