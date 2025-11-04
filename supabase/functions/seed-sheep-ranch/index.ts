import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HoleData {
  hole_number: number;
  par: number;
  yardage: number;
  handicap: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Check if Sheep Ranch already exists
    const { data: existingCourse } = await supabaseClient
      .from('courses')
      .select('id')
      .eq('name', 'Sheep Ranch')
      .single();

    if (existingCourse) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Sheep Ranch course already exists',
          courseId: existingCourse.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert course
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .insert({
        name: 'Sheep Ranch',
        location: 'Bandon, Oregon',
        par: 72,
        holes: 18,
        rating: 70.0,
        slope: 116,
        latitude: 43.1193,
        longitude: -124.4148,
      })
      .select()
      .single();

    if (courseError) throw courseError;

    // Insert tees
    const { data: greenTee, error: greenTeeError } = await supabaseClient
      .from('course_tees')
      .insert({
        course_id: course.id,
        tee_name: 'Green',
        tee_color: '#22c55e',
        rating: 70.0,
        slope: 116,
        total_yardage: 6245,
      })
      .select()
      .single();

    if (greenTeeError) throw greenTeeError;

    const { data: goldTee, error: goldTeeError } = await supabaseClient
      .from('course_tees')
      .insert({
        course_id: course.id,
        tee_name: 'Gold',
        tee_color: '#eab308',
        rating: 67.9,
        slope: 109,
        total_yardage: 5810,
      })
      .select()
      .single();

    if (goldTeeError) throw goldTeeError;

    // Hole data
    const pars = [5, 4, 3, 4, 3, 4, 3, 4, 4, 4, 5, 4, 5, 4, 4, 3, 4, 5];
    const handicaps = [5, 13, 17, 3, 11, 1, 15, 7, 9, 6, 4, 2, 10, 8, 14, 16, 12, 18];
    const greenYardages = [517, 303, 113, 443, 166, 431, 138, 407, 386, 375, 506, 414, 485, 377, 303, 131, 314, 436];
    const goldYardages = [491, 282, 101, 415, 139, 401, 110, 382, 361, 356, 463, 390, 464, 354, 279, 120, 297, 405];

    // Create holes for Green tees
    const greenHoles: any[] = [];
    for (let i = 0; i < 18; i++) {
      greenHoles.push({
        course_id: course.id,
        tee_id: greenTee.id,
        hole_number: i + 1,
        par: pars[i],
        yardage: greenYardages[i],
        handicap: handicaps[i],
      });
    }

    // Create holes for Gold tees
    const goldHoles: any[] = [];
    for (let i = 0; i < 18; i++) {
      goldHoles.push({
        course_id: course.id,
        tee_id: goldTee.id,
        hole_number: i + 1,
        par: pars[i],
        yardage: goldYardages[i],
        handicap: handicaps[i],
      });
    }

    // Insert all holes
    const { error: holesError } = await supabaseClient
      .from('holes')
      .insert([...greenHoles, ...goldHoles]);

    if (holesError) throw holesError;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sheep Ranch course data inserted successfully',
        courseId: course.id,
        tees: {
          green: greenTee.id,
          gold: goldTee.id,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error seeding Sheep Ranch:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
