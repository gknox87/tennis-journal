
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
  const stableDetectionRef = useRef<RacketDetection | null>(null);

  useEffect(() => {
    const detectRacket = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth) {
        return;
      }

      let racketDetection: RacketDetection | null = null;

      // Use pose data for racket detection
      if (pose && pose.landmarks && pose.landmarks.length >= 17) {
        const rightWrist = pose.landmarks[16]; // Right wrist
        const rightElbow = pose.landmarks[14]; // Right elbow
        
        if (rightWrist && rightElbow && rightWrist.visibility > 0.5) {
          console.log('Racket detected from wrist position:', rightWrist);
          
          // Calculate racket position based on wrist
          const racketX = rightWrist.x - 0.05;
          const racketY = rightWrist.y - 0.08;
          
          racketDetection = {
            x: Math.max(0, Math.min(1, racketX)),
            y: Math.max(0, Math.min(1, racketY)),
            width: 0.1,
            height: 0.15,
            confidence: rightWrist.visibility
          };
        }
      }

      // Fallback to player bounds if no pose
      if (!racketDetection && playerBounds && playerBounds.confidence > 0.5) {
        racketDetection = {
          x: playerBounds.x + playerBounds.width * 0.7,
          y: playerBounds.y + playerBounds.height * 0.2,
          width: playerBounds.width * 0.2,
          height: playerBounds.height * 0.25,
          confidence: 0.7
        };
      }

      if (racketDetection) {
        stableDetectionRef.current = racketDetection;
        setRacketBox(racketDetection);
      }
    };

    // Run detection at a reasonable rate
    const interval = setInterval(detectRacket, 100); // 10 FPS

    return () => {
      clearInterval(interval);
    };
  }, [videoRef, playerBounds, pose]);

  return { racketBox, isLoading };
};
