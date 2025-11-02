import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestUser {
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  handicap: number;
}

const TEST_USERS: TestUser[] = [
  { email: 'leecrocker@gmail.com', firstName: 'Lee', lastName: 'Crocker', nickname: 'SussPro', handicap: 18 },
  { email: 'erwhalen@yahoo.com', firstName: 'Erin', lastName: 'Whalen', nickname: 'WhaleBone', handicap: 15 },
  { email: 'drew.tornga@gmail.com', firstName: 'Drew', lastName: 'Tornga', nickname: 'Tornganese', handicap: 22 },
  { email: 'saldivarhector@hotmail.com', firstName: 'Hector', lastName: 'Saldivar', nickname: 'El Presidente', handicap: 13 },
  { email: 'mbernier@gmail.com', firstName: 'Matt', lastName: 'Bernier', nickname: 'Berniator', handicap: 12 },
  { email: 'scogo82@hotmail.com', firstName: 'Scott', lastName: 'Gannon', nickname: 'JamBand', handicap: 17 },
  { email: 'tom.connaghan@bandongolf.temp', firstName: 'Tom', lastName: 'Connaghan', nickname: 'ConMan', handicap: 14 },
  { email: 'matt.traiman@gmail.com', firstName: 'Matt', lastName: 'Traimain', nickname: 'TraiDog', handicap: 18 },
];

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results = {
      created: [] as string[],
      reset: [] as string[],
      errors: [] as { email: string; error: string }[],
    };

    // Create each test user or reset password if exists
    for (const user of TEST_USERS) {
      try {
        // Check if user already exists by querying profiles table
        const { data: profileData, error: profileQueryError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (profileQueryError) {
          console.error(`Error querying profile for ${user.email}:`, profileQueryError);
          results.errors.push({ email: user.email, error: profileQueryError.message });
          continue;
        }

        if (profileData) {
          // User exists - reset password
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            profileData.id,
            {
              password: 'Bandontest2025!',
              email_confirm: true,
              user_metadata: {
                first_name: user.firstName,
                last_name: user.lastName,
              },
            }
          );

          if (updateError) {
            results.errors.push({ email: user.email, error: updateError.message });
            console.error(`Error resetting password for ${user.email}:`, updateError);
            continue;
          }

          // Update the profile with additional data
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
              nickname: user.nickname,
              handicap: user.handicap,
            })
            .eq('id', profileData.id);

          if (profileError) {
            console.error(`Error updating profile for ${user.email}:`, profileError);
          }

          results.reset.push(user.email);
          console.log(`User ${user.email} password reset successfully to Bandontest2025!`);
          continue;
        }

        // Create the user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: 'Bandontest2025!',
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
          },
        });

        if (authError) {
          results.errors.push({ email: user.email, error: authError.message });
          console.error(`Error creating user ${user.email}:`, authError);
          continue;
        }

        if (authData.user) {
          // Update the profile with additional data
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
              nickname: user.nickname,
              handicap: user.handicap,
            })
            .eq('id', authData.user.id);

          if (profileError) {
            console.error(`Error updating profile for ${user.email}:`, profileError);
          }

          results.created.push(user.email);
          console.log(`Successfully created user: ${user.email}`);
        }
      } catch (error: any) {
        results.errors.push({ email: user.email, error: error.message });
        console.error(`Error processing user ${user.email}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${results.created.length} users, reset ${results.reset.length} passwords, ${results.errors.length} errors`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
