
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
  const animationFrameRef = useRef<number>();
  const lastDetectionRef = useRef<number>(0);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const detectRacket = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(detectRacket);
        return;
      }

      const now = performance.now();
      if (now - lastDetectionRef.current < 100) { // 10 FPS for racket detection
        animationFrameRef.current = requestAnimationFrame(detectRacket);
        return;
      }
      lastDetectionRef.current = now;

      try {
        let racketDetection: RacketDetection | null = null;

        // Primary: Use pose data for racket position
        if (pose && pose.landmarks && pose.landmarks.length >= 22) {
          const rightWrist = pose.landmarks[16]; // Right wrist
          const rightElbow = pose.landmarks[14]; // Right elbow
          
          if (rightWrist && rightElbow && rightWrist.visibility > 0.7) {
            // Calculate racket position based on wrist and elbow
            const wristX = rightWrist.x;
            const wristY = rightWrist.y;
            const elbowX = rightElbow.x;
            const elbowY = rightElbow.y;
            
            // Extend from elbow through wrist to estimate racket position
            const dx = wristX - elbowX;
            const dy = wristY - elbowY;
            const racketX = wristX + dx * 0.3;
            const racketY = wristY + dy * 0.3;
            
            racketDetection = {
              x: Math.max(0, Math.min(1, racketX - 0.03)),
              y: Math.max(0, Math.min(1, racketY - 0.05)),
              width: 0.06,
              height: 0.1,
              confidence: rightWrist.visibility * 0.9
            };
            
            console.log('Racket detected via pose analysis:', racketDetection);
          }
        }

        // Fallback: Use player bounds for racket area estimation
        if (!racketDetection && playerBounds && playerBounds.confidence > 0.6) {
          racketDetection = {
            x: playerBounds.x + playerBounds.width * 0.7,
            y: playerBounds.y + playerBounds.height * 0.3,
            width: playerBounds.width * 0.2,
            height: playerBounds.height * 0.25,
            confidence: playerBounds.confidence * 0.7
          };
          
          console.log('Racket estimated via player bounds:', racketDetection);
        }

        setRacketBox(racketDetection);
      } catch (error) {
        console.error('Racket detection error:', error);
        setRacketBox(null);
      }

      animationFrameRef.current = requestAnimationFrame(detectRacket);
    };

    detectRacket();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef, playerBounds, pose]);

  return { racketBox, isLoading };
};
