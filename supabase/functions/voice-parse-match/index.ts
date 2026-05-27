import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sport_id } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build sport-specific context
    const sportContext = (() => {
      switch (sport_id) {
        case 'table_tennis':
          return 'You are analyzing table tennis match voice input. Extract: opponent name, score (e.g., "3-1" or "11-8, 9-11, 11-5, 11-7"), win/loss, and court surface if mentioned. Be concise.';
        case 'padel':
          return 'You are analyzing padel match voice input. Extract: opponent/team name, score (games or sets), win/loss, and court type if mentioned. Be concise.';
        case 'pickleball':
          return 'You are analyzing pickleball match voice input. Extract: opponent/team name, score (games to 11), win/loss, and court type if mentioned. Be concise.';
        case 'badminton':
          return 'You are analyzing badminton match voice input. Extract: opponent name, score (games), win/loss, and court type if mentioned. Be concise.';
        case 'squash':
          return 'You are analyzing squash match voice input. Extract: opponent name, score (games), win/loss, and court type if mentioned. Be concise.';
        default:
          return 'You are a tennis coach analyzing match voice input. Extract: opponent name, score (sets like "6-4, 3-6, 7-5"), win/loss, and court surface if mentioned. Be concise.';
      }
    })();

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
            content: `${sportContext}\n\nOutput format (JSON only, no extra text):\n{\n  "opponent": "name or null if not mentioned",\n  "score": "score string or null if not clearly stated",\n  "is_win": true/false/null,\n  "court_type": "surface or null if not mentioned"\n}`
          },
          {
            role: 'user',
            content: `Parse this match: ${text}`
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      }),
    });

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Try to extract JSON from the response (handle potential markdown code blocks)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```|({[\s\S]*})/);
    if (jsonMatch) {
      content = jsonMatch[1] || jsonMatch[2];
    }
    
    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If parsing fails, return null values and let user enter manually
      parsed = {
        opponent: null,
        score: null,
        is_win: null,
        court_type: null
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in voice-parse-match function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      opponent: null,
      score: null,
      is_win: null,
      court_type: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});