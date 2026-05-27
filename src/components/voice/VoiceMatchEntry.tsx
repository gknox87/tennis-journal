import { useState, useEffect, useRef } from "react";
import { Mic, Square, Pause, Play, RotateCcw, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVoiceRecording, RecordingState } from "@/hooks/useVoiceRecording";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSport } from "@/context/SportContext";
import { useNavigate } from "react-router-dom";

interface ParsedMatchData {
  opponent?: string;
  score?: string;
  is_win?: boolean;
  court_type?: string;
}

interface VoiceMatchEntryProps {
  onSuccess?: () => void;
}

export function VoiceMatchEntry({ onSuccess }: VoiceMatchEntryProps) {
  const { sport } = useSport();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    state,
    duration,
    audioBlob,
    audioUrl,
    transcription,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    error,
  } = useVoiceRecording();

  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedMatchData | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [quickNotes, setQuickNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Audio visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Draw audio visualization
  useEffect(() => {
    if (state !== "recording" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up audio context
    if (!audioContextRef.current && audioUrl) {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const audio = new Audio(audioUrl);
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyserRef.current = analyser;
    }

    const drawBars = () => {
      if (!analyserRef.current || !ctx) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "#8b5cf6");
        gradient.addColorStop(1, "#ec4899");
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      if (state === "recording") {
        animationRef.current = requestAnimationFrame(drawBars);
      }
    };

    drawBars();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state, audioUrl]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleStartRecording = async () => {
    reset();
    setParsedData(null);
    setShowReflection(false);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleParseWithAI = async () => {
    if (!transcription && !audioBlob) {
      toast({
        title: "No audio recorded",
        description: "Please record your match first.",
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);
    try {
      const textToParse = transcription || "Please transcribe the audio";

      // Call the voice-parse-match edge function
      const { data, error: parseError } = await supabase.functions.invoke("voice-parse-match", {
        body: { text: textToParse, sport_id: sport.id },
      });

      if (parseError) throw parseError;

      setParsedData(data);
      setShowReflection(true);
      toast({
        title: "Match parsed!",
        description: "Review the extracted information below.",
      });
    } catch (err) {
      console.error("Parse error:", err);
      toast({
        title: "Parsing failed",
        description: "Could not parse match. You can try again or enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleQuickSave = async () => {
    if (!parsedData) return;

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save matches.",
          variant: "destructive",
        });
        return;
      }

      const score = parsedData.score || "";
      const isWin = parsedData.is_win ?? false;

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .insert({
          date: new Date().toISOString().split("T")[0],
          opponent_id: null,
          score,
          is_win: isWin,
          notes: quickNotes || null,
          user_id: session.user.id,
          court_type: parsedData.court_type || null,
          sport_id: sport.id,
        })
        .select()
        .single();

      if (matchError) throw matchError;

      if (parsedData.opponent) {
        const { data: opponentId } = await supabase.rpc("get_or_create_opponent", {
          p_name: parsedData.opponent,
          p_user_id: session.user.id,
        });

        if (opponentId) {
          await supabase
            .from("matches")
            .update({ opponent_id: opponentId })
            .eq("id", matchData.id)
            .eq("user_id", session.user.id);
        }
      }

      toast({
        title: "Match saved!",
        description: "Your voice match has been recorded.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/match/${matchData.id}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast({
        title: "Save failed",
        description: "Could not save match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStateDisplay = () => {
    switch (state) {
      case "idle":
        return "Tap the mic to start recording";
      case "recording":
        return "Recording your match...";
      case "paused":
        return "Recording paused";
      case "stopped":
        return "Recording complete";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Recording State Indicator */}
      <div className="text-center space-y-2">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          state === "recording" 
            ? "bg-red-100 text-red-700" 
            : state === "stopped"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
        }`}>
          {state === "recording" && (
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
          <span className="font-medium">{getStateDisplay()}</span>
        </div>
        
        {state === "recording" && (
          <div className="text-3xl font-bold text-gray-800 font-mono">
            {formatDuration(duration)}
          </div>
        )}
      </div>

      {/* Audio Visualization Canvas */}
      {state === "recording" && (
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={280}
            height={80}
            className="rounded-2xl bg-white/50"
          />
        </div>
      )}

      {/* Main Mic Button */}
      <div className="flex justify-center">
        <button
          onClick={state === "idle" ? handleStartRecording : state === "recording" ? handleStopRecording : reset}
          className={`
            relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95
            ${state === "recording" 
              ? "bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-200" 
              : "bg-gradient-to-br from-violet-500 to-purple-600 shadow-2xl shadow-purple-200"
            }
          `}
        >
          {/* Pulsing ring when recording */}
          {state === "recording" && (
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
          )}
          
          {/* Icon */}
          {state === "idle" || state === "paused" ? (
            <Mic className="w-12 h-12 text-white" />
          ) : state === "recording" ? (
            <Square className="w-10 h-10 text-white fill-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>
      </div>

      {/* Recording Controls */}
      {state === "recording" && (
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={pauseRecording}
            className="rounded-full px-6"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        </div>
      )}

      {/* Playback Controls (after stop) */}
      {state === "stopped" && audioUrl && (
        <Card className="p-4 rounded-2xl bg-gradient-to-br from-white/90 to-purple-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl">
          <div className="flex items-center gap-4">
            <audio src={audioUrl} controls className="flex-1 h-10" />
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="rounded-full"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Transcription Display */}
          {transcription && (
            <div className="mt-4 p-3 rounded-xl bg-white/60">
              <p className="text-sm font-medium text-gray-700 mb-1">Transcription:</p>
              <p className="text-gray-800">{transcription}</p>
            </div>
          )}

          {/* Parse with AI Button */}
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleParseWithAI}
              disabled={isParsing}
              className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Parse Match with AI
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Parsed Match Data & Quick Save */}
      {showReflection && parsedData && (
        <Card className="p-6 rounded-3xl bg-gradient-to-br from-white/90 to-green-50/50 backdrop-blur-sm border-2 border-white/30 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-teal-600">
              <Check className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold gradient-text">Match Details</h3>
          </div>

          <div className="grid gap-4">
            {parsedData.opponent && (
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/60">
                <span className="text-gray-600">Opponent</span>
                <span className="font-semibold text-gray-800">{parsedData.opponent}</span>
              </div>
            )}
            {parsedData.score && (
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/60">
                <span className="text-gray-600">Score</span>
                <span className="font-semibold text-gray-800">{parsedData.score}</span>
              </div>
            )}
            {parsedData.is_win !== undefined && (
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/60">
                <span className="text-gray-600">Result</span>
                <span className={`font-semibold ${parsedData.is_win ? "text-green-600" : "text-red-600"}`}>
                  {parsedData.is_win ? "Win" : "Loss"}
                </span>
              </div>
            )}
            {parsedData.court_type && (
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/60">
                <span className="text-gray-600">Court</span>
                <span className="font-semibold text-gray-800">{parsedData.court_type}</span>
              </div>
            )}
          </div>

          {/* Quick Notes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Quick Notes (optional)
            </label>
            <textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              placeholder="Add any quick notes about your match..."
              className="w-full min-h-[100px] rounded-xl border-2 border-purple-200/50 bg-white/80 px-4 py-3 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all resize-none"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleQuickSave}
            disabled={isSaving}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Save Quick Match
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-center">
          {error}
        </div>
      )}
    </div>
  );
}