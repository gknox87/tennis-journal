// Edge Function: Generate Athlete Report
// POST /functions/v1/generate-athlete-report
// Body: { user_id: string, date_start: string, date_end: string }
//
// Generates a performance report PDF for an athlete within a date range
// Uses browser print approach - returns HTML that can be printed to PDF

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportParams {
  user_id: string;
  date_start: string;
  date_end: string;
}

interface AthleteStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  bestSurface: string;
  surfaceStats: Record<string, { played: number; won: number }>;
  recentForm: boolean[];
  currentStreak: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { user_id, date_start, date_end }: ReportParams = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "user_id is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, club, ranking, preferred_surface")
      .eq("id", user_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, error: "User profile not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Fetch matches in date range
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("user_id", user_id)
      .gte("date", date_start || "2000-01-01")
      .lte("date", date_end || new Date().toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (matchesError) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch matches" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Calculate stats
    const stats: AthleteStats = {
      totalMatches: matches?.length || 0,
      wins: matches?.filter((m) => m.is_win).length || 0,
      losses: (matches?.length || 0) - (matches?.filter((m) => m.is_win).length || 0),
      winRate: 0,
      bestSurface: "N/A",
      surfaceStats: {},
      recentForm: [],
      currentStreak: 0,
    };

    if (stats.totalMatches > 0) {
      stats.winRate = Math.round((stats.wins / stats.totalMatches) * 100);
    }

    // Surface stats
    matches?.forEach((m) => {
      const surface = m.surface || "Unknown";
      if (!stats.surfaceStats[surface]) {
        stats.surfaceStats[surface] = { played: 0, won: 0 };
      }
      stats.surfaceStats[surface].played++;
      if (m.is_win) stats.surfaceStats[surface].won++;
    });

    // Best surface
    let bestSurfaceWinRate = 0;
    Object.entries(stats.surfaceStats).forEach(([surface, s]) => {
      if (s.played >= 2) {
        const rate = (s.won / s.played) * 100;
        if (rate > bestSurfaceWinRate) {
          bestSurfaceWinRate = rate;
          stats.bestSurface = surface;
        }
      }
    });

    // Recent form (last 10 matches)
    stats.recentForm = (matches || []).slice(0, 10).map((m) => m.is_win);

    // Current streak (consecutive wins or losses from most recent)
    if (matches && matches.length > 0) {
      const firstResult = matches[0].is_win;
      let streak = 0;
      for (const match of matches) {
        if (match.is_win === firstResult) {
          streak++;
        } else {
          break;
        }
      }
      stats.currentStreak = streak;
    }

    // Generate report HTML
    const reportHTML = generateReportHTML(profile, stats, matches || [], date_start, date_end);

    // Return HTML for printing (browser will handle PDF conversion)
    return new Response(reportHTML, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating athlete report:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function generateReportHTML(
  profile: Record<string, unknown>,
  stats: AthleteStats,
  matches: Record<string, unknown>[],
  dateStart?: string,
  dateEnd?: string
): string {
  const now = new Date();
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Athlete Performance Report - ${profile.full_name || "Athlete"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.5; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; color: #1d4ed8; }
    .header .subtitle { color: #6b7280; font-size: 14px; margin-top: 4px; }
    .meta { text-align: right; font-size: 13px; color: #6b7280; }
    .meta strong { color: #374151; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px 16px; border-radius: 12px; text-align: center; }
    .stat-card.wins { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .stat-card.losses { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .stat-card.rate { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
    .stat-card h2 { font-size: 36px; margin: 0; }
    .stat-card p { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
    
    h2 { font-size: 18px; color: #374151; margin: 30px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
    
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; color: #374151; }
    tr:nth-child(even) { background: #f9fafb; }
    .result-win { color: #059669; font-weight: 600; }
    .result-loss { color: #dc2626; font-weight: 600; }
    
    .surface-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 16px 0; }
    .surface-card { background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; }
    .surface-card h4 { font-size: 14px; color: #6b7280; margin-bottom: 8px; }
    .surface-card .win-rate { font-size: 24px; font-weight: bold; color: #1d4ed8; }
    .surface-card .record { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .surface-card.best .win-rate { color: #059669; }
    
    .form-section { display: flex; align-items: center; gap: 8px; margin: 16px 0; }
    .form-label { font-size: 13px; color: #6b7280; }
    .form-dots { display: flex; gap: 6px; }
    .form-dot { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-center; font-size: 12px; font-weight: 600; }
    .form-dot.win { background: #10b981; color: white; }
    .form-dot.loss { background: #ef4444; color: white; }
    
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 11px; }
    
    @media print {
      body { padding: 20px; }
      .stat-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>🏆 Athlete Performance Report</h1>
      <p class="subtitle">SportsJournal.app</p>
    </div>
    <div class="meta">
      <p><strong>${profile.full_name || "Athlete"}</strong></p>
      ${profile.club ? `<p>${profile.club}</p>` : ""}
      <p>Report Period: ${dateStart ? formatDate(dateStart) : "All time"} - ${dateEnd ? formatDate(dateEnd) : "Present"}</p>
      <p>Generated: ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <h2>${stats.totalMatches}</h2>
      <p>Matches Played</p>
    </div>
    <div class="stat-card wins">
      <h2>${stats.wins}</h2>
      <p>Wins</p>
    </div>
    <div class="stat-card losses">
      <h2>${stats.losses}</h2>
      <p>Losses</p>
    </div>
    <div class="stat-card rate">
      <h2>${stats.winRate}%</h2>
      <p>Win Rate</p>
    </div>
  </div>

  <h2>Performance by Surface</h2>
  <div class="surface-grid">
    ${Object.entries(stats.surfaceStats).map(([surface, data]) => {
      const rate = data.played > 0 ? Math.round((data.won / data.played) * 100) : 0;
      const isBest = surface === stats.bestSurface;
      return `
      <div class="surface-card${isBest ? " best" : ""}">
        <h4>${surface}</h4>
        <div class="win-rate">${rate}%</div>
        <div class="record">${data.won}W - ${data.played - data.won}L</div>
      </div>`;
    }).join("")}
  </div>

  <h2>Recent Form</h2>
  <div class="form-section">
    <span class="form-label">Last ${stats.recentForm.length} matches:</span>
    <div class="form-dots">
      ${stats.recentForm.map(f => `<div class="form-dot ${f ? "win" : "loss"}">${f ? "W" : "L"}</div>`).join("")}
    </div>
  </div>
  ${stats.currentStreak > 0 ? `<p style="font-size:13px;color:#6b7280;margin-top:8px;">Current streak: ${stats.currentStreak} ${stats.recentForm[0] ? "wins" : "losses"}</p>` : ""}

  <h2>Match Details</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Opponent</th>
        <th>Surface</th>
        <th>Score</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      ${matches.slice(0, 50).map(m => `
      <tr>
        <td>${m.date ? formatDate(m.date as string) : "N/A"}</td>
        <td>${m.opponent_name || "N/A"}</td>
        <td>${m.surface || "N/A"}</td>
        <td>${m.score || "N/A"}</td>
        <td class="${m.is_win ? "result-win" : "result-loss"}">${m.is_win ? "✅ Won" : "❌ Lost"}</td>
      </tr>`).join("")}
      ${matches.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:#6b7280;">No matches in this period</td></tr>' : ""}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by SportsJournal.app | sportsjournal.app</p>
  </div>
</body>
</html>`;
}