
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Square } from 'lucide-react';

interface VideoCaptureCardProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isRecording: boolean;
  onToggleRecording: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pose: any;
  racketBox: any;
}

export const VideoCaptureCard: React.FC<VideoCaptureCardProps> = ({
  videoRef,
  canvasRef,
  isRecording,
  onToggleRecording,
  onFileUpload,
  pose,
  racketBox
}) => {
  useEffect(() => {
    const drawOverlay = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw pose skeleton
      if (pose && pose.landmarks) {
        ctx.strokeStyle = '#22C55E';
        ctx.lineWidth = 3;
        ctx.fillStyle = '#22C55E';
        
        // Draw key pose points
        pose.landmarks.forEach((landmark: any, index: number) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Draw skeleton connections
        const connections = [
          [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
          [11, 23], [12, 24], [23, 24], // Torso
          [23, 25], [25, 27], [24, 26], [26, 28] // Legs
        ];
        
        connections.forEach(([start, end]) => {
          if (pose.landmarks[start] && pose.landmarks[end]) {
            const startX = pose.landmarks[start].x * canvas.width;
            const startY = pose.landmarks[start].y * canvas.height;
            const endX = pose.landmarks[end].x * canvas.width;
            const endY = pose.landmarks[end].y * canvas.height;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
        });
      }
      
      // Draw racket bounding box
      if (racketBox) {
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          racketBox.x * canvas.width,
          racketBox.y * canvas.height,
          racketBox.width * canvas.width,
          racketBox.height * canvas.height
        );
        
        // Add racket label
        ctx.fillStyle = '#EF4444';
        ctx.font = '14px Inter';
        ctx.fillText(
          'Racket',
          racketBox.x * canvas.width,
          racketBox.y * canvas.height - 5
        );
      }
    };
    
    const animationFrame = requestAnimationFrame(function animate() {
      drawOverlay();
      requestAnimationFrame(animate);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [pose, racketBox, canvasRef, videoRef]);

  return (
    <Card className="rounded-2xl shadow-lg mb-6 bg-gradient-to-b from-white/60 via-white/40 to-white/10 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Video Container */}
          <div className="flex-1 relative">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ mixBlendMode: 'multiply' }}
              />
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Recording</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="md:w-64 space-y-4">
            <Button
              onClick={onToggleRecording}
              className={`w-full h-12 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept="video/mp4,video/mov"
                onChange={onFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="video-upload"
              />
              <Button variant="secondary" className="w-full h-12" asChild>
                <label htmlFor="video-upload" className="cursor-pointer flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </label>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Tip: hold the camera chest-high, 3 m in front.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
