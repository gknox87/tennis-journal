// Send Reminder Edge Function
// Cron-triggered edge function that sends journaling reminders at set times
// Runs every 15 minutes via Supabase cron

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserReminder {
  user_id: string;
  reminder_time: string;
  reminder_days: string[];
  journaling_preferences: Record<string, unknown>;
}

interface CronEvent {
  schedule?: string;
  controlled_at?: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time in UTC
    const now = new Date();
    const currentTime = now.toISOString().split("T")[1].slice(0, 5); // HH:mm format
    const currentDay = now.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0, 3);

    // Find users whose reminder time falls within a 15-minute window
    const { data: usersToRemind, error: queryError } = await supabase
      .from("profiles")
      .select("id, journaling_preferences")
      .not("journaling_preferences", "is", null);

    if (queryError) {
      console.error("Error querying profiles:", queryError);
      throw queryError;
    }

    const reminderMessages: { userId: string; message: string }[] = [];

    for (const profile of usersToRemind || []) {
      const prefs = profile.journaling_preferences as Record<string, unknown> | null;
      if (!prefs) continue;

      const reminderEnabled = prefs.reminder_enabled === true;
      if (!reminderEnabled) continue;

      const reminderTime = (prefs.reminder_time as string) || "20:00";
      const reminderDays = (prefs.reminder_days as string[]) || [];

      // Check if current time is within 7 minutes of the reminder time (15 min window / 2)
      const [targetHour, targetMinute] = reminderTime.split(":").map(Number);
      const [currentHour, currentMinute] = currentTime.split(":").map(Number);

      const timeDiff = Math.abs(
        (currentHour - targetHour) * 60 + (currentMinute - targetMinute)
      );

      if (timeDiff > 7) continue; // Outside the 15-minute window

      // Check if today is a reminder day
      const dayMatch = reminderDays.includes(currentDay);
      if (!dayMatch) continue;

      // Check if user has journaled today (avoid duplicate reminders)
      const { data: todayEntries } = await supabase
        .from("matches")
        .select("id")
        .eq("user_id", profile.id)
        .gte("date", now.toISOString().split("T")[0])
        .limit(1);

      const hasJournaledToday = todayEntries && todayEntries.length > 0;

      if (!hasJournaledToday) {
        reminderMessages.push({
          userId: profile.id,
          message: "Time to journal! 🎾 Log your match or training session.",
        });
      }
    }

    // Create notifications for users who need reminders
    const notificationInserts = reminderMessages.map((rm) => ({
      user_id: rm.userId,
      type: "reminder",
      title: "Time to Journal! 🎾",
      body: rm.message,
      link: "/dashboard",
      read: false,
    }));

    if (notificationInserts.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notificationInserts);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
      } else {
        console.log(`Sent ${notificationInserts.length} reminder notifications`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent: notificationInserts.length,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-reminder function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
