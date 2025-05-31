
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Search } from 'lucide-react';
import { searchCoursesByName, SavedCourse } from '@/utils/courseDatabase';

interface CourseSearchInputProps {
  courseName: string;
  onCourseNameChange: (name: string) => void;
  onCourseLoad: (course: SavedCourse) => void;
  hasError: boolean;
}

const CourseSearchInput: React.FC<CourseSearchInputProps> = ({
  courseName,
  onCourseNameChange,
  onCourseLoad,
  hasError
}) => {
  const [courseSearchResults, setCourseSearchResults] = useState<SavedCourse[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search for courses when course name changes
  useEffect(() => {
    if (courseName.trim().length >= 2) {
      const results = searchCoursesByName(courseName);
      setCourseSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setCourseSearchResults([]);
      setShowSearchResults(false);
    }
  }, [courseName]);

  const handleCourseSelect = (course: SavedCourse) => {
    onCourseLoad(course);
    setShowSearchResults(false);
  };

  return (
    <div className="space-y-2 relative">
      <Label htmlFor="course-name" className="flex items-center space-x-1">
        <span>Course Name</span>
        <span className="text-red-500">*</span>
      </Label>
      <div className="relative">
        <Input
          id="course-name"
          value={courseName}
          onChange={(e) => onCourseNameChange(e.target.value)}
          placeholder="Pine Valley Golf Club"
          className={`${hasError ? 'border-red-300 focus:border-red-500' : ''}`}
        />
        {courseName.trim().length >= 2 && (
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
              onClick={() => handleCourseSelect(course)}
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
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>Course name is required</span>
        </p>
      )}
    </div>
  );
};

export default CourseSearchInput;
