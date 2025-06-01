
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
  const [isLoading, setIsLoading] = useState(true);
  const lastDetectionRef = useRef<number>(0);
  const stableDetectionRef = useRef<RacketDetection | null>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const detectRacket = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth || !video.videoHeight) {
        requestAnimationFrame(detectRacket);
        return;
      }

      const now = performance.now();
      if (now - lastDetectionRef.current < 150) { // 6-7 FPS for stability
        requestAnimationFrame(detectRacket);
        return;
      }
      lastDetectionRef.current = now;

      try {
        let racketDetection: RacketDetection | null = null;

        // Primary: Use pose data for stable racket position
        if (pose && pose.landmarks && pose.landmarks.length >= 17) {
          const rightWrist = pose.landmarks[16];
          const rightElbow = pose.landmarks[14];
          
          if (rightWrist && rightElbow && rightWrist.visibility > 0.5) {
            const wristX = rightWrist.x;
            const wristY = rightWrist.y;
            const elbowX = rightElbow.x;
            const elbowY = rightElbow.y;
            
            // Calculate stable racket position
            const dx = wristX - elbowX;
            const dy = wristY - elbowY;
            const racketX = wristX + dx * 0.25;
            const racketY = wristY + dy * 0.25;
            
            racketDetection = {
              x: Math.max(0, Math.min(1, racketX - 0.04)),
              y: Math.max(0, Math.min(1, racketY - 0.06)),
              width: 0.08,
              height: 0.12,
              confidence: Math.min(0.9, rightWrist.visibility * 1.1)
            };
          }
        }

        // Fallback: Use player bounds for racket estimation
        if (!racketDetection && playerBounds && playerBounds.confidence > 0.5) {
          racketDetection = {
            x: playerBounds.x + playerBounds.width * 0.65,
            y: playerBounds.y + playerBounds.height * 0.25,
            width: playerBounds.width * 0.25,
            height: playerBounds.height * 0.3,
            confidence: playerBounds.confidence * 0.8
          };
        }

        // Smooth detection to prevent flickering
        if (racketDetection) {
          if (stableDetectionRef.current) {
            // Smooth transition between detections
            const smoothFactor = 0.7;
            racketDetection = {
              x: stableDetectionRef.current.x * smoothFactor + racketDetection.x * (1 - smoothFactor),
              y: stableDetectionRef.current.y * smoothFactor + racketDetection.y * (1 - smoothFactor),
              width: stableDetectionRef.current.width * smoothFactor + racketDetection.width * (1 - smoothFactor),
              height: stableDetectionRef.current.height * smoothFactor + racketDetection.height * (1 - smoothFactor),
              confidence: Math.max(stableDetectionRef.current.confidence, racketDetection.confidence)
            };
          }
          stableDetectionRef.current = racketDetection;
        }

        setRacketBox(racketDetection);
      } catch (error) {
        console.error('Racket detection error:', error);
      }

      requestAnimationFrame(detectRacket);
    };

    detectRacket();

    return () => {
      // Cleanup handled by requestAnimationFrame
    };
  }, [videoRef, playerBounds, pose]);

  return { racketBox, isLoading };
};
