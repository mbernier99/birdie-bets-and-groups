import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Import, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CourseSearchResult {
  id: string;
  name: string;
  city: string;
  state: string;
  rating?: number;
  holes: number;
  description?: string;
}

interface TeeData {
  name: string;
  color?: string;
  rating?: number;
  slope?: number;
  yardage?: number;
  holes: Array<{
    number: number;
    par: number;
    yardage: number;
    handicap?: number;
  }>;
}

interface CourseDetails {
  id: string;
  name: string;
  location: string;
  holes: number;
  tees: TeeData[];
}

interface EnhancedCourseSearchProps {
  onCourseImported?: (course: any) => void;
}

const EnhancedCourseSearch: React.FC<EnhancedCourseSearchProps> = ({ onCourseImported }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchState, setSearchState] = useState('');
  const [searchResults, setSearchResults] = useState<CourseSearchResult[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a course name to search');
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('golf-course-search', {
        body: {
          action: 'search',
          searchParams: {
            name: searchTerm,
            city: searchCity || undefined,
            state: searchState || undefined,
            limit: 10,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        setSearchResults(data.data.courses || []);
        if (data.data.courses?.length === 0) {
          toast.info('No courses found matching your search criteria');
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search for golf courses. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCourseSelect = async (course: CourseSearchResult) => {
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase.functions.invoke('golf-course-search', {
        body: {
          action: 'details',
          courseId: course.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        setSelectedCourse(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Details error:', error);
      toast.error('Failed to load course details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleImportCourse = async () => {
    if (!selectedCourse) return;

    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('golf-course-search', {
        body: {
          action: 'import',
          importData: selectedCourse,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`${selectedCourse.name} has been imported successfully!`);
        onCourseImported?.(data.data);
        setSelectedCourse(null);
        setSearchResults([]);
        setSearchTerm('');
        setSearchCity('');
        setSearchState('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import course. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Golf Courses</span>
          </CardTitle>
          <CardDescription>
            Search thousands of golf courses and import their scorecards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">Course Name *</Label>
              <Input
                id="course-name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pine Valley Golf Club"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <Input
                id="city"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Augusta"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State (Optional)</Label>
              <Input
                id="state"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value)}
                placeholder="GA"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={isSearching} className="w-full">
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Courses
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {searchResults.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{course.city}, {course.state}</span>
                      <Badge variant="secondary">{course.holes} holes</Badge>
                      {course.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{course.rating}</span>
                        </div>
                      )}
                    </div>
                    {course.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Details Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.name}</DialogTitle>
            <DialogDescription>{selectedCourse?.location}</DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading course details...</span>
            </div>
          ) : selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Holes</Label>
                  <p className="font-semibold">{selectedCourse.holes}</p>
                </div>
                <div>
                  <Label>Available Tees</Label>
                  <p className="font-semibold">{selectedCourse.tees?.length || 0}</p>
                </div>
              </div>

              {selectedCourse.tees && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tee Information</h3>
                  {selectedCourse.tees.map((tee, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{tee.name} Tees</CardTitle>
                          {tee.color && (
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: tee.color }}
                            />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {tee.yardage && (
                            <div>
                              <Label>Total Yardage</Label>
                              <p className="font-semibold">{tee.yardage}</p>
                            </div>
                          )}
                          {tee.rating && (
                            <div>
                              <Label>Rating</Label>
                              <p className="font-semibold">{tee.rating}</p>
                            </div>
                          )}
                          {tee.slope && (
                            <div>
                              <Label>Slope</Label>
                              <p className="font-semibold">{tee.slope}</p>
                            </div>
                          )}
                        </div>
                        
                        {tee.holes && tee.holes.length > 0 && (
                          <div className="mt-4">
                            <Label>Hole Details</Label>
                            <div className="grid grid-cols-9 gap-1 text-xs mt-2">
                              {tee.holes.slice(0, 9).map((hole) => (
                                <div key={hole.number} className="text-center p-1 border rounded">
                                  <div className="font-semibold">{hole.number}</div>
                                  <div>Par {hole.par}</div>
                                  <div>{hole.yardage}y</div>
                                </div>
                              ))}
                            </div>
                            {tee.holes.length > 9 && (
                              <div className="grid grid-cols-9 gap-1 text-xs mt-1">
                                {tee.holes.slice(9).map((hole) => (
                                  <div key={hole.number} className="text-center p-1 border rounded">
                                    <div className="font-semibold">{hole.number}</div>
                                    <div>Par {hole.par}</div>
                                    <div>{hole.yardage}y</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                  Cancel
                </Button>
                <Button onClick={handleImportCourse} disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Import className="mr-2 h-4 w-4" />
                      Import Course
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedCourseSearch;