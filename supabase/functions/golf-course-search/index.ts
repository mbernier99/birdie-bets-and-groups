import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CourseSearchParams {
  name?: string;
  city?: string;
  state?: string;
  limit?: number;
}

interface CourseImportData {
  name: string;
  location?: string;
  holes: number;
  tees: Array<{
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
  }>;
}

async function searchGolfCourses(params: CourseSearchParams) {
  try {
    // Using the free GolfCourseAPI
    const apiKey = Deno.env.get('GOLF_COURSE_API_KEY');
    if (!apiKey) {
      throw new Error('Golf Course API key not configured');
    }

    const searchParams = new URLSearchParams();
    if (params.name) searchParams.append('name', params.name);
    if (params.city) searchParams.append('city', params.city);
    if (params.state) searchParams.append('state', params.state);
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(
      `https://api.golfcourseapi.com/v1/courses/search?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Golf course search results:', data);
    
    return data;
  } catch (error) {
    console.error('Error searching golf courses:', error);
    throw error;
  }
}

async function getCourseDetails(courseId: string) {
  try {
    const apiKey = Deno.env.get('GOLF_COURSE_API_KEY');
    if (!apiKey) {
      throw new Error('Golf Course API key not configured');
    }

    const response = await fetch(
      `https://api.golfcourseapi.com/v1/courses/${courseId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Course details:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
}

async function importCourseToDatabase(supabase: any, courseData: CourseImportData, userId?: string) {
  try {
    console.log('Importing course to database:', courseData.name);

    // First, create the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        name: courseData.name,
        location: courseData.location,
        holes: courseData.holes,
        par: courseData.tees[0]?.holes.reduce((sum, hole) => sum + hole.par, 0) || null,
      })
      .select()
      .single();

    if (courseError) {
      console.error('Error creating course:', courseError);
      throw courseError;
    }

    console.log('Course created:', course.id);

    // Create tees for the course
    const teePromises = courseData.tees.map(async (teeData) => {
      const { data: tee, error: teeError } = await supabase
        .from('course_tees')
        .insert({
          course_id: course.id,
          tee_name: teeData.name,
          tee_color: teeData.color,
          rating: teeData.rating,
          slope: teeData.slope,
          total_yardage: teeData.yardage,
        })
        .select()
        .single();

      if (teeError) {
        console.error('Error creating tee:', teeError);
        throw teeError;
      }

      // Create holes for this course (only once, not per tee)
      if (teeData === courseData.tees[0]) {
        const holePromises = teeData.holes.map(async (holeData) => {
          const { data: hole, error: holeError } = await supabase
            .from('holes')
            .insert({
              course_id: course.id,
              hole_number: holeData.number,
              par: holeData.par,
              handicap: holeData.handicap,
            })
            .select()
            .single();

          if (holeError) {
            console.error('Error creating hole:', holeError);
            throw holeError;
          }

          return hole;
        });

        const holes = await Promise.all(holePromises);
        
        // Create hole_tees entries for each tee
        const holeTeePromises = courseData.tees.map(async (allTeeData) => {
          const { data: currentTee } = await supabase
            .from('course_tees')
            .select('id')
            .eq('course_id', course.id)
            .eq('tee_name', allTeeData.name)
            .single();

          if (currentTee) {
            const holeTeesData = allTeeData.holes.map((holeData, index) => ({
              hole_id: holes[index].id,
              tee_id: currentTee.id,
              yardage: holeData.yardage,
            }));

            const { error: holeTeeError } = await supabase
              .from('hole_tees')
              .insert(holeTeesData);

            if (holeTeeError) {
              console.error('Error creating hole tees:', holeTeeError);
              throw holeTeeError;
            }
          }
        });

        await Promise.all(holeTeePromises);
      }

      return tee;
    });

    await Promise.all(teePromises);

    // Track the import
    if (userId) {
      await supabase
        .from('course_imports')
        .insert({
          course_id: course.id,
          import_source: 'api',
          imported_by: userId,
          metadata: { original_data: courseData },
        });
    }

    console.log('Course import completed successfully');
    return course;
  } catch (error) {
    console.error('Error importing course:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { searchParams, courseId, importData, action } = await req.json();
    
    let result;
    
    switch (action) {
      case 'search':
        result = await searchGolfCourses(searchParams);
        break;
        
      case 'details':
        if (!courseId) {
          throw new Error('Course ID required for details action');
        }
        result = await getCourseDetails(courseId);
        break;
        
      case 'import':
        if (!importData) {
          throw new Error('Course data required for import action');
        }
        
        // Get user from auth header if available
        const authHeader = req.headers.get('authorization');
        let userId = null;
        if (authHeader) {
          const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
          userId = user?.id;
        }
        
        result = await importCourseToDatabase(supabase, importData, userId);
        break;
        
      default:
        throw new Error('Invalid action. Must be search, details, or import');
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Golf course search error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred while processing your request' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});