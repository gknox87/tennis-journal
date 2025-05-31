
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Activity, Camera, Upload, Play, Square, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePose } from '@/hooks/usePose';
import { useYoloWasm } from '@/hooks/useYoloWasm';
import { useServeAnalysis } from '@/hooks/useServeAnalysis';
import { MetricCard } from '@/components/serve/MetricCard';
import { VideoCaptureCard } from '@/components/serve/VideoCaptureCard';
import { ComparisonPanel } from '@/components/serve/ComparisonPanel';

const ServeAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const { pose } = usePose(videoRef);
  const { racketBox } = useYoloWasm(videoRef);
  const { metrics, similarity, saveSession, resetMetrics } = useServeAnalysis(pose, racketBox);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'environment' 
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecorded(true);
      toast({
        title: "Recording Stopped",
        description: "Analyzing your serve performance...",
      });
    } else {
      setIsRecording(true);
      setHasRecorded(false);
      resetMetrics();
      toast({
        title: "Recording Started",
        description: "Perform your serve now!",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      videoRef.current.load();
      setHasRecorded(true);
      resetMetrics();
    }
  };

  const handleSaveToJournal = async () => {
    try {
      await saveSession();
      toast({
        title: "Session Saved",
        description: "Your serve analysis has been saved to your journal.",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save session. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      {/* Page Header */}
      <div className="mb-6 text-center">
        <div className="bg-gradient-to-b from-blue-100 to-purple-100 rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="h-8 w-8 text-blue-600" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-gray-900">Serve Analysis</h1>
          </div>
          <p className="text-gray-600">Record a serve to see instant biomechanical feedback</p>
        </div>
      </div>

      {/* Video Capture Card */}
      <VideoCaptureCard
        videoRef={videoRef}
        canvasRef={canvasRef}
        isRecording={isRecording}
        onToggleRecording={toggleRecording}
        onFileUpload={handleFileUpload}
        pose={pose}
        racketBox={racketBox}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 mb-6">
        <MetricCard
          title="Elbow"
          value={metrics.elbow}
          unit="°"
          target={150}
          tolerance={10}
          icon="elbow"
        />
        <MetricCard
          title="Knee"
          value={metrics.knee}
          unit="°"
          target={140}
          tolerance={15}
          icon="knee"
        />
        <MetricCard
          title="X-Factor"
          value={metrics.xFactor}
          unit="°"
          target={45}
          tolerance={10}
          icon="rotation"
        />
        <MetricCard
          title="Contact"
          value={metrics.contactHeight}
          unit="cm"
          target={220}
          tolerance={20}
          icon="height"
        />
        <MetricCard
          title="Follow-through"
          value={metrics.followThrough}
          unit="frames"
          target={15}
          tolerance={5}
          icon="followthrough"
        />
      </div>

      {/* Comparison Panel */}
      {hasRecorded && (
        <ComparisonPanel
          similarity={similarity}
          metrics={metrics}
          onSaveToJournal={handleSaveToJournal}
        />
      )}

      {/* How It Works Accordion */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="setup">
              <AccordionTrigger>Camera Setup</AccordionTrigger>
              <AccordionContent>
                Position your camera chest-high, about 3 meters in front of the service line. Ensure good lighting and the entire serve motion is visible in frame.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="accuracy">
              <AccordionTrigger>Accuracy Notes</AccordionTrigger>
              <AccordionContent>
                Analysis accuracy depends on video quality and lighting. Best results with minimal background clutter and contrasting clothing against the court.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacy">
              <AccordionTrigger>Privacy</AccordionTrigger>
              <AccordionContent>
                All analysis happens locally on your device. Videos are not uploaded to any server and remain private on your device.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServeAnalysis;
