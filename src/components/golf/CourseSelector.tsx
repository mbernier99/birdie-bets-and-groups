import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Target, Trophy, Star, Search, Plus } from 'lucide-react';
import { useGolfCourses, CourseWithTees } from '@/hooks/useGolfCourses';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import EnhancedCourseSearch from './EnhancedCourseSearch';

interface CourseSelectorProps {
  onSelectCourse: (courseId: string, teeId?: string) => void;
  loading?: boolean;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  onSelectCourse,
  loading = false
}) => {
  const { 
    courses, 
    favorites, 
    loading: coursesLoading, 
    toggleFavorite, 
    searchCourses, 
    getFavoriteCourses, 
    getRecentCourses,
    fetchCourses 
  } = useGolfCourses();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTee, setSelectedTee] = useState<{[courseId: string]: string}>({});
  const [currentView, setCurrentView] = useState<'all' | 'favorites' | 'recent'>('all');

  const handleCourseImported = () => {
    fetchCourses();
  };

  const getDisplayCourses = (): CourseWithTees[] => {
    let baseCourses: CourseWithTees[] = [];
    
    switch (currentView) {
      case 'favorites':
        baseCourses = getFavoriteCourses();
        break;
      case 'recent':
        baseCourses = getRecentCourses();
        break;
      default:
        baseCourses = courses;
    }
    
    return searchTerm ? searchCourses(searchTerm) : baseCourses;
  };

  const displayCourses = getDisplayCourses();

  const handleStartRound = (course: CourseWithTees) => {
    const teeId = selectedTee[course.id];
    onSelectCourse(course.id, teeId);
  };

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Target className="h-8 w-8 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Course</h2>
        <p className="text-muted-foreground">Choose a golf course and tee to start your round</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={currentView === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('all')}
          >
            All ({courses.length})
          </Button>
          <Button
            variant={currentView === 'favorites' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('favorites')}
          >
            <Star className="h-3 w-3 mr-1" />
            Favorites ({favorites.length})
          </Button>
          <Button
            variant={currentView === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView('recent')}
          >
            Recent
          </Button>
        </div>
      </div>

      {/* Add Course Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Import New Course
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl">
          <EnhancedCourseSearch onCourseImported={handleCourseImported} />
        </DialogContent>
      </Dialog>
      
      {/* Courses Grid */}
      <div className="grid gap-4">
        {displayCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(course.id)}
                      className="p-1 h-auto"
                    >
                      <Star className={`h-4 w-4 ${favorites.includes(course.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                  {course.location && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {course.location}
                    </div>
                  )}
                </div>
                <Badge variant="secondary" className="ml-2">
                  Par {course.par || 'N/A'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1 text-primary" />
                    <span>{course.holes} holes</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-primary" />
                    <span>{course.course_tees?.length || 0} tees</span>
                  </div>
                </div>
              </div>

              {/* Tee Selection */}
              {course.course_tees && course.course_tees.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Tee:</label>
                  <Select
                    value={selectedTee[course.id] || ''}
                    onValueChange={(value) => setSelectedTee(prev => ({ ...prev, [course.id]: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose tees" />
                    </SelectTrigger>
                    <SelectContent>
                      {course.course_tees.map((tee) => (
                        <SelectItem key={tee.id} value={tee.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {tee.tee_color && (
                                <div
                                  className="w-3 h-3 rounded-full border"
                                  style={{ backgroundColor: tee.tee_color }}
                                />
                              )}
                              <span>{tee.tee_name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground ml-2">
                              {tee.rating && `${tee.rating}/${tee.slope}`}
                              {tee.total_yardage && ` • ${tee.total_yardage}y`}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button 
                onClick={() => handleStartRound(course)}
                disabled={loading}
                className="w-full"
                size="sm"
              >
                {loading ? 'Starting Round...' : 'Start Round'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {displayCourses.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {searchTerm ? (
                <>
                  <p>No courses found matching "{searchTerm}"</p>
                  <p className="text-sm mt-2">Try a different search term or import a new course</p>
                </>
              ) : currentView === 'favorites' ? (
                <>
                  <p>No favorite courses yet</p>
                  <p className="text-sm mt-2">Star your favorite courses to see them here</p>
                </>
              ) : (
                <>
                  <p>No courses available yet</p>
                  <p className="text-sm mt-2">Import courses to get started</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseSelector;