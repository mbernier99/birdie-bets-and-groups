
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TournamentData } from '../CreateTournamentModal';
import { saveCourseToDatabase, searchCoursesByName, SavedCourse } from '@/utils/courseDatabase';

interface CourseSetupStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const CourseSetupStep: React.FC<CourseSetupStepProps> = ({ data, onDataChange }) => {
  const [viewMode, setViewMode] = useState<'summary' | 'scorecard'>('summary');
  const [courseSearchResults, setCourseSearchResults] = useState<SavedCourse[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { toast } = useToast();

  // Search for courses when course name changes
  useEffect(() => {
    if (data.course.name.trim().length >= 2) {
      const results = searchCoursesByName(data.course.name);
      setCourseSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setCourseSearchResults([]);
      setShowSearchResults(false);
    }
  }, [data.course.name]);

  const handleCourseChange = (field: string, value: any) => {
    onDataChange('course', {
      ...data.course,
      [field]: value
    });
  };

  const handleHoleChange = (holeIndex: number, field: string, value: any) => {
    const updatedHoles = [...data.course.holes];
    updatedHoles[holeIndex] = {
      ...updatedHoles[holeIndex],
      [field]: field === 'par' || field === 'yardage' || field === 'handicapIndex' ? parseInt(value) : value
    };
    handleCourseChange('holes', updatedHoles);
  };

  const loadCourseData = (savedCourse: SavedCourse) => {
    onDataChange('course', {
      name: savedCourse.name,
      teeBox: savedCourse.teeBox,
      rating: savedCourse.rating,
      slope: savedCourse.slope,
      holes: [...savedCourse.holes]
    });
    setShowSearchResults(false);
    toast({
      title: "Course Data Loaded",
      description: `Successfully loaded data for ${savedCourse.name}`,
    });
  };

  const saveCourseData = () => {
    if (!data.course.name.trim()) {
      toast({
        title: "Cannot Save Course",
        description: "Please enter a course name first",
        variant: "destructive"
      });
      return;
    }

    const courseToSave: SavedCourse = {
      name: data.course.name,
      teeBox: data.course.teeBox,
      rating: data.course.rating,
      slope: data.course.slope,
      holes: [...data.course.holes],
      lastUsed: new Date().toISOString()
    };

    saveCourseToDatabase(courseToSave);
    toast({
      title: "Course Saved",
      description: `${data.course.name} has been saved to the course database`,
    });
  };

  const totalPar = data.course.holes.reduce((sum, hole) => sum + hole.par, 0);
  const totalYardage = data.course.holes.reduce((sum, hole) => sum + hole.yardage, 0);
  const isComplete = data.course.name.trim();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Course Setup</h3>
      
      {/* Course Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div className="space-y-2 relative">
          <Label htmlFor="course-name" className="flex items-center space-x-1">
            <span>Course Name</span>
            <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="course-name"
              value={data.course.name}
              onChange={(e) => handleCourseChange('name', e.target.value)}
              placeholder="Pine Valley Golf Club"
              className={`${!data.course.name.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
            />
            {data.course.name.trim().length >= 2 && (
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            )}
          </div>
          
          {/* Course Search Results */}
          {showSearchResults && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 text-xs text-gray-500 border-b">
                Found {courseSearchResults.length} matching course{courseSearchResults.length !== 1 ? 's' : ''}
              </div>
              {courseSearchResults.map((course, index) => (
                <button
                  key={index}
                  onClick={() => loadCourseData(course)}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{course.name}</div>
                  <div className="text-xs text-gray-500">
                    {course.teeBox} tees • Par {course.holes.reduce((sum, hole) => sum + hole.par, 0)} • 
                    Rating {course.rating} • Slope {course.slope}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {!data.course.name.trim() && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>Course name is required</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Tee Box</Label>
          <Select value={data.course.teeBox} onValueChange={(value) => handleCourseChange('teeBox', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="black">Black Tees (Championship)</SelectItem>
              <SelectItem value="blue">Blue Tees (Men's)</SelectItem>
              <SelectItem value="white">White Tees (Regular)</SelectItem>
              <SelectItem value="red">Red Tees (Forward)</SelectItem>
              <SelectItem value="gold">Gold Tees (Senior)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="course-rating">Course Rating</Label>
          <Input
            id="course-rating"
            type="number"
            step="0.1"
            value={data.course.rating}
            onChange={(e) => handleCourseChange('rating', parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-slope">Slope Rating</Label>
          <Input
            id="course-slope"
            type="number"
            value={data.course.slope}
            onChange={(e) => handleCourseChange('slope', parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Save Course Button */}
      {isComplete && (
        <div className="flex justify-end">
          <Button
            onClick={saveCourseData}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Course to Database</span>
          </Button>
        </div>
      )}

      {/* Course Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-600">{totalPar}</div>
            <div className="text-sm text-gray-600">Total Par</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{totalYardage.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Yardage</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{data.course.rating}</div>
            <div className="text-sm text-gray-600">Course Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{data.course.slope}</div>
            <div className="text-sm text-gray-600">Slope Rating</div>
          </div>
        </div>
      </div>

      {/* Enter Scorecard Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Enter Scorecard (Optional)</h4>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'summary' ? 'default' : 'outline'}
              onClick={() => setViewMode('summary')}
              size="sm"
            >
              Hide Scorecard
            </Button>
            <Button
              variant={viewMode === 'scorecard' ? 'default' : 'outline'}
              onClick={() => setViewMode('scorecard')}
              size="sm"
            >
              Edit Scorecard
            </Button>
          </div>
        </div>

        {viewMode === 'scorecard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 pb-2 border-b">
              <div>Hole</div>
              <div>Par</div>
              <div>Yardage</div>
              <div>HCP Index</div>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {data.course.holes.map((hole, index) => (
                <div key={hole.number} className="grid grid-cols-4 gap-2 items-center">
                  <div className="font-medium">{hole.number}</div>
                  <Input
                    type="number"
                    min="3"
                    max="6"
                    value={hole.par}
                    onChange={(e) => handleHoleChange(index, 'par', e.target.value)}
                    className="h-8"
                  />
                  <Input
                    type="number"
                    min="100"
                    max="800"
                    value={hole.yardage}
                    onChange={(e) => handleHoleChange(index, 'yardage', e.target.value)}
                    className="h-8"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="18"
                    value={hole.handicapIndex}
                    onChange={(e) => handleHoleChange(index, 'handicapIndex', e.target.value)}
                    className="h-8"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Status */}
      <div className={`p-4 rounded-lg border ${isComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h4 className={`font-medium mb-2 ${isComplete ? 'text-emerald-900' : 'text-yellow-900'}`}>
          {isComplete ? 'Course Setup Complete!' : 'Course Name Required'}
        </h4>
        <p className={`text-sm mb-3 ${isComplete ? 'text-emerald-700' : 'text-yellow-700'}`}>
          {isComplete 
            ? 'Course information has been provided. You can proceed to select the game format.'
            : 'Please enter a course name to continue to the next step.'
          }
        </p>
        <div className={`text-xs ${isComplete ? 'text-emerald-600' : 'text-yellow-600'}`}>
          Next: Choose your tournament game type and rules
        </div>
      </div>
    </div>
  );
};

export default CourseSetupStep;
