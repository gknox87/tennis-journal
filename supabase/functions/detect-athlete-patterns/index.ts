import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PatternEvidence {
  sampleSize: number;
  metric: number;
  baseline?: number;
  matchIds?: string[];
  dates?: string[];
  detail?: string;
}

interface DetectedPattern {
  key: string;
  category: string;
  headline: string;
  evidence: PatternEvidence;
  confidence: string;
}

interface NarratedPattern {
  pattern_key: string;
  message: string;
  action: string;
  severity: "info" | "warning" | "positive";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patterns } = await req.json() as {
      user_id?: string;
      sport_id?: string;
      patterns: DetectedPattern[];
    };

    if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
      return new Response(
        JSON.stringify({ error: "No patterns provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const patternSummary = patterns
      .map(
        (p) =>
          `- key: ${p.key}\n  category: ${p.category}\n  headline: ${p.headline}\n  evidence: ${JSON.stringify(p.evidence)}`
      )
      .join("\n\n");

    const prompt = `You receive verified statistics about an athlete. Never invent or alter numbers — use only what is in the headline and evidence.

For each pattern below, respond with JSON array items containing:
- pattern_key (must match exactly)
- message (1-2 sentences: sports psychology insight connecting stat to plausible mental/physical cause)
- action (one concrete next step)
- severity ("info", "warning", or "positive")

Tone: direct, supportive, not alarmist.

Patterns:
${patternSummary}

Respond ONLY with a valid JSON array, no markdown.`;

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("DEEPSEEK_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are a sports psychologist. You receive verified statistics. Never invent numbers. Respond only with valid JSON arrays.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 600,
        }),
      }
    );

    const data = await response.json();
    const inputKeys = new Set(patterns.map((p) => p.key));
    let narrated: NarratedPattern[] = [];

    if (data.choices?.[0]?.message?.content) {
      try {
        const content = data.choices[0].message.content.trim();
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        if (Array.isArray(parsed)) {
          narrated = parsed.filter(
            (item: NarratedPattern) =>
              item.pattern_key && inputKeys.has(item.pattern_key)
          );
        }
      } catch {
        console.error("Failed to parse LLM response");
      }
    }

    const narratedByKey = new Map(narrated.map((n) => [n.pattern_key, n]));

    const results = patterns.map((p) => {
      const narration = narratedByKey.get(p.key);
      return {
        pattern_key: p.key,
        category: p.category,
        headline: p.headline,
        evidence: p.evidence,
        message: narration?.message ?? p.headline,
        action: narration?.action ?? "Keep tracking — patterns become clearer with more data.",
        severity: narration?.severity ?? "info",
      };
    });

    return new Response(JSON.stringify({ patterns: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in detect-athlete-patterns:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
