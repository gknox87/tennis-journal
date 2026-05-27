// Weekly Summary Notification Edge Function
// Runs Monday at 9am to send performance summaries

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklyStats {
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  currentStreak: number;
  trainingSessions: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date range for last week (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const lastMonday = new Date(now);
    lastMonday.setDate(now.getDate() - daysSinceMonday - 7);
    lastMonday.setHours(0, 0, 0, 0);
    
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);

    // Find users with weekly_summary_enabled
    const { data: profiles, error: queryError } = await supabase
      .from("profiles")
      .select("id, journaling_preferences")
      .not("journaling_preferences", "is", null);

    if (queryError) {
      console.error("Error querying profiles:", queryError);
      throw queryError;
    }

    const notifications: { user_id: string; type: string; title: string; body: string; link: string }[] = [];

    for (const profile of profiles || []) {
      const prefs = profile.journaling_preferences as Record<string, unknown> | null;
      if (!prefs?.weekly_summary_enabled) continue;

      // Calculate stats for this user
      const { data: matches } = await supabase
        .from("matches")
        .select("id, won")
        .eq("user_id", profile.id)
        .gte("date", lastMonday.toISOString())
        .lte("date", lastSunday.toISOString());

      const { data: trainingNotes } = await supabase
        .from("training_notes")
        .select("id")
        .eq("user_id", profile.id)
        .gte("training_date", lastMonday.toISOString())
        .lte("training_date", lastSunday.toISOString());

      const matchesPlayed = matches?.length || 0;
      const matchesWon = matches?.filter((m) => m.won).length || 0;
      const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;
      const trainingSessions = trainingNotes?.length || 0;

      // Get current streak
      const { data: allMatches } = await supabase
        .from("matches")
        .select("date")
        .eq("user_id", profile.id)
        .order("date", { ascending: false });

      let currentStreak = 0;
      if (allMatches && allMatches.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let checkDate = new Date(today);
        const matchDates = new Set(
          allMatches.map((m) => {
            const d = new Date(m.date);
            d.setHours(0, 0, 0, 0);
            return d.toISOString().split("T")[0];
          })
        );

        // Count consecutive days
        while (true) {
          const dateStr = checkDate.toISOString().split("T")[0];
          if (matchDates.has(dateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Build notification body
      let body = `📊 Your week at a glance:\n\n`;
      
      if (matchesPlayed > 0) {
        body += `🎾 ${matchesPlayed} match${matchesPlayed !== 1 ? "s" : ""} played (${matchesWon} wins, ${winRate}% win rate)\n`;
      } else {
        body += `🎾 No matches logged this week\n`;
      }
      
      if (trainingSessions > 0) {
        body += `🏋️ ${trainingSessions} training session${trainingSessions !== 1 ? "s" : ""}\n`;
      }
      
      body += `🔥 Current streak: ${currentStreak} day${currentStreak !== 1 ? "s" : ""}`;

      if (matchesPlayed === 0 && currentStreak > 0) {
        body += `\n\n💡 Tip: Log a match this week to keep your momentum going!`;
      } else if (matchesPlayed === 0) {
        body += `\n\n💡 Time to get on the court!`;
      }

      notifications.push({
        user_id: profile.id,
        type: "weekly_summary",
        title: "📈 Your Weekly Sports Journal Summary",
        body,
        link: "/performance-dashboard",
      });
    }

    // Create all notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting weekly summaries:", insertError);
      } else {
        console.log(`Sent ${notifications.length} weekly summary notifications`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summariesSent: notifications.length,
        weekStart: lastMonday.toISOString(),
        weekEnd: lastSunday.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in weekly-summary-notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
