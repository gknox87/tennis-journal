import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Play, Pause, Plus, Trash2, Clock, Check } from "lucide-react";

interface CoachNote {
  id: string;
  timestamp?: string;
  note_type: "comment" | "drill_prescription" | "audio";
  content: string;
  audio_data?: string; // base64 audio
  drill_id?: string;
  created_at: string;
}

interface Match {
  id: string;
  date: string;
  opponent_name?: string;
  score: string;
  is_win: boolean;
  sport_id: string;
  notes?: string;
  coach_notes?: CoachNote[];
}

interface AnnotateMatchProps {
  match: Match;
  onClose: () => void;
}

export function AnnotateMatch({ match, onClose }: AnnotateMatchProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [linkedDrill, setLinkedDrill] = useState<string | null>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);

  useEffect(() => {
    loadCoachNotes();
  }, [match.id]);

  const loadCoachNotes = async () => {
    try {
      const { data } = await supabase
        .from("matches")
        .select("coach_notes")
        .eq("id", match.id)
        .single();

      if (data?.coach_notes) {
        setNotes(data.coach_notes as CoachNote[]);
      }
    } catch (error) {
      console.error("Error loading coach notes:", error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
      };

      recorder.start(100);
      setMediaRecorder(recorder);
      setChunks([]);
      setIsRecording(true);

      // Duration timer
      const interval = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);

      recorder.stream.getAudioTracks().forEach(track => {
        track.onended = () => {
          clearInterval(interval);
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
        };
      });
    } catch (error) {
      toast({
        title: "Recording error",
        description: "Could not start audio recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  const addTextNote = async () => {
    if (!newNote.trim()) return;

    setIsSaving(true);
    try {
      const note: CoachNote = {
        id: crypto.randomUUID(),
        timestamp: timestamp || undefined,
        note_type: "comment",
        content: newNote,
        created_at: new Date().toISOString(),
      };

      const updatedNotes = [...notes, note];
      await supabase
        .from("matches")
        .update({ coach_notes: updatedNotes })
        .eq("id", match.id);

      setNotes(updatedNotes);
      setNewNote("");
      setTimestamp("");

      // Trigger notification
      await triggerNotification("coach_note");

      toast({ title: "Note added" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addAudioNote = async () => {
    if (!audioBlob) return;

    setIsSaving(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const note: CoachNote = {
          id: crypto.randomUUID(),
          note_type: "audio",
          content: `Audio note (${Math.floor(recordingDuration / 60)}:${(recordingDuration % 60).toString().padStart(2, "0")})`,
          audio_data: base64,
          created_at: new Date().toISOString(),
        };

        const updatedNotes = [...notes, note];
        await supabase
          .from("matches")
          .update({ coach_notes: updatedNotes })
          .eq("id", match.id);

        setNotes(updatedNotes);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingDuration(0);

        toast({ title: "Audio note added" });
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

  const deleteNote = async (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    await supabase
      .from("matches")
      .update({ coach_notes: updatedNotes })
      .eq("id", match.id);
    setNotes(updatedNotes);
  };

  const triggerNotification = async (type: string) => {
    try {
      await supabase.functions.invoke("notify-athlete", {
        body: {
          match_id: match.id,
          type,
          title: type === "coach_note" ? "Coach added a note" : "Coach annotated your match",
        },
      });
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Info */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant="outline">
            {new Date(match.date).toLocaleDateString()}
          </Badge>
          <span className="font-medium">{match.opponent_name || "Unknown opponent"}</span>
          <span className={`font-semibold ${match.is_win ? "text-green-600" : "text-red-600"}`}>
            {match.is_win ? "W" : "L"} {match.score}
          </span>
        </div>
      </Card>

      {/* Existing Notes */}
      {notes.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Coach Notes</h3>
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {note.timestamp && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {note.timestamp}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {note.note_type === "audio" && note.audio_data ? (
                  <div>
                    <audio src={note.audio_data} controls className="w-full h-10" />
                  </div>
                ) : (
                  <p className="text-sm">{note.content}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add New Note */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Add Note</h3>
        
        {/* Timestamp + Note */}
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <Input
              placeholder="Timestamp (e.g., 15:30)"
              value={timestamp}
              onChange={e => setTimestamp(e.target.value)}
              className="w-32"
            />
            <Input
              placeholder="Add a note..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button onClick={addTextNote} disabled={!newNote.trim() || isSaving}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        {/* Audio Recording */}
        <div className="border-t pt-4 mt-4">
          <p className="text-sm font-medium mb-2">Voice Note</p>
          {!audioUrl ? (
            <div className="flex items-center gap-3">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop ({Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, "0")})
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Record Audio
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <audio src={audioUrl} controls className="w-full h-10" />
              <div className="flex gap-2">
                <Button onClick={addAudioNote} disabled={isSaving} size="sm">
                  <Check className="h-4 w-4 mr-2" />
                  Attach Audio Note
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                    setRecordingDuration(0);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
