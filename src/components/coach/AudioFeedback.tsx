import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Play, Pause, RotateCcw, Upload, X } from "lucide-react";

interface AudioFeedbackProps {
  playerId?: string;
  matchId?: string;
  onAudioSaved?: (audioData: string) => void;
  compact?: boolean;
}

export function AudioFeedback({ playerId, matchId, onAudioSaved, compact = false }: AudioFeedbackProps) {
  const { toast } = useToast();
  const [state, setState] = useState<"idle" | "recording" | "stopped">("idle");
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setState("stopped");
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setState("recording");
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (error) {
      toast({
        title: "Recording error",
        description: "Could not start audio recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState("stopped");
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setState("idle");
    setDuration(0);
    chunksRef.current = [];
  };

  const saveAudioNote = async () => {
    if (!audioBlob) return;

    setIsSaving(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64 = reader.result as string;

        // Store in coach_notes on the match if matchId provided, otherwise in a general feedback table
        if (matchId) {
          // Find existing coach_notes
          const { data: existing } = await supabase
            .from("matches")
            .select("coach_notes")
            .eq("id", matchId)
            .single();

          const existingNotes = existing?.coach_notes || [];
          const newNote = {
            id: crypto.randomUUID(),
            note_type: "audio",
            content: `Audio feedback (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`,
            audio_data: base64,
            created_at: new Date().toISOString(),
          };

          await supabase
            .from("matches")
            .update({ coach_notes: [...existingNotes, newNote] })
            .eq("id", matchId);
        } else if (playerId) {
          // Could create a coach_audio_notes table in the future
          // For now, trigger notification with audio data
          await supabase.functions.invoke("notify-athlete", {
            body: {
              player_id: playerId,
              type: "coach_note",
              title: "Coach sent audio feedback",
              audio_data: base64,
            },
          });
        }

        onAudioSaved?.(base64);
        toast({ title: "Audio feedback saved" });
        reset();
        setIsSaving(false);
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save audio note",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {state === "idle" && (
          <Button size="sm" variant="outline" onClick={startRecording}>
            <Mic className="h-4 w-4 mr-1" />
            Record
          </Button>
        )}
        {state === "recording" && (
          <Button size="sm" variant="destructive" onClick={stopRecording}>
            <Square className="h-4 w-4 mr-1" />
            {formatDuration(duration)}
          </Button>
        )}
        {state === "stopped" && (
          <>
            <audio src={audioUrl!} controls className="h-8 w-40" />
            <Button size="sm" onClick={saveAudioNote} disabled={isSaving}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={reset}>
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Audio Feedback</h3>
        {state === "recording" && (
          <div className="flex items-center gap-2 text-red-600">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="font-mono">{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex justify-center mb-4">
        <button
          onClick={state === "idle" ? startRecording : state === "recording" ? stopRecording : reset}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-all
            ${state === "recording" 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-purple-500 hover:bg-purple-600"}
            text-white shadow-lg hover:shadow-xl
          `}
        >
          {state === "idle" ? (
            <Mic className="h-8 w-8" />
          ) : state === "recording" ? (
            <Square className="h-6 w-6 fill-white" />
          ) : (
            <RotateCcw className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Playback */}
      {state === "stopped" && audioUrl && (
        <div className="space-y-3">
          <div className="flex justify-center">
            <audio src={audioUrl} controls className="w-full max-w-md" />
          </div>
          <div className="flex justify-center gap-2">
            <Button onClick={saveAudioNote} disabled={isSaving}>
              <Upload className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Audio Feedback"}
            </Button>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Record Again
            </Button>
          </div>
        </div>
      )}

      {!audioUrl && state !== "recording" && (
        <p className="text-center text-sm text-muted-foreground">
          Tap the microphone to start recording
        </p>
      )}
    </Card>
  );
}
