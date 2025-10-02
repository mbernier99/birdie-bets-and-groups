
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Search, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TournamentData } from '../CreateTournamentModal';
import { saveCourseToDatabase, SavedCourse } from '@/utils/courseDatabase';
import CourseSearchInput from './CourseSearchInput';
import CourseSummary from './CourseSummary';
import ScorecardEntry from './ScorecardEntry';
import EnhancedCourseSearch from '../golf/EnhancedCourseSearch';

interface CourseSetupStepProps {
  data: TournamentData;
  onDataChange: (key: keyof TournamentData, value: any) => void;
}

const CourseSetupStep: React.FC<CourseSetupStepProps> = ({ data, onDataChange }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('search');

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

  const handleCourseImport = (importedCourse: any) => {
    // Transform imported course data to tournament format
    let holes;
    
    // Get the holes array - check both hole_data (aliased) and holes (legacy)
    const holesData = importedCourse.hole_data || importedCourse.holes;
    
    // Check if holes is an array or needs to be converted
    if (Array.isArray(holesData) && holesData.length > 0) {
      holes = holesData
        .sort((a: any, b: any) => (a.hole_number || a.number || 0) - (b.hole_number || b.number || 0))
        .map((hole: any, index: number) => ({
          number: hole.hole_number || hole.number || index + 1,
          par: hole.par || 4,
          yardage: hole.yardage || 350,
          handicapIndex: hole.handicap || hole.handicap_index || index + 1
        }));
    } else {
      // Fallback to default 18 holes if no holes data
      holes = Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        par: 4,
        yardage: 350,
        handicapIndex: i + 1
      }));
    }

    onDataChange('course', {
      name: importedCourse.name,
      teeBox: 'white', // Default tee box, user can change
      rating: importedCourse.rating || 72.0,
      slope: importedCourse.slope || 113,
      holes: holes
    });

    toast({
      title: "Course Imported Successfully",
      description: `${importedCourse.name} has been imported and is ready for your tournament`,
    });

    // Switch to manual tab to allow modifications
    setActiveTab('manual');
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Search Online</span>
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Manual Entry</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Search Golf Courses</h4>
            <p className="text-sm text-blue-700">
              Search thousands of golf courses worldwide with complete scorecard details, ratings, and course information.
            </p>
          </div>
          
          <EnhancedCourseSearch onCourseImported={handleCourseImport} />
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
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

          {/* Enter Scorecard Section */}
          <ScorecardEntry
            holes={data.course.holes}
            onHoleChange={handleHoleChange}
          />
        </TabsContent>
      </Tabs>

      {/* Course Summary - Show when course data exists */}
      {data.course.name && (
        <CourseSummary
          totalPar={totalPar}
          totalYardage={totalYardage}
          rating={data.course.rating}
          slope={data.course.slope}
        />
      )}

      {/* Completion Status */}
      <div className={`p-4 rounded-lg border ${isComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h4 className={`font-medium mb-2 ${isComplete ? 'text-emerald-900' : 'text-yellow-900'}`}>
          {isComplete ? 'Course Setup Complete!' : 'Course Selection Required'}
        </h4>
        <p className={`text-sm mb-3 ${isComplete ? 'text-emerald-700' : 'text-yellow-700'}`}>
          {isComplete 
            ? 'Course information has been provided. You can proceed to select the game format.'
            : 'Please search for a course online or enter course details manually to continue.'
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
