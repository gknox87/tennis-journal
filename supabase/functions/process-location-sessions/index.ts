// Process Location Sessions Edge Function
// Detects when users visit tennis/padel courts and prompts them to log their play

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Known tennis/padel club coordinates (simplified for demo - would be expanded with real data)
const KNOWN_COURT_LOCATIONS = [
  // Example: format is { name, lat, lng, radius_km }
  // This would be a database table in production
  { name: "Tennis Club Center", lat: 40.7128, lng: -74.006, radius: 0.5 },
  { name: "Padel Courts", lat: 40.7589, lng: -73.9851, radius: 0.3 },
];

function isWithinRadius(lat1: number, lng1: number, lat2: number, lng2: number, radiusKm: number): boolean {
  // Haversine formula approximation
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance <= radiusKm;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all unprocessed location sessions from the last 3 hours
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    const { data: sessions, error: queryError } = await supabase
      .from("user_location_sessions")
      .select("*")
      .eq("processed", false)
      .gte("timestamp", threeHoursAgo);

    if (queryError) {
      console.error("Error querying location sessions:", queryError);
      throw queryError;
    }

    // Group sessions by user
    const userSessions = new Map<string, typeof sessions>();
    for (const session of sessions || []) {
      if (!userSessions.has(session.user_id)) {
        userSessions.set(session.user_id, []);
      }
      userSessions.get(session.user_id)!.push(session);
    }

    const notifications: { user_id: string; type: string; title: string; body: string; link: string }[] = [];

    for (const [userId, userLocationSessions] of userSessions) {
      // Check if user has location tracking enabled
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, journaling_preferences")
        .eq("id", userId)
        .maybeSingle();

      const prefs = profile?.journaling_preferences as Record<string, unknown> | null;
      if (!prefs?.location_tracking_enabled) continue;

      // Check each session for proximity to known courts
      for (const session of userLocationSessions) {
        for (const court of KNOWN_COURT_LOCATIONS) {
          const isNearCourt = isWithinRadius(
            session.latitude,
            session.longitude,
            court.lat,
            court.lng,
            court.radius
          );

          if (isNearCourt) {
            // Check if user has already logged a match within 2 hours
            const twoHoursAgo = new Date(session.timestamp.getTime() - 2 * 60 * 60 * 1000).toISOString();
            const twoHoursLater = new Date(session.timestamp.getTime() + 2 * 60 * 60 * 1000).toISOString();

            const { data: existingMatches } = await supabase
              .from("matches")
              .select("id")
              .eq("user_id", userId)
              .gte("date", twoHoursAgo)
              .lte("date", twoHoursLater)
              .limit(1);

            if (!existingMatches || existingMatches.length === 0) {
              // Near a court but no match logged - create notification
              notifications.push({
                user_id: userId,
                type: "location_alert",
                title: "Did you play? 🎾",
                body: `We detected you might be at ${court.name}. Log your match to keep your stats up to date!`,
                link: "/add-match",
              });
            }
            break; // Only one notification per session
          }
        }
      }

      // Mark sessions as processed
      const sessionIds = userLocationSessions.map((s) => s.id);
      await supabase
        .from("user_location_sessions")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .in("id", sessionIds);
    }

    // Create notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
      } else {
        console.log(`Created ${notifications.length} location-based notifications`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionsProcessed: sessions?.length || 0,
        notificationsCreated: notifications.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in process-location-sessions:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
