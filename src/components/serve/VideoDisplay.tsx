
import React, { useEffect } from 'react';
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
  useEffect(() => {
    const drawOverlay = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Get video element's actual display dimensions
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Calculate precise video scaling
      const videoAspectRatio = video.videoWidth / video.videoHeight;
      const displayAspectRatio = rect.width / rect.height;
      
      let scaleX, scaleY, offsetX, offsetY;
      
      if (videoAspectRatio > displayAspectRatio) {
        scaleX = rect.width / video.videoWidth;
        scaleY = scaleX;
        offsetX = 0;
        offsetY = (rect.height - video.videoHeight * scaleY) / 2;
      } else {
        scaleY = rect.height / video.videoHeight;
        scaleX = scaleY;
        offsetX = (rect.width - video.videoWidth * scaleX) / 2;
        offsetY = 0;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(offsetX + panX, offsetY + panY);
      ctx.scale(scaleX * zoom, scaleY * zoom);

      // Draw pose skeleton with PIXEL-PERFECT alignment
      if (pose && pose.landmarks && pose.landmarks.length >= 33) {
        const landmarks = pose.landmarks;
        
        // Define skeleton connections for accurate pose visualization
        const connections = [
          // Core body structure
          [11, 12], // shoulders
          [11, 23], [12, 24], [23, 24], // torso
          
          // Right arm (serving arm) - MOST IMPORTANT
          [12, 14], [14, 16], // right shoulder -> elbow -> wrist
          
          // Left arm for balance
          [11, 13], [13, 15], // left shoulder -> elbow -> wrist
          
          // Legs for stance analysis
          [23, 25], [25, 27], // left hip -> knee -> ankle
          [24, 26], [26, 28], // right hip -> knee -> ankle
          
          // Feet positioning
          [27, 29], [28, 30], [29, 31], [30, 32]
        ];
        
        // Draw skeleton with precise positioning
        ctx.lineWidth = 2;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 1;
        
        connections.forEach(([startIdx, endIdx]) => {
          const start = landmarks[startIdx];
          const end = landmarks[endIdx];
          
          if (start && end && 
              (!start.visibility || start.visibility > 0.6) && 
              (!end.visibility || end.visibility > 0.6)) {
            
            // Highlight serving arm in different color
            if ((startIdx === 12 && endIdx === 14) || (startIdx === 14 && endIdx === 16)) {
              ctx.strokeStyle = '#FF0080'; // Bright pink for serving arm
              ctx.lineWidth = 3;
            } else {
              ctx.strokeStyle = '#00FF00'; // Green for other connections
              ctx.lineWidth = 2;
            }
            
            const x1 = start.x * video.videoWidth;
            const y1 = start.y * video.videoHeight;
            const x2 = end.x * video.videoWidth;
            const y2 = end.y * video.videoHeight;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        });
        
        ctx.shadowBlur = 0;
        
        // Draw key landmarks with pixel-perfect positioning
        const criticalPoints = [
          { idx: 0, label: 'HEAD', color: '#FFFF00', size: 5 },
          { idx: 12, label: 'R-SHOULDER', color: '#FF0080', size: 7 },
          { idx: 14, label: 'R-ELBOW', color: '#FF0080', size: 7 },
          { idx: 16, label: 'R-WRIST', color: '#FF0080', size: 9 }, // Most important for racket
          { idx: 11, label: 'L-SHOULDER', color: '#00FFFF', size: 5 },
          { idx: 24, label: 'R-HIP', color: '#FFA500', size: 5 },
          { idx: 26, label: 'R-KNEE', color: '#00FF00', size: 5 },
          { idx: 28, label: 'R-ANKLE', color: '#0080FF', size: 5 }
        ];
        
        criticalPoints.forEach(({ idx, label, color, size }) => {
          const landmark = landmarks[idx];
          if (landmark && (!landmark.visibility || landmark.visibility > 0.6)) {
            const x = landmark.x * video.videoWidth;
            const y = landmark.y * video.videoHeight;
            
            // Draw point with black outline for visibility
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x, y, size + 1, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw labels for important points
            if (zoom > 0.7) {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              const labelWidth = label.length * 6;
              ctx.fillRect(x + 10, y - 15, labelWidth, 12);
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 10px Arial';
              ctx.fillText(label, x + 12, y - 6);
            }
          }
        });
      }

      // Draw player bounds with precise alignment
      if (playerBounds && playerBounds.confidence > 0.4) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        
        const x = playerBounds.x * video.videoWidth;
        const y = playerBounds.y * video.videoHeight;
        const width = playerBounds.width * video.videoWidth;
        const height = playerBounds.height * video.videoHeight;
        
        ctx.strokeRect(x, y, width, height);
        
        // Player confidence label
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.fillRect(x, y - 22, 110, 18);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`PLAYER ${Math.round(playerBounds.confidence * 100)}%`, x + 3, y - 7);
      }

      // Draw racket with precise pixel alignment
      if (racketBox && racketBox.confidence > 0.6) {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        
        const x = racketBox.x * video.videoWidth;
        const y = racketBox.y * video.videoHeight;
        const width = racketBox.width * video.videoWidth;
        const height = racketBox.height * video.videoHeight;
        
        ctx.strokeRect(x, y, width, height);
        
        // Racket center crosshair for precision
        const centerX = x + width/2;
        const centerY = y + height/2;
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 8, centerY);
        ctx.lineTo(centerX + 8, centerY);
        ctx.moveTo(centerX, centerY - 8);
        ctx.lineTo(centerX, centerY + 8);
        ctx.stroke();
        
        // Racket confidence label
        ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        ctx.fillRect(x, y - 22, 100, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`RACKET ${Math.round(racketBox.confidence * 100)}%`, x + 3, y - 7);
      }

      // Draw ball with precise tracking
      if (ballDetection && ballDetection.confidence > 0.7) {
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FFFF00';
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 2;
        
        const x = ballDetection.x * video.videoWidth;
        const y = ballDetection.y * video.videoHeight;
        const radius = ballDetection.radius * video.videoWidth;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Ball confidence label
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.fillRect(x + radius + 3, y - 12, 80, 16);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`BALL ${Math.round(ballDetection.confidence * 100)}%`, x + radius + 5, y - 2);
      }
      
      ctx.restore();
      
      // Draw real-time status panel
      if (pose || racketBox || playerBounds || ballDetection) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(8, 8, 280, 140);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 280, 140);
        
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 13px Arial';
        let yPos = 25;
        
        ctx.fillText('🎾 REAL TENNIS TRACKING', 15, yPos);
        yPos += 20;
        
        if (playerBounds) {
          ctx.fillStyle = '#FFD700';
          ctx.fillText(`👤 Player: ${Math.round(playerBounds.confidence * 100)}% detected`, 15, yPos);
          yPos += 16;
        }
        
        if (pose && pose.landmarks) {
          ctx.fillStyle = '#FF0080';
          ctx.fillText(`🎯 Pose: ${pose.landmarks.length} joints tracked`, 15, yPos);
          yPos += 16;
        }
        
        if (racketBox) {
          ctx.fillStyle = '#FF0000';
          ctx.fillText(`🎾 Racket: ${Math.round(racketBox.confidence * 100)}% accuracy`, 15, yPos);
          yPos += 16;
        }
        
        if (ballDetection) {
          ctx.fillStyle = '#FFFF00';
          ctx.fillText(`⚪ Ball: ${Math.round(ballDetection.confidence * 100)}% tracked`, 15, yPos);
        }
      }
    };
    
    const animationFrame = requestAnimationFrame(function animate() {
      drawOverlay();
      requestAnimationFrame(animate);
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [pose, racketBox, playerBounds, ballDetection, canvasRef, videoRef, zoom, panX, panY]);

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
      
      {/* Video Status Overlay */}
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
