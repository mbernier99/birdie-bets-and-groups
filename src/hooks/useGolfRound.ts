import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Course {
  id: string;
  name: string;
  location: string;
  par: number;
  holes: number;
  rating: number;
  slope: number;
  latitude: number;
  longitude: number;
}

export interface Hole {
  id: string;
  course_id: string;
  hole_number: number;
  par: number;
  yardage: number;
  handicap: number;
  tee_latitude: number;
  tee_longitude: number;
  green_latitude: number;
  green_longitude: number;
}

export interface Round {
  id: string;
  user_id: string;
  course_id: string;
  started_at: string;
  completed_at?: string;
  total_score?: number;
  total_putts?: number;
  fairways_hit?: number;
  greens_in_regulation?: number;
  weather?: string;
  notes?: string;
  course?: Course;
}

export interface HoleScore {
  id: string;
  round_id: string;
  hole_number: number;
  strokes: number;
  putts: number;
  fairway_hit: boolean;
  green_in_regulation: boolean;
  penalties: number;
}

export interface Shot {
  id: string;
  round_id: string;
  hole_number: number;
  shot_number: number;
  club?: string;
  shot_type: 'drive' | 'approach' | 'chip' | 'putt' | 'penalty';
  latitude: number;
  longitude: number;
  distance_yards?: number;
  accuracy?: 'fairway' | 'rough' | 'bunker' | 'water' | 'green' | 'pin';
  photo_url?: string;
  notes?: string;
  timestamp: string;
}

export const useGolfRound = () => {
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [holes, setHoles] = useState<Hole[]>([]);
  const [holeScores, setHoleScores] = useState<HoleScore[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load courses
  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    }
  };

  // Load holes for a course
  const loadHoles = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('holes')
        .select('*')
        .eq('course_id', courseId)
        .order('hole_number');
      
      if (error) throw error;
      setHoles(data || []);
    } catch (error) {
      console.error('Error loading holes:', error);
      toast({
        title: "Error",
        description: "Failed to load course holes",
        variant: "destructive",
      });
    }
  };

  // Start a new round
  const startRound = async (courseId: string, weather?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('rounds')
        .insert({
          user_id: user.id,
          course_id: courseId,
          weather
        })
        .select(`
          *,
          course:courses(*)
        `)
        .single();

      if (error) throw error;
      
      setCurrentRound(data);
      setHoleScores([]);
      setShots([]);
      
      // Load holes for the course
      await loadHoles(courseId);
      
      toast({
        title: "Round Started!",
        description: `Started round at ${data.course?.name}`,
      });
      
      return data;
    } catch (error) {
      console.error('Error starting round:', error);
      toast({
        title: "Error",
        description: "Failed to start round",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Complete current round
  const completeRound = async () => {
    if (!currentRound) return;
    
    setLoading(true);
    try {
      const totalScore = holeScores.reduce((sum, score) => sum + score.strokes, 0);
      const totalPutts = holeScores.reduce((sum, score) => sum + score.putts, 0);
      const fairwaysHit = holeScores.filter(score => score.fairway_hit).length;
      const girs = holeScores.filter(score => score.green_in_regulation).length;

      const { error } = await supabase
        .from('rounds')
        .update({
          completed_at: new Date().toISOString(),
          total_score: totalScore,
          total_putts: totalPutts,
          fairways_hit: fairwaysHit,
          greens_in_regulation: girs
        })
        .eq('id', currentRound.id);

      if (error) throw error;
      
      setCurrentRound(prev => prev ? {
        ...prev,
        completed_at: new Date().toISOString(),
        total_score: totalScore,
        total_putts: totalPutts,
        fairways_hit: fairwaysHit,
        greens_in_regulation: girs
      } : null);
      
      toast({
        title: "Round Complete!",
        description: `Final Score: ${totalScore}`,
      });
    } catch (error) {
      console.error('Error completing round:', error);
      toast({
        title: "Error",
        description: "Failed to complete round",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Record hole score
  const recordHoleScore = async (holeNumber: number, strokes: number, putts: number = 0, fairwayHit = false, greenInRegulation = false, penalties = 0) => {
    if (!currentRound) return;
    
    try {
      const { data, error } = await supabase
        .from('hole_scores')
        .upsert({
          round_id: currentRound.id,
          hole_number: holeNumber,
          strokes,
          putts,
          fairway_hit: fairwayHit,
          green_in_regulation: greenInRegulation,
          penalties
        })
        .select()
        .single();

      if (error) throw error;
      
      setHoleScores(prev => {
        const existing = prev.findIndex(score => score.hole_number === holeNumber);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [...prev, data];
      });
      
      return data;
    } catch (error) {
      console.error('Error recording hole score:', error);
      toast({
        title: "Error",
        description: "Failed to record score",
        variant: "destructive",
      });
    }
  };

  // Record shot
  const recordShot = async (
    holeNumber: number,
    shotNumber: number,
    latitude: number,
    longitude: number,
    shotType: Shot['shot_type'],
    club?: string,
    accuracy?: Shot['accuracy'],
    distanceYards?: number,
    photoUrl?: string,
    notes?: string
  ) => {
    if (!currentRound) return;
    
    try {
      const { data, error } = await supabase
        .from('shots')
        .insert({
          round_id: currentRound.id,
          hole_number: holeNumber,
          shot_number: shotNumber,
          latitude,
          longitude,
          shot_type: shotType,
          club,
          accuracy,
          distance_yards: distanceYards,
          photo_url: photoUrl,
          notes
        })
        .select()
        .single();

      if (error) throw error;
      
      setShots(prev => [...prev, data as Shot]);
      return data;
    } catch (error) {
      console.error('Error recording shot:', error);
      toast({
        title: "Error",
        description: "Failed to record shot",
        variant: "destructive",
      });
    }
  };

  // Load current round data
  const loadCurrentRound = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the most recent incomplete round
      const { data: roundData, error: roundError } = await supabase
        .from('rounds')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (roundError) throw roundError;
      
      if (roundData) {
        setCurrentRound(roundData);
        
        // Load hole scores
        const { data: scoresData, error: scoresError } = await supabase
          .from('hole_scores')
          .select('*')
          .eq('round_id', roundData.id)
          .order('hole_number');
        
        if (scoresError) throw scoresError;
        setHoleScores(scoresData || []);
        
        // Load shots
        const { data: shotsData, error: shotsError } = await supabase
          .from('shots')
          .select('*')
          .eq('round_id', roundData.id)
          .order('hole_number', { ascending: true })
          .order('shot_number', { ascending: true });
        
        if (shotsError) throw shotsError;
        setShots((shotsData || []) as Shot[]);
        
        // Load holes for the course
        if (roundData.course_id) {
          await loadHoles(roundData.course_id);
        }
      }
    } catch (error) {
      console.error('Error loading current round:', error);
    }
  };

  useEffect(() => {
    loadCourses();
    loadCurrentRound();
  }, []);

  return {
    currentRound,
    courses,
    holes,
    holeScores,
    shots,
    loading,
    startRound,
    completeRound,
    recordHoleScore,
    recordShot,
    loadCourses,
    loadHoles
  };
};