import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CourseWithTees {
  id: string;
  name: string;
  location?: string;
  holes: number;
  par?: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
  course_tees: Array<{
    id: string;
    tee_name: string;
    tee_color?: string;
    rating?: number;
    slope?: number;
    total_yardage?: number;
  }>;
}

export interface CourseHole {
  id: string;
  hole_number: number;
  par: number;
  handicap?: number;
  hole_tees: Array<{
    id: string;
    tee_id: string;
    yardage: number;
    course_tees: {
      tee_name: string;
    };
  }>;
}

export const useGolfCourses = () => {
  const [courses, setCourses] = useState<CourseWithTees[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchFavorites();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_tees (
            id,
            tee_name,
            tee_color,
            rating,
            slope,
            total_yardage
          )
        `)
        .order('name');

      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load golf courses');
      toast.error('Failed to load golf courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_course_favorites')
        .select('course_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.course_id) || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const getCourseHoles = async (courseId: string): Promise<CourseHole[]> => {
    try {
      const { data, error } = await supabase
        .from('holes')
        .select(`
          *,
          hole_tees (
            id,
            tee_id,
            yardage,
            course_tees (
              tee_name
            )
          )
        `)
        .eq('course_id', courseId)
        .order('hole_number');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching course holes:', err);
      throw err;
    }
  };

  const toggleFavorite = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save favorites');
        return;
      }

      const isFavorite = favorites.includes(courseId);

      if (isFavorite) {
        const { error } = await supabase
          .from('user_course_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== courseId));
        toast.success('Removed from favorites');
      } else {
        const { error } = await supabase
          .from('user_course_favorites')
          .insert({
            user_id: user.id,
            course_id: courseId,
          });

        if (error) throw error;
        setFavorites(prev => [...prev, courseId]);
        toast.success('Added to favorites');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Failed to update favorites');
    }
  };

  const searchCourses = (searchTerm: string): CourseWithTees[] => {
    if (!searchTerm.trim()) return courses;
    
    return courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFavoriteCourses = (): CourseWithTees[] => {
    return courses.filter(course => favorites.includes(course.id));
  };

  const getRecentCourses = (): CourseWithTees[] => {
    // For now, just return the most recently created courses
    // In the future, this could track actual usage
    return [...courses]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  return {
    courses,
    favorites,
    loading,
    error,
    fetchCourses,
    getCourseHoles,
    toggleFavorite,
    searchCourses,
    getFavoriteCourses,
    getRecentCourses,
  };
};