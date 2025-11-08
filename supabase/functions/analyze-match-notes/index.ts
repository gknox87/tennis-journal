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
    const { notes, sport_id } = await req.json();

    const sportDescriptor = (() => {
      switch (sport_id) {
        case 'table_tennis':
          return 'You are a table tennis coach analyzing match notes. Reference serve variation, rally tempo, and spin control.';
        case 'padel':
          return 'You are a padel coach analyzing match notes. Focus on net play, lob defense, and partnership coordination.';
        case 'pickleball':
          return 'You are a pickleball coach analyzing match notes. Emphasize dink quality, third-shot strategy, and kitchen control.';
        case 'badminton':
          return 'You are a badminton coach analyzing match notes. Consider shot selection, footwork patterns, and rally momentum.';
        case 'squash':
          return 'You are a squash coach analyzing match notes. Highlight T-position control, length accuracy, and pressure building.';
        default:
          return 'You are a tennis coach analyzing match notes. Extract 1-3 specific, actionable improvement points. Be concise and specific.';
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
            content: sportDescriptor
          },
          {
            role: 'user',
            content: notes
          }
        ],
        temperature: 0.2,
        max_tokens: 150
      }),
    });

    const data = await response.json();
    const suggestions = data.choices[0].message.content
      .split('\n')
      .filter(Boolean)
      .map(point => point.replace(/^[0-9]+\.\s*/, '').trim());

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-match-notes function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});