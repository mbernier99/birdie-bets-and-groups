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
  const [localCourses, setLocalCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Load local courses on mount
  React.useEffect(() => {
    loadLocalCourses();
  }, []);

  const loadLocalCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          hole_data:holes(*),
          course_tees(*)
        `)
        .order('name');

      if (error) throw error;
      setLocalCourses(data || []);
    } catch (error) {
      console.error('Error loading local courses:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a course name to search');
      return;
    }

    setIsSearching(true);
    try {
      // First search local database
      const { data: localResults, error: localError } = await supabase
        .from('courses')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('name');

      if (localError) throw localError;

      // Convert local courses to search result format
      const formattedResults: CourseSearchResult[] = (localResults || []).map(course => ({
        id: course.id,
        name: course.name,
        city: course.location?.split(',')[0]?.trim() || '',
        state: course.location?.split(',')[1]?.trim() || '',
        holes: course.holes || 18,
        isLocal: true
      }));

      setSearchResults(formattedResults);

      if (formattedResults.length === 0) {
        toast.info('No courses found in database. Try the external API search.');
      } else {
        toast.success(`Found ${formattedResults.length} course${formattedResults.length !== 1 ? 's' : ''} in your database`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search for golf courses. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCourseSelect = async (course: CourseSearchResult & { isLocal?: boolean }) => {
    // If it's a local course, use it directly
    if (course.isLocal) {
      const localCourse = localCourses.find(c => c.id === course.id);
      if (localCourse) {
        onCourseImported?.(localCourse);
        toast.success(`${localCourse.name} loaded successfully`);
        setSearchResults([]);
        setSearchTerm('');
        return;
      }
    }

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
    <div className="space-y-4 h-full flex flex-col">
      {/* Search input at top */}
      <div className="flex-shrink-0">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Course"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="h-12"
        />
        <Button onClick={handleSearch} disabled={isSearching} className="w-full mt-2" size="sm">
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* Available courses below search */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {localCourses.length > 0 && !searchResults.length && (
          <div className="space-y-2">
            {localCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => {
                  onCourseImported?.(course);
                  toast.success(`${course.name} loaded successfully`);
                }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{course.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{course.location}</span>
                    <Badge variant="secondary" className="text-xs ml-2">
                      {typeof course.holes === 'number' ? course.holes : course.hole_data?.length || 18} holes
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Search Results ({searchResults.length})</Label>
            <div className="space-y-2">
              {searchResults.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{course.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{course.city}, {course.state}</span>
                      <Badge variant="secondary" className="text-xs ml-2">{course.holes} holes</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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