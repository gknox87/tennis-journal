import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShareNotesRequest {
  recipientEmail: string;
  matchDetails: {
    opponent: string;
    date: string;
    score: string;
    notes: string;
    isWin: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, matchDetails }: ShareNotesRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Tennis Match Notes <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Match Notes: ${matchDetails.opponent} - ${matchDetails.date}`,
      html: `
        <h1>Match Notes</h1>
        <p><strong>Opponent:</strong> ${matchDetails.opponent}</p>
        <p><strong>Date:</strong> ${matchDetails.date}</p>
        <p><strong>Result:</strong> ${matchDetails.isWin ? 'Win' : 'Loss'}</p>
        <p><strong>Score:</strong> ${matchDetails.score}</p>
        <h2>Notes:</h2>
        <p>${matchDetails.notes}</p>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in share-match-notes function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);