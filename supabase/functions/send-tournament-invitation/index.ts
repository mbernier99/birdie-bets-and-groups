import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Create a Supabase client with the service role key for secure database access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Legacy format (from frontend)
interface LegacyTournamentInvitationRequest {
  tournamentName: string;
  tournamentId: string;
  hostName: string;
  hostEmail: string;
  invitees: Array<{
    name: string;
    email?: string;
    userId?: string; // Allow userId instead of email for secure lookups
    handicapIndex: number;
  }>;
  tournamentDetails?: {
    gameType?: string;
    courseName?: string;
    maxPlayers?: number;
    entryFee?: number;
  };
}

// New format (from database trigger)
interface TournamentNotificationRequest {
  tournament: {
    id: string;
    name: string;
    description?: string;
    start_time?: string;
    entry_fee?: number;
    game_type?: string;
    course_name?: string;
    course_location?: string;
  };
  host: {
    name: string;
    email: string;
  };
  invitees: Array<{
    name: string;
    email: string;
  }>;
  notification_type?: 'invitation' | 'participant_added';
}

type TournamentInvitationRequest = LegacyTournamentInvitationRequest | TournamentNotificationRequest;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: TournamentInvitationRequest = await req.json();
    
    // Check if this is the new format (from database trigger) or legacy format (from frontend)
    const isNewFormat = 'tournament' in requestData;
    
    let tournamentName: string;
    let tournamentId: string;
    let hostName: string;
    let hostEmail: string;
    let invitees: Array<{ name: string; email: string; handicapIndex?: number }>;
    let tournamentDetails: any;
    let notificationType: string = 'invitation';

    if (isNewFormat) {
      const data = requestData as TournamentNotificationRequest;
      tournamentName = data.tournament.name;
      tournamentId = data.tournament.id;
      hostName = data.host.name;
      hostEmail = data.host.email;
      invitees = data.invitees;
      notificationType = data.notification_type || 'invitation';
      tournamentDetails = {
        gameType: data.tournament.game_type,
        courseName: data.tournament.course_name,
        courseLocation: data.tournament.course_location,
        entryFee: data.tournament.entry_fee,
        startTime: data.tournament.start_time,
        description: data.tournament.description
      };
    } else {
      const data = requestData as LegacyTournamentInvitationRequest;
      tournamentName = data.tournamentName;
      tournamentId = data.tournamentId;
      hostName = data.hostName;
      hostEmail = data.hostEmail;
      invitees = data.invitees;
      tournamentDetails = data.tournamentDetails;
    }

    // Validate required fields
    if (!tournamentName || !tournamentId || !hostName || !invitees?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const results = [];

    // Send individual emails to each player
    for (const invitee of invitees) {
      // If userId is provided, look up the email securely from the database
      let email = invitee.email;
      
      if (!email && invitee.userId) {
        try {
          const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('id', invitee.userId)
            .single();
          
          if (!error && profile) {
            email = profile.email;
          }
        } catch (lookupError) {
          console.error(`Failed to lookup email for userId ${invitee.userId}:`, lookupError);
        }
      }
      
      if (!email || !invitee.name) {
        console.warn(`Skipping invitee ${invitee.name} - no email available`);
        continue; // Skip invitees without email or name
      }

      try {
        const isParticipantAdded = notificationType === 'participant_added';
        const subject = isParticipantAdded 
          ? `You've been added to ${tournamentName}!`
          : `You're invited to ${tournamentName}!`;

        const emailResponse = await resend.emails.send({
          from: "Golf Tournament <onboarding@resend.dev>",
          to: [email],
          subject,
          html: isParticipantAdded 
            ? generateParticipantAddedEmail({
                tournamentName,
                tournamentId,
                hostName,
                hostEmail,
                playerName: invitee.name,
                tournamentDetails
              })
            : generateInvitationEmail({
                tournamentName,
                tournamentId,
                hostName,
                hostEmail,
                playerName: invitee.name,
                playerHandicap: invitee.handicapIndex || 0,
                tournamentDetails
              }),
        });

        results.push({
          email: email,
          name: invitee.name,
          success: true,
          messageId: emailResponse.data?.id,
          type: notificationType
        });

        console.log(`${isParticipantAdded ? 'Notification' : 'Invitation'} sent to ${email}:`, emailResponse);
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        results.push({
          email: email,
          name: invitee.name,
          success: false,
          error: error.message,
          type: notificationType
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      notificationType
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-tournament-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateInvitationEmail({
  tournamentName,
  tournamentId,
  hostName,
  hostEmail,
  playerName,
  playerHandicap,
  tournamentDetails
}: {
  tournamentName: string;
  tournamentId: string;
  hostName: string;
  hostEmail: string;
  playerName: string;
  playerHandicap: number;
  tournamentDetails?: any;
}): string {
  const gameType = tournamentDetails?.gameType || 'Tournament';
  const courseName = tournamentDetails?.courseName || 'TBD';
  const maxPlayers = tournamentDetails?.maxPlayers || 'TBD';
  const entryFee = tournamentDetails?.entryFee || 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tournament Invitation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px; }
        .invitation-box { background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .tournament-details { background-color: #f8fafc; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #64748b; }
        .detail-value { color: #1e293b; }
        .btn { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
        .btn-secondary { background-color: #6b7280; }
        .btn:hover { background-color: #047857; }
        .footer { text-align: center; padding: 20px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .golf-icon { font-size: 30px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="golf-icon">🏌️‍♂️</div>
          <h1>Golf Tournament Invitation</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${playerName}!</h2>
          
          <div class="invitation-box">
            <p><strong>${hostName}</strong> has invited you to join:</p>
            <h3 style="margin: 10px 0; color: #059669;">${tournamentName}</h3>
            <p>You've been registered with a handicap of <strong>${playerHandicap}</strong>.</p>
          </div>

          <div class="tournament-details">
            <h4 style="margin-top: 0; color: #1e293b;">Tournament Details</h4>
            <div class="detail-row">
              <span class="detail-label">Game Type:</span>
              <span class="detail-value">${gameType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Course:</span>
              <span class="detail-value">${courseName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Max Players:</span>
              <span class="detail-value">${maxPlayers}</span>
            </div>
            ${entryFee > 0 ? `
            <div class="detail-row">
              <span class="detail-label">Entry Fee:</span>
              <span class="detail-value">$${entryFee}</span>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app.com'}/tournament/${tournamentId}" class="btn">
              View Tournament Details
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            <strong>Next Steps:</strong><br>
            1. Click the link above to view full tournament details<br>
            2. Confirm your participation in the app<br>
            3. Get ready for a great round of golf!
          </p>
        </div>

        <div class="footer">
          <p>Sent via Golf Tournament App</p>
          <p style="font-size: 12px;">
            If you didn't expect this invitation or want to opt out of future tournament emails, 
            please contact ${hostEmail}.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateParticipantAddedEmail({
  tournamentName,
  tournamentId,
  hostName,
  hostEmail,
  playerName,
  tournamentDetails
}: {
  tournamentName: string;
  tournamentId: string;
  hostName: string;
  hostEmail: string;
  playerName: string;
  tournamentDetails?: any;
}): string {
  const gameType = tournamentDetails?.gameType || 'Tournament';
  const courseName = tournamentDetails?.courseName || 'TBD';
  const courseLocation = tournamentDetails?.courseLocation;
  const entryFee = tournamentDetails?.entryFee || 0;
  const startTime = tournamentDetails?.startTime;
  const description = tournamentDetails?.description;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Added to Tournament</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .content { padding: 30px; }
        .notification-box { background-color: #eff6ff; border: 2px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .tournament-details { background-color: #f8fafc; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #64748b; }
        .detail-value { color: #1e293b; }
        .btn { display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
        .btn-secondary { background-color: #6b7280; }
        .btn:hover { background-color: #1d4ed8; }
        .footer { text-align: center; padding: 20px; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .golf-icon { font-size: 30px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="golf-icon">⛳</div>
          <h1>You've Been Added to a Tournament!</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${playerName}!</h2>
          
          <div class="notification-box">
            <p><strong>${hostName}</strong> has added you to:</p>
            <h3 style="margin: 10px 0; color: #1e40af;">${tournamentName}</h3>
            <p>You're now officially part of this tournament!</p>
          </div>

          ${description ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid #1e40af;">
            <p style="margin: 0; font-style: italic; color: #4b5563;">"${description}"</p>
          </div>
          ` : ''}

          <div class="tournament-details">
            <h4 style="margin-top: 0; color: #1e293b;">Tournament Details</h4>
            <div class="detail-row">
              <span class="detail-label">Game Type:</span>
              <span class="detail-value">${gameType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Course:</span>
              <span class="detail-value">${courseName}${courseLocation ? ` - ${courseLocation}` : ''}</span>
            </div>
            ${startTime ? `
            <div class="detail-row">
              <span class="detail-label">Start Time:</span>
              <span class="detail-value">${new Date(startTime).toLocaleString()}</span>
            </div>
            ` : ''}
            ${entryFee > 0 ? `
            <div class="detail-row">
              <span class="detail-label">Entry Fee:</span>
              <span class="detail-value">$${entryFee}</span>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL') || 'https://your-app.com'}/tournament/${tournamentId}" class="btn">
              View Tournament Details
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            <strong>What's Next:</strong><br>
            1. Click the link above to view full tournament details<br>
            2. Review the tournament rules and format<br>
            3. Prepare for your round and good luck!
          </p>
        </div>

        <div class="footer">
          <p>Sent via Golf Tournament App</p>
          <p style="font-size: 12px;">
            If you have questions about this tournament or want to opt out of future notifications, 
            please contact ${hostEmail}.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);