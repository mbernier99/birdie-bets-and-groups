import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Target, Trophy } from 'lucide-react';
import { Course } from '@/hooks/useGolfRound';

interface CourseSelectorProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  loading?: boolean;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  onSelectCourse,
  loading = false
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Course</h2>
        <p className="text-muted-foreground">Choose a golf course to start your round</p>
      </div>
      
      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {course.location}
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2">
                  Par {course.par}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1 text-primary" />
                    <span>{course.holes} holes</span>
                  </div>
                  {course.rating && (
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-1 text-primary" />
                      <span>{course.rating}/{course.slope}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => onSelectCourse(course.id)}
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
      
      {courses.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses available yet.</p>
              <p className="text-sm mt-2">More courses will be added soon!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseSelector;