// Send Reminder Edge Function
// Cron-triggered edge function that sends journaling and wellness reminders at set times
// Runs every 15 minutes via Supabase cron
//
// NOTE: Reminder times are compared in UTC. Users in other timezones may receive
// reminders at unexpected local hours until profiles.timezone is implemented.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JournalingPreferences {
  reminder_enabled?: boolean;
  reminder_time?: string;
  reminder_days?: string[];
  wellness_reminder_enabled?: boolean;
  wellness_reminder_time?: string;
  wellness_reminder_days?: string[];
  pre_match_reminder?: boolean;
}

function isWithinReminderWindow(reminderTime: string, currentHour: number, currentMinute: number): boolean {
  const [targetHour, targetMinute] = reminderTime.split(":").map(Number);
  const timeDiff = Math.abs(
    (currentHour - targetHour) * 60 + (currentMinute - targetMinute)
  );
  return timeDiff <= 7;
}

function matchesReminderDay(reminderDays: string[], currentDay: string): boolean {
  return reminderDays.includes(currentDay);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toISOString().split("T")[1].slice(0, 5);
    const currentDay = now.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase().slice(0, 3);
    const [currentHour, currentMinute] = currentTime.split(":").map(Number);

    const { data: profiles, error: queryError } = await supabase
      .from("profiles")
      .select("id, journaling_preferences")
      .not("journaling_preferences", "is", null);

    if (queryError) {
      console.error("Error querying profiles:", queryError);
      throw queryError;
    }

    const journalReminders: { userId: string }[] = [];
    const wellnessReminders: { userId: string }[] = [];
    const preMatchReminders: { userId: string; eventId: string; eventTitle: string }[] = [];

    for (const profile of profiles || []) {
      const prefs = profile.journaling_preferences as JournalingPreferences | null;
      if (!prefs) continue;

      // Journaling reminders
      if (prefs.reminder_enabled === true) {
        const reminderTime = prefs.reminder_time || "20:00";
        const reminderDays = prefs.reminder_days || [];

        if (
          isWithinReminderWindow(reminderTime, currentHour, currentMinute) &&
          matchesReminderDay(reminderDays, currentDay)
        ) {
          const { data: todayEntries } = await supabase
            .from("matches")
            .select("id")
            .eq("user_id", profile.id)
            .gte("date", today)
            .limit(1);

          if (!todayEntries || todayEntries.length === 0) {
            journalReminders.push({ userId: profile.id });
          }
        }
      }

      // Wellness check-in reminders
      if (prefs.wellness_reminder_enabled !== false) {
        const wellnessTime = prefs.wellness_reminder_time || "08:00";
        const wellnessDays = prefs.wellness_reminder_days || ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

        if (
          isWithinReminderWindow(wellnessTime, currentHour, currentMinute) &&
          matchesReminderDay(wellnessDays, currentDay)
        ) {
          const { data: wellnessToday } = await supabase
            .from("wellness_entries")
            .select("id")
            .eq("user_id", profile.id)
            .eq("entry_date", today)
            .limit(1);

          if (!wellnessToday || wellnessToday.length === 0) {
            const { data: existingReminder } = await supabase
              .from("notifications")
              .select("id")
              .eq("user_id", profile.id)
              .eq("type", "wellness_reminder")
              .gte("created_at", `${today}T00:00:00`)
              .limit(1);

            if (!existingReminder || existingReminder.length === 0) {
              wellnessReminders.push({ userId: profile.id });
            }
          }
        }
      }

      // Pre-match reminders for upcoming calendar match events (within 3 hours, no pre_match_state)
      if (prefs.pre_match_reminder !== false) {
        const windowStart = now.toISOString();
        const windowEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();

        const { data: upcomingMatches } = await supabase
          .from("scheduled_events")
          .select("id, title, pre_match_state")
          .eq("user_id", profile.id)
          .eq("session_type", "match")
          .gte("start_time", windowStart)
          .lte("start_time", windowEnd);

        for (const event of upcomingMatches || []) {
          const hasPreMatch =
            event.pre_match_state &&
            typeof event.pre_match_state === "object" &&
            Object.keys(event.pre_match_state as Record<string, unknown>).length > 0;

          if (hasPreMatch) continue;

          const { data: existingReminder } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", profile.id)
            .eq("type", "pre_match_reminder")
            .gte("created_at", `${today}T00:00:00`)
            .ilike("body", `%${event.id}%`)
            .limit(1);

          if (!existingReminder || existingReminder.length === 0) {
            preMatchReminders.push({
              userId: profile.id,
              eventId: event.id,
              eventTitle: event.title,
            });
          }
        }
      }
    }

    const notificationInserts = [
      ...journalReminders.map((rm) => ({
        user_id: rm.userId,
        type: "reminder",
        title: "Time to Journal! 🎾",
        body: "Time to journal! Log your match or training session.",
        link: "/dashboard",
        read: false,
      })),
      ...wellnessReminders.map((rm) => ({
        user_id: rm.userId,
        type: "wellness_reminder",
        title: "Daily wellness check-in",
        body: "How are you feeling today? Log sleep, stress, mood, and readiness.",
        link: "/wellness?from=reminder",
        read: false,
      })),
      ...preMatchReminders.map((rm) => ({
        user_id: rm.userId,
        type: "pre_match_reminder",
        title: "Pre-match check-in",
        body: `Log your mental state before "${rm.eventTitle}" (event:${rm.eventId}).`,
        link: "/planner",
        read: false,
      })),
    ];

    if (notificationInserts.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notificationInserts);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
      } else {
        console.log(
          `Sent ${journalReminders.length} journal, ${wellnessReminders.length} wellness, and ${preMatchReminders.length} pre-match reminder notifications`
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        journalRemindersSent: journalReminders.length,
        wellnessRemindersSent: wellnessReminders.length,
        preMatchRemindersSent: preMatchReminders.length,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-reminder function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
