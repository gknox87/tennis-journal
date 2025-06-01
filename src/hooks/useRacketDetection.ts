
import { useState, useEffect, useRef } from 'react';

interface RacketDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const useRacketDetection = (
  videoRef: React.RefObject<HTMLVideoElement>, 
  playerBounds?: any, 
  pose?: any
) => {
  const [racketBox, setRacketBox] = useState<RacketDetection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const smoothingRef = useRef<RacketDetection[]>([]);

  useEffect(() => {
    const detectRacket = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth) {
        return;
      }

      let racketDetection: RacketDetection | null = null;

      // Use pose data for racket detection if available
      if (pose && pose.landmarks && pose.landmarks.length >= 17) {
        // Try right hand first (most common for tennis)
        const rightWrist = pose.landmarks[16]; // Right wrist
        const rightElbow = pose.landmarks[14]; // Right elbow
        
        if (rightWrist && rightElbow && rightWrist.visibility > 0.5) {
          console.log('Detecting racket from right hand pose');
          
          // Calculate direction from elbow to wrist
          const direction = {
            x: rightWrist.x - rightElbow.x,
            y: rightWrist.y - rightElbow.y
          };
          
          // Extend racket beyond wrist
          const racketX = rightWrist.x + direction.x * 0.5;
          const racketY = rightWrist.y + direction.y * 0.5;
          
          racketDetection = {
            x: Math.max(0, Math.min(0.85, racketX - 0.06)),
            y: Math.max(0, Math.min(0.85, racketY - 0.08)),
            width: 0.12,
            height: 0.16,
            confidence: Math.min(0.9, rightWrist.visibility + 0.2)
          };
        }
        // Fallback to left hand
        else {
          const leftWrist = pose.landmarks[15]; // Left wrist
          const leftElbow = pose.landmarks[13]; // Left elbow
          
          if (leftWrist && leftElbow && leftWrist.visibility > 0.5) {
            console.log('Detecting racket from left hand pose');
            
            const direction = {
              x: leftWrist.x - leftElbow.x,
              y: leftWrist.y - leftElbow.y
            };
            
            const racketX = leftWrist.x + direction.x * 0.5;
            const racketY = leftWrist.y + direction.y * 0.5;
            
            racketDetection = {
              x: Math.max(0, Math.min(0.85, racketX - 0.06)),
              y: Math.max(0, Math.min(0.85, racketY - 0.08)),
              width: 0.12,
              height: 0.16,
              confidence: Math.min(0.85, leftWrist.visibility + 0.15)
            };
          }
        }
      }

      // Apply smoothing if we have a detection
      if (racketDetection) {
        smoothingRef.current.push(racketDetection);
        if (smoothingRef.current.length > 3) {
          smoothingRef.current.shift();
        }
        
        // Average recent detections
        if (smoothingRef.current.length >= 2) {
          const avgX = smoothingRef.current.reduce((sum, r) => sum + r.x, 0) / smoothingRef.current.length;
          const avgY = smoothingRef.current.reduce((sum, r) => sum + r.y, 0) / smoothingRef.current.length;
          const avgWidth = smoothingRef.current.reduce((sum, r) => sum + r.width, 0) / smoothingRef.current.length;
          const avgHeight = smoothingRef.current.reduce((sum, r) => sum + r.height, 0) / smoothingRef.current.length;
          const avgConfidence = smoothingRef.current.reduce((sum, r) => sum + r.confidence, 0) / smoothingRef.current.length;
          
          const smoothedRacket = {
            x: avgX,
            y: avgY,
            width: avgWidth,
            height: avgHeight,
            confidence: avgConfidence
          };
          
          setRacketBox(smoothedRacket);
          console.log('Racket detected and smoothed:', smoothedRacket);
        }
      } else {
        // Clear detection if no racket found
        if (smoothingRef.current.length > 0) {
          smoothingRef.current = [];
          setRacketBox(null);
        }
      }
    };

    // Run detection at 10 FPS
    const interval = setInterval(detectRacket, 100);

    return () => {
      clearInterval(interval);
    };
  }, [videoRef, playerBounds, pose]);

  return { racketBox, isLoading };
};
