
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

      // Primary: Use pose data for racket detection
      if (pose && pose.landmarks && pose.landmarks.length >= 17) {
        const rightWrist = pose.landmarks[16]; // Right wrist
        const rightElbow = pose.landmarks[14]; // Right elbow
        const rightShoulder = pose.landmarks[12]; // Right shoulder
        
        if (rightWrist && rightElbow && rightWrist.visibility > 0.3) {
          console.log('Detecting racket from pose - Wrist:', rightWrist, 'Elbow:', rightElbow);
          
          // Calculate racket position extending from wrist
          const wristToElbow = {
            x: rightWrist.x - rightElbow.x,
            y: rightWrist.y - rightElbow.y
          };
          
          // Extend racket from wrist in the direction opposite to elbow
          const racketX = rightWrist.x + wristToElbow.x * 0.3;
          const racketY = rightWrist.y + wristToElbow.y * 0.3;
          
          racketDetection = {
            x: Math.max(0, Math.min(0.9, racketX - 0.05)),
            y: Math.max(0, Math.min(0.9, racketY - 0.08)),
            width: 0.08,
            height: 0.12,
            confidence: Math.min(0.95, rightWrist.visibility + 0.2)
          };
        }
        // Fallback to left hand if right hand not visible
        else {
          const leftWrist = pose.landmarks[15]; // Left wrist
          const leftElbow = pose.landmarks[13]; // Left elbow
          
          if (leftWrist && leftElbow && leftWrist.visibility > 0.3) {
            console.log('Using left hand for racket detection');
            
            const wristToElbow = {
              x: leftWrist.x - leftElbow.x,
              y: leftWrist.y - leftElbow.y
            };
            
            const racketX = leftWrist.x + wristToElbow.x * 0.3;
            const racketY = leftWrist.y + wristToElbow.y * 0.3;
            
            racketDetection = {
              x: Math.max(0, Math.min(0.9, racketX - 0.05)),
              y: Math.max(0, Math.min(0.9, racketY - 0.08)),
              width: 0.08,
              height: 0.12,
              confidence: Math.min(0.85, leftWrist.visibility + 0.1)
            };
          }
        }
      }

      // Secondary: Use player bounds if no pose
      if (!racketDetection && playerBounds && playerBounds.confidence > 0.5) {
        console.log('Using player bounds for racket detection fallback');
        racketDetection = {
          x: playerBounds.x + playerBounds.width * 0.6,
          y: playerBounds.y + playerBounds.height * 0.3,
          width: playerBounds.width * 0.25,
          height: playerBounds.height * 0.3,
          confidence: 0.6
        };
      }

      // Apply smoothing
      if (racketDetection) {
        smoothingRef.current.push(racketDetection);
        if (smoothingRef.current.length > 5) {
          smoothingRef.current.shift();
        }
        
        // Average recent detections
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
      } else {
        // Clear smoothing if no detection
        if (smoothingRef.current.length > 0) {
          smoothingRef.current = [];
          setRacketBox(null);
        }
      }
    };

    // Run detection at 15 FPS
    const interval = setInterval(detectRacket, 66);

    return () => {
      clearInterval(interval);
    };
  }, [videoRef, playerBounds, pose]);

  return { racketBox, isLoading };
};
