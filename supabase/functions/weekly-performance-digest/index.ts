import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeeklyDigestRequest {
  user_id: string;
  week_start: string;
  week_end: string;
}

interface MatchRecord {
  id: string;
  date: string;
  opponent_name: string;
  is_win: boolean;
  score: string;
  court_type: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, week_start, week_end }: WeeklyDigestRequest = await req.json();

    // Build Supabase query to fetch matches for the user within the date range
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const matchesResponse = await fetch(
      `${supabaseUrl}/rest/v1/matches?user_id=eq.${user_id}&date=gte.${week_start}&date=lte.${week_end}&order=date.desc`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
      }
    );

    if (!matchesResponse.ok) {
      throw new Error('Failed to fetch matches');
    }

    const matches: MatchRecord[] = await matchesResponse.json();

    // Build summary
    const totalMatches = matches.length;
    const wins = matches.filter(m => m.is_win).length;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    // Group by surface
    const surfaceStats: Record<string, { wins: number; total: number }> = {};
    matches.forEach(m => {
      const surface = m.court_type || 'Unknown';
      if (!surfaceStats[surface]) surfaceStats[surface] = { wins: 0, total: 0 };
      surfaceStats[surface].total++;
      if (m.is_win) surfaceStats[surface].wins++;
    });

    // Build prompt for DeepSeek
    const prompt = `You are a tennis performance analyst. Analyze this athlete's week:

Week: ${week_start} to ${week_end}
Total matches: ${totalMatches}
Wins: ${wins}
Win rate: ${winRate}%

Surface breakdown:
${Object.entries(surfaceStats).map(([s, stats]) => `${s}: ${stats.wins}/${stats.total} wins (${Math.round((stats.wins / stats.total) * 100)}%)`).join('\n')}

Recent matches:
${matches.slice(0, 5).map(m => `${m.date} vs ${m.opponent_name}: ${m.is_win ? 'WIN' : 'LOSS'} (${m.score}) - ${m.court_type}`).join('\n')}

Provide a concise weekly digest with:
1. A 1-2 sentence summary_text
2. A key_improvement observation
3. A concern to watch
4. next_focus recommendation for training

Respond in JSON format with keys: summary_text, key_improvement, concern, next_focus`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a tennis performance analyst. Provide concise, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      }),
    });

    const data = await response.json();
    let digest = {
      summary_text: `This week: ${wins} wins out of ${totalMatches} matches (${winRate}% win rate).`,
      key_improvement: 'Continue building momentum.',
      concern: winRate < 50 ? 'Focus on consistency in tight moments.' : 'None significant.',
      next_focus: 'Maintain current training intensity.',
    };

    if (data.choices && data.choices[0] && data.choices[0].message) {
      try {
        const content = data.choices[0].message.content;
        // Try to parse as JSON
        const parsed = JSON.parse(content);
        digest = { ...digest, ...parsed };
      } catch {
        // If not JSON, extract key points
        digest.summary_text = content.substring(0, 200);
      }
    }

    return new Response(JSON.stringify(digest), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in weekly-performance-digest function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});