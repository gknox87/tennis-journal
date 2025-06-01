import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Activity, Link, Upload, Camera, User, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMediaPipePose } from '@/hooks/useMediaPipePose';
import { useRacketDetection } from '@/hooks/useRacketDetection';
import { useServeAnalytics } from '@/hooks/useServeAnalytics';
import { MetricCard } from '@/components/serve/MetricCard';
import { VideoCaptureCard } from '@/components/serve/VideoCaptureCard';
import { ComparisonPanel } from '@/components/serve/ComparisonPanel';

type CameraAngle = 'front' | 'side' | 'back';

const ServeAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoSource, setVideoSource] = useState<'camera' | 'file' | 'url'>('camera');
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('side');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  
  // Use real AI hooks
  const { pose, isLoading: poseLoading, error: poseError } = useMediaPipePose(videoRef);
  const { racketBox, isLoading: racketLoading } = useRacketDetection(videoRef);
  const { metrics, similarity, servePhase, saveSession, resetMetrics } = useServeAnalytics(pose, racketBox, cameraAngle);

  const isAILoading = poseLoading || racketLoading;

  useEffect(() => {
    if (videoSource === 'camera') {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoSource]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'environment' 
        },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
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
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!stream) return;
    
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        setHasRecorded(true);
        setIsRecording(false);
        toast({
          title: "Recording Stopped",
          description: "Analyzing your serve performance...",
        });
      };
      
      mediaRecorder.start(100); // Record in 100ms chunks
      setIsRecording(true);
      setHasRecorded(false);
      resetMetrics();
      
      toast({
        title: "Recording Started",
        description: "Perform your serve now!",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to start recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
      videoRef.current.load();
      setVideoSource('file');
      setHasRecorded(true);
      resetMetrics();
      
      // Stop camera stream if active
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      toast({
        title: "Video Uploaded",
        description: "Video loaded successfully. Play to start analysis.",
      });
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleYouTubeUrl = async () => {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive"
      });
      return;
    }

    // Use a proxy service or iframe embed
    // For demo purposes, we'll show a message about YouTube restrictions
    toast({
      title: "YouTube Integration",
      description: "Due to CORS restrictions, please download the video and upload it as a file.",
      variant: "destructive"
    });
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

  const switchToCamera = () => {
    setVideoSource('camera');
    setYoutubeUrl('');
    if (videoRef.current) {
      videoRef.current.src = '';
    }
  };

  const getCameraInstructions = (angle: CameraAngle) => {
    switch (angle) {
      case 'front':
        return "Position camera facing the player, 3-4m from baseline. Best for analyzing X-factor rotation and contact point.";
      case 'side':
        return "Position camera perpendicular to the court, 3-4m away. Optimal for elbow/knee angles and serve mechanics.";
      case 'back':
        return "Position camera behind the player, elevated view preferred. Good for follow-through analysis.";
      default:
        return "Position camera for optimal serve analysis";
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
          <p className="text-gray-600">AI-powered biomechanical analysis using MediaPipe and YOLO</p>
          
          {isAILoading && (
            <div className="flex items-center justify-center gap-2 mt-4 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading AI models...</span>
            </div>
          )}
          
          {poseError && (
            <div className="flex items-center justify-center gap-2 mt-4 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Failed to load pose detection model</span>
            </div>
          )}
        </div>
      </div>

      {/* Camera Angle Selection */}
      <Card className="mb-6 bg-gradient-to-b from-white/60 via-white/40 to-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Angle - Current: {cameraAngle.charAt(0).toUpperCase() + cameraAngle.slice(1)} View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
              variant={cameraAngle === 'front' ? 'default' : 'secondary'}
              onClick={() => setCameraAngle('front')}
              className="flex flex-col items-center p-4 h-auto"
              disabled={isAILoading}
            >
              <User className="w-6 h-6 mb-2" />
              <span className="text-sm">Front View</span>
              <span className="text-xs text-muted-foreground">X-Factor</span>
            </Button>
            <Button
              variant={cameraAngle === 'side' ? 'default' : 'secondary'}
              onClick={() => setCameraAngle('side')}
              className="flex flex-col items-center p-4 h-auto"
              disabled={isAILoading}
            >
              <UserCheck className="w-6 h-6 mb-2" />
              <span className="text-sm">Side View</span>
              <span className="text-xs text-muted-foreground">Mechanics</span>
            </Button>
            <Button
              variant={cameraAngle === 'back' ? 'default' : 'secondary'}
              onClick={() => setCameraAngle('back')}
              className="flex flex-col items-center p-4 h-auto"
              disabled={isAILoading}
            >
              <User className="w-6 h-6 mb-2 rotate-180" />
              <span className="text-sm">Back View</span>
              <span className="text-xs text-muted-foreground">Follow-through</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {getCameraInstructions(cameraAngle)}
          </p>
        </CardContent>
      </Card>

      {/* Video Source Selection */}
      <Card className="mb-6 bg-gradient-to-b from-white/60 via-white/40 to-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg">Video Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={videoSource === 'camera' ? 'default' : 'secondary'}
                onClick={switchToCamera}
                className="flex-1 min-w-24"
              >
                Camera
              </Button>
              <Button
                variant={videoSource === 'file' ? 'default' : 'secondary'}
                onClick={() => setVideoSource('file')}
                className="flex-1 min-w-24"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button
                variant={videoSource === 'url' ? 'default' : 'secondary'}
                onClick={() => setVideoSource('url')}
                className="flex-1 min-w-24"
              >
                <Link className="w-4 h-4 mr-2" />
                URL
              </Button>
            </div>
            
            {videoSource === 'url' && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter YouTube URL or video URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleYouTubeUrl}>Load</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Capture Card */}
      <VideoCaptureCard
        videoRef={videoRef}
        canvasRef={canvasRef}
        isRecording={isRecording}
        onToggleRecording={toggleRecording}
        onFileUpload={handleFileUpload}
        pose={pose}
        racketBox={racketBox}
        videoSource={videoSource}
      />

      {/* Serve Phase Indicator */}
      {pose && (
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Serve Phase:</span>
              <span className="text-lg font-bold capitalize text-purple-700">
                {servePhase}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

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
          unit="score"
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
            <AccordionItem value="technology">
              <AccordionTrigger>AI Technology</AccordionTrigger>
              <AccordionContent>
                Uses Google MediaPipe for real-time pose detection and YOLOv8 for racket tracking. 
                Analysis runs entirely in your browser for privacy and speed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="angles">
              <AccordionTrigger>Camera Angles</AccordionTrigger>
              <AccordionContent>
                • <strong>Side View:</strong> Best for elbow/knee angles and timing
                <br />• <strong>Front View:</strong> Optimal for X-factor rotation analysis  
                <br />• <strong>Back View:</strong> Great for follow-through and racket path
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="accuracy">
              <AccordionTrigger>Accuracy & Setup</AccordionTrigger>
              <AccordionContent>
                For best results: good lighting, minimal background clutter, contrasting clothing. 
                Position camera 3-4 meters away at chest height.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacy">
              <AccordionTrigger>Privacy & Data</AccordionTrigger>
              <AccordionContent>
                All analysis happens locally on your device. Videos are not uploaded to any server. 
                Only anonymized metrics are saved to your profile.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServeAnalysis;
