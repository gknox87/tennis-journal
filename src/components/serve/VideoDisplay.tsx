import React, { useEffect, useRef } from 'react';
import { FileVideo } from 'lucide-react';

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hasVideo: boolean;
  videoSource: 'camera' | 'file' | 'url';
  pose: any;
  racketBox: any;
  playerBounds?: any;
  ballDetection?: any;
  zoom: number;
  panX: number;
  panY: number;
}

export const VideoDisplay: React.FC<VideoDisplayProps> = ({
  videoRef,
  canvasRef,
  hasVideo,
  videoSource,
  pose,
  racketBox,
  playerBounds,
  ballDetection,
  zoom,
  panX,
  panY
}) => {
  const renderRef = useRef<number>(0);
  const lastRenderTime = useRef<number>(0);

  useEffect(() => {
    const drawOverlay = (currentTime: number) => {
      // Throttle rendering to 15 FPS for better performance
      if (currentTime - lastRenderTime.current < 67) { // 67ms = ~15 FPS
        renderRef.current = requestAnimationFrame(drawOverlay);
        return;
      }
      lastRenderTime.current = currentTime;
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) {
        renderRef.current = requestAnimationFrame(drawOverlay);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        renderRef.current = requestAnimationFrame(drawOverlay);
        return;
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
      
      const { width, height } = canvas;
      
      // Clear previous drawings
      ctx.clearRect(0, 0, width, height);

      // Apply zoom and pan transformations
      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.translate(panX, panY);

      // Draw pose skeleton with landmarks
      if (pose && pose.landmarks) {
        drawPoseSkeleton(ctx, pose.landmarks, width, height);
      }

      // Draw racket detection box
      if (racketBox && racketBox.confidence > 0.3) {
        drawRacketBox(ctx, racketBox, width, height);
      }

      // Draw ball detection
      if (ballDetection && ballDetection.confidence > 0.01) {
        drawBallDetection(ctx, ballDetection, width, height);
      }

      // Draw status info overlay
      ctx.restore(); // Reset transformations for status overlay
      drawStatusInfo(ctx, { pose, racketBox, ballDetection });
      
      // Continue animation loop
      renderRef.current = requestAnimationFrame(drawOverlay);
    };
    
    renderRef.current = requestAnimationFrame(drawOverlay);
    
    return () => {
      if (renderRef.current) {
        cancelAnimationFrame(renderRef.current);
      }
    };
  }, [canvasRef, videoRef, pose, racketBox, playerBounds, ballDetection, zoom, panX, panY]);

  const drawPoseSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    
    // MediaPipe pose connections
    const connections = [
      // Face
      [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
      // Torso
      [9, 10], [11, 12], [11, 23], [12, 24], [23, 24],
      // Arms
      [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
      [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
      // Legs
      [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
      [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
    ];
    
    // Draw connections
    ctx.lineWidth = 3;
    connections.forEach(([start, end]) => {
      if (start < landmarks.length && end < landmarks.length) {
        const startPoint = landmarks[start];
        const endPoint = landmarks[end];
        
        if (startPoint && endPoint && 
            startPoint.visibility > 0.3 && endPoint.visibility > 0.3) {
          
          // Color code different body parts
          if (start <= 10 || end <= 10) {
            ctx.strokeStyle = '#00FFFF'; // Cyan for head
          } else if ((start >= 11 && start <= 22) || (end >= 11 && end <= 22)) {
            ctx.strokeStyle = '#00FF00'; // Green for upper body
          } else {
            ctx.strokeStyle = '#FF00FF'; // Magenta for lower body
          }
          
          ctx.beginPath();
          ctx.moveTo(startPoint.x * width, startPoint.y * height);
          ctx.lineTo(endPoint.x * width, endPoint.y * height);
          ctx.stroke();
        }
      }
    });
    
    // Draw key landmarks
    const keyPoints = [0, 11, 12, 15, 16, 23, 24];
    keyPoints.forEach(idx => {
      if (idx < landmarks.length) {
        const point = landmarks[idx];
        if (point && point.visibility > 0.3) {
          ctx.fillStyle = idx === 0 ? '#FFFF00' : '#FF0000';
          ctx.beginPath();
          ctx.arc(point.x * width, point.y * height, 6, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    });
  };

  const drawRacketBox = (ctx: CanvasRenderingContext2D, racket: any, width: number, height: number) => {
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 3;
    
    const x = racket.x * width;
    const y = racket.y * height;
    const w = racket.width * width;
    const h = racket.height * height;
    
    ctx.strokeRect(x, y, w, h);
    
    // Draw center cross
    const centerX = x + w/2;
    const centerY = y + h/2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
    
    // Label
    ctx.fillStyle = '#FF0000';
    ctx.font = '12px Arial';
    ctx.fillText(`Racket ${Math.round(racket.confidence * 100)}%`, x, y - 5);
  };

  const drawBallDetection = (ctx: CanvasRenderingContext2D, ball: any, width: number, height: number) => {
    // Ball coordinates are normalized (0-1), convert to pixel coordinates
    const x = ball.x * width;
    const y = ball.y * height;
    
    // Calculate tennis ball radius based on video resolution
    // Tennis ball is approximately 6.7cm diameter
    // Assume the video shows roughly 10-15 meters width for tennis court
    const ballRadius = Math.max(8, Math.min(25, width * 0.02)); // Adaptive radius between 8-25 pixels
    
    // Draw ball with confidence-based opacity
    const opacity = Math.min(0.8, ball.confidence + 0.2);
    
    // Outer glow for better visibility
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#FFFF00';
    ctx.fillStyle = `rgba(255, 255, 0, ${opacity * 0.4})`;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Inner circle for precision
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Crosshair for exact center
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x, y + 8);
    ctx.stroke();
    
    // Motion trail (if we have previous positions)
    if (ball.previousPositions && ball.previousPositions.length > 0) {
      ctx.strokeStyle = `rgba(255, 255, 0, 0.3)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let prevX = ball.previousPositions[0].x * width;
      let prevY = ball.previousPositions[0].y * height;
      ctx.moveTo(prevX, prevY);
      
      for (let i = 1; i < ball.previousPositions.length; i++) {
        const posX = ball.previousPositions[i].x * width;
        const posY = ball.previousPositions[i].y * height;
        ctx.lineTo(posX, posY);
        prevX = posX;
        prevY = posY;
      }
      
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    // Confidence and detection info
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    const label = `Ball ${Math.round(ball.confidence * 100)}%`;
    const labelX = x + ballRadius + 8;
    const labelY = y - 8;
    
    // Text with outline for better visibility
    ctx.strokeText(label, labelX, labelY);
    ctx.fillText(label, labelX, labelY);
    
    // Detection quality indicator
    const qualityColor = ball.confidence > 0.7 ? '#00FF00' : 
                        ball.confidence > 0.4 ? '#FFAA00' : '#FF6600';
    ctx.fillStyle = qualityColor;
    ctx.fillRect(labelX, labelY + 3, 60 * ball.confidence, 3);
    
    console.log('[VideoDisplay] Ball detection drawn successfully');
  };

  const drawStatusInfo = (ctx: CanvasRenderingContext2D, detections: any) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 280, 130);
    
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px Arial';
    let y = 28;
    
    ctx.fillText('🎾 Tennis AI Tracking', 15, y);
    y += 20;
    
    ctx.font = '12px Arial';
    if (detections.pose && detections.pose.landmarks) {
      ctx.fillStyle = '#00FF00';
      ctx.fillText(`✓ Pose: ${detections.pose.landmarks.length} points`, 15, y);
    } else {
      ctx.fillStyle = '#FF6600';
      ctx.fillText('⚠ Pose: No detection', 15, y);
    }
    y += 15;
    
    if (detections.racketBox) {
      ctx.fillStyle = '#FF0000';
      ctx.fillText(`✓ Racket: ${Math.round(detections.racketBox.confidence * 100)}%`, 15, y);
    } else {
      ctx.fillStyle = '#FF6600';
      ctx.fillText('⚠ Racket: No detection', 15, y);
    }
    y += 15;
    
    if (detections.ballDetection) {
      const ball = detections.ballDetection;
      ctx.fillStyle = '#FFFF00';
      ctx.fillText(`✓ Ball: ${Math.round(ball.confidence * 100)}%`, 15, y);
      y += 15;
      
      // Show ball position
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '10px Arial';
      ctx.fillText(`   Position: (${(ball.x * 100).toFixed(1)}%, ${(ball.y * 100).toFixed(1)}%)`, 15, y);
      y += 12;
      
      // Show motion trail info
      if (ball.previousPositions && ball.previousPositions.length > 0) {
        ctx.fillText(`   Trail: ${ball.previousPositions.length} points`, 15, y);
      } else {
        ctx.fillText(`   Trail: None`, 15, y);
      }
    } else {
      ctx.fillStyle = '#FF6600';
      ctx.fillText('⚠ Ball: No detection', 15, y);
      y += 15;
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '10px Arial';
      ctx.fillText('   Check lighting & ball visibility', 15, y);
    }
  };

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay={videoSource === 'camera'}
        muted
        playsInline
        controls={false}
        className="w-full h-full object-contain"
        style={{ backgroundColor: '#000000' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 10 }}
      />
      
      {!hasVideo && videoSource === 'file' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
          <div className="text-center text-white">
            <FileVideo className="w-12 h-12 mx-auto mb-2 opacity-60" />
            <p className="text-sm">Upload a video to start analysis</p>
          </div>
        </div>
      )}
    </div>
  );
};
