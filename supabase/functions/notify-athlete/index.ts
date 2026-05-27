import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface NotifyAthleteBody {
  player_id?: string;
  match_id?: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  audio_data?: string;
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const body: NotifyAthleteBody = await req.json();
    const { player_id, match_id, type, title, body: noteBody, link } = body;

    // Get athlete info
    let athleteId = player_id;

    if (match_id) {
      // Fetch match to get user_id
      const { data: match } = await supabase
        .from("matches")
        .select("user_id")
        .eq("id", match_id)
        .single();

      if (match) {
        athleteId = match.user_id;
      }
    }

    if (!athleteId) {
      return new Response(JSON.stringify({ error: "No athlete specified" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get athlete profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", athleteId)
      .single();

    const athleteName = profile?.full_name || "Athlete";
    const athleteEmail = profile?.email || "";

    // Create notification record
    const { data: notification, error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id: athleteId,
        type,
        title,
        body: noteBody || null,
        link: link || null,
        read: false,
      })
      .select()
      .single();

    if (notifError) {
      console.error("Notification insert error:", notifError);
    }

    // Send email if Resend is configured and we have email
    if (RESEND_API_KEY && athleteEmail) {
      try {
        const resend = new Resend(RESEND_API_KEY);
        await resend.emails.queue({
          from: "SportsJournal <coach@sportsjournal.app>",
          to: athleteEmail,
          subject: `[SportsJournal] ${title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">${title}</h2>
              <p style="color: #374151;">${noteBody || "You have a new notification from your coach."}</p>
              ${link ? `<p><a href="${link}" style="color: #7c3aed;">View in SportsJournal</a></p>` : ""}
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 12px;">
                This notification was sent by your coach via SportsJournal Coach-Athlete Sharing.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Don't fail the whole request if email fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      notification,
      email: athleteEmail ? "queued" : "no_email" 
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("notify-athlete error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
