import React, { useState } from 'react';
import { MapPin, Camera, Plus, Save, Target, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import CourseSetupStep from '../tournament-creation/CourseSetupStep';
import ReferencePointCapture from './ReferencePointCapture';
import { EnhancedCourseData, CourseReferencePoint } from '@/types/course';
import { TournamentData } from '../CreateTournamentModal';

interface EnhancedCourseSetupProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const EnhancedCourseSetup: React.FC<EnhancedCourseSetupProps> = ({
  data,
  onDataChange
}) => {
  const [referencePoints, setReferencePoints] = useState<CourseReferencePoint[]>([]);
  const [selectedHole, setSelectedHole] = useState<number>(1);
  const [activeTab, setActiveTab] = useState('basic');
  const { toast } = useToast();

  const handleReferencePointAdded = (referencePoint: CourseReferencePoint) => {
    const updatedPoints = [...referencePoints, referencePoint];
    setReferencePoints(updatedPoints);
    
    // Update course data with reference points
    const enhancedCourse = {
      ...data.course,
      referencePoints: updatedPoints.filter(p => !p.holeNumber),
      holes: data.course.holes.map(hole => ({
        ...hole,
        teeBoxes: {},
        pinPositions: {},
        referencePoints: updatedPoints.filter(p => p.holeNumber === hole.number)
      }))
    };
    
    onDataChange('course', enhancedCourse);
  };

  const getSetupProgress = () => {
    let progress = 0;
    if (data.course.name) progress += 40;
    if (data.course.holes.length === 18 && data.course.holes.every(h => h.par && h.yardage)) progress += 40;
    if (referencePoints.length >= 3) progress += 20;
    return progress;
  };

  const getHoleReferenceCount = (holeNumber: number) => {
    return referencePoints.filter(p => p.holeNumber === holeNumber).length;
  };

  const getTotalReferenceCount = () => {
    return referencePoints.length;
  };

  const getCourseReferenceCount = () => {
    return referencePoints.filter(p => !p.holeNumber).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            Enhanced Course Setup
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={getSetupProgress()} className="h-2" />
            </div>
            <Badge variant={getSetupProgress() === 100 ? 'default' : 'secondary'}>
              {getSetupProgress()}% Complete
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Basic Course
          </TabsTrigger>
          <TabsTrigger value="references" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Reference Points
          </TabsTrigger>
          <TabsTrigger value="precision" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Precision Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <CourseSetupStep data={data} onDataChange={onDataChange} />
        </TabsContent>

        <TabsContent value="references" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Course Reference Points
                </div>
                <Badge variant="outline">
                  {getTotalReferenceCount()} Total Points
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 mb-1">Course-Wide References</div>
                  <div className="text-2xl font-bold text-blue-700">{getCourseReferenceCount()}</div>
                  <div className="text-xs text-blue-600">Clubhouse, parking, etc.</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-900 mb-1">Hole-Specific References</div>
                  <div className="text-2xl font-bold text-green-700">{getTotalReferenceCount() - getCourseReferenceCount()}</div>
                  <div className="text-xs text-green-600">Markers, pins, hazards</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-medium mb-3">Add Course-Wide Reference Point</div>
                <ReferencePointCapture
                  onReferencePointAdded={handleReferencePointAdded}
                  existingPoints={referencePoints.filter(p => !p.holeNumber)}
                />
              </div>

              <div className="space-y-4">
                <div className="text-sm font-medium">Hole-Specific Reference Points</div>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((holeNum) => (
                    <Button
                      key={holeNum}
                      variant={selectedHole === holeNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedHole(holeNum)}
                      className="relative"
                    >
                      {holeNum}
                      {getHoleReferenceCount(holeNum) > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                        >
                          {getHoleReferenceCount(holeNum)}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                <ReferencePointCapture
                  onReferencePointAdded={handleReferencePointAdded}
                  existingPoints={referencePoints.filter(p => p.holeNumber === selectedHole)}
                  holeNumber={selectedHole}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="precision" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-purple-600" />
                Precision Betting Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                <h4 className="font-semibold text-purple-900 mb-2">Enhanced Accuracy Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Triangulation using reference points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Course boundary constraints</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Photo verification for close calls</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Smart shot validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Multi-reference point betting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span>Impossible shot detection</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-700">{getTotalReferenceCount()}</div>
                  <div className="text-sm text-gray-600">Reference Points</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getTotalReferenceCount() >= 3 ? '✅ Triangulation Ready' : '⚠️ Need 3+ for triangulation'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {referencePoints.filter(p => (p.confidenceScore || 0) > 0.7).length}
                  </div>
                  <div className="text-sm text-gray-600">High-Confidence Points</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {referencePoints.filter(p => (p.confidenceScore || 0) > 0.7).length >= 2 ? '✅ Precision Betting Ready' : '⚠️ Need 2+ high-confidence'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-700">
                    {data.course.holes.filter(h => getHoleReferenceCount(h.number) > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Holes with References</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {data.course.holes.filter(h => getHoleReferenceCount(h.number) > 0).length >= 9 ? '✅ Good Coverage' : '⚠️ Add more hole references'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Expected Accuracy Improvements</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm">Standard GPS Only</span>
                    <Badge variant="destructive">±3-10m</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-sm">With Course Constraints</span>
                    <Badge variant="secondary">±2-5m</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm">With Reference Point Triangulation</span>
                    <Badge variant="default">±0.5-2m</Badge>
                  </div>
                </div>
              </div>

              {getTotalReferenceCount() >= 3 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                    <Target className="h-4 w-4" />
                    Precision Betting Enabled!
                  </div>
                  <div className="text-sm text-green-700">
                    Your course now has enough reference points to enable sub-meter accuracy betting, 
                    photo verification for close calls, and smart shot validation.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCourseSetup;