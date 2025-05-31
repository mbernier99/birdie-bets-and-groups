
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TournamentData } from '../CreateTournamentModal';
import { saveCourseToDatabase, SavedCourse } from '@/utils/courseDatabase';
import CourseSearchInput from './CourseSearchInput';
import CourseSummary from './CourseSummary';
import ScorecardEntry from './ScorecardEntry';

interface CourseSetupStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const CourseSetupStep: React.FC<CourseSetupStepProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();

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
        <CourseSearchInput
          courseName={data.course.name}
          onCourseNameChange={(name) => handleCourseChange('name', name)}
          onCourseLoad={loadCourseData}
          hasError={!data.course.name.trim()}
        />

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
      <CourseSummary
        totalPar={totalPar}
        totalYardage={totalYardage}
        rating={data.course.rating}
        slope={data.course.slope}
      />

      {/* Enter Scorecard Section */}
      <ScorecardEntry
        holes={data.course.holes}
        onHoleChange={handleHoleChange}
      />

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
