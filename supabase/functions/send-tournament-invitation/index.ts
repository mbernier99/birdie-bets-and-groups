import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TournamentInvitationRequest {
  tournamentName: string;
  tournamentId: string;
  hostName: string;
  hostEmail: string;
  invitees: Array<{
    name: string;
    email: string;
    handicapIndex: number;
  }>;
  tournamentDetails?: {
    gameType?: string;
    courseName?: string;
    maxPlayers?: number;
    entryFee?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      tournamentName, 
      tournamentId, 
      hostName, 
      hostEmail, 
      invitees, 
      tournamentDetails 
    }: TournamentInvitationRequest = await req.json();

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

    // Send individual invitations to each player
    for (const invitee of invitees) {
      if (!invitee.email || !invitee.name) {
        continue; // Skip invitees without email or name
      }

      try {
        const emailResponse = await resend.emails.send({
          from: "Golf Tournament <onboarding@resend.dev>",
          to: [invitee.email],
          subject: `You're invited to ${tournamentName}!`,
          html: generateInvitationEmail({
            tournamentName,
            tournamentId,
            hostName,
            playerName: invitee.name,
            playerHandicap: invitee.handicapIndex,
            tournamentDetails
          }),
        });

        results.push({
          email: invitee.email,
          name: invitee.name,
          success: true,
          messageId: emailResponse.data?.id
        });

        console.log(`Invitation sent to ${invitee.email}:`, emailResponse);
      } catch (error) {
        console.error(`Error sending invitation to ${invitee.email}:`, error);
        results.push({
          email: invitee.email,
          name: invitee.name,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
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
  playerName,
  playerHandicap,
  tournamentDetails
}: {
  tournamentName: string;
  tournamentId: string;
  hostName: string;
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

serve(handler);