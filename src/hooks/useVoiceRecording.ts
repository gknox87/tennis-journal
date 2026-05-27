import { useState, useEffect, useRef, useCallback } from "react";

export type RecordingState = "idle" | "recording" | "paused" | "stopped";

export interface UseVoiceRecordingReturn {
  state: RecordingState;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  reset: () => void;
  transcription: string;
  isTranscribing: boolean;
  error: string | null;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResult[];
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [state, setState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore cleanup errors
      }
      recognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  const startTimer = useCallback(() => {
    setDuration(0);
    timerRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      cleanup();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Initialize speech recognition if available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          let interimTranscript = "";
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscription((prev) => prev + " " + finalTranscript);
          }
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn("Speech recognition error:", event.error);
          // Don't stop recording on speech recognition errors
        };
        
        recognition.onend = () => {
          // Restart recognition if still recording
          if (state === "recording" && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Ignore
            }
          }
        };
        
        recognitionRef.current = recognition;
        recognition.start();
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setState("stopped");
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setState("recording");
      startTimer();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start recording";
      setError(message);
      setState("idle");
    }
  }, [cleanup, startTimer, state]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    stopTimer();
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, [stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      stopTimer();
      setState("paused");
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      startTimer();
      setState("recording");
      
      // Restart speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition && !recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscription((prev) => prev + " " + finalTranscript);
          }
        };
        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      }
    }
  }, [startTimer]);

  const reset = useCallback(() => {
    cleanup();
    setState("idle");
    setDuration(0);
    setAudioBlob(null);
    setTranscription("");
    setError(null);
    chunksRef.current = [];
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
    transcription,
    isTranscribing,
    error,
  };
}