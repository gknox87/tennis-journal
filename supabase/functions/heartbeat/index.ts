// Supabase Heartbeat Function — keeps free-tier project alive
// Free-tier projects pause after 7 days of inactivity.
// Call this URL weekly via any free cron service (e.g. cron-job.org).
//
// PUBLIC URL (after deploy):
// https://pnlocibettgyqyttegcu.supabase.co/functions/v1/heartbeat

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.16";

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing Supabase credentials" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Upsert heartbeat row — lightweight DB write that counts as "activity"
    const { error } = await supabase
      .from("_heartbeat")
      .upsert(
        { id: 1, last_beat: new Date().toISOString() },
        { onConflict: "id" }
      );

    if (error && error.code === "42P01") {
      // Table missing — create it and retry
      await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS _heartbeat (
            id integer PRIMARY KEY,
            last_beat timestamptz NOT NULL DEFAULT now()
          );
          ALTER TABLE _heartbeat ENABLE ROW LEVEL SECURITY;
        `,
      });

      await supabase
        .from("_heartbeat")
        .upsert(
          { id: 1, last_beat: new Date().toISOString() },
          { onConflict: "id" }
        );
    } else if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        beat_at: new Date().toISOString(),
        next_beat_due: "7 days",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
