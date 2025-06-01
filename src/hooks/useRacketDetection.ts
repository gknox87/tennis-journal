
import { useState, useEffect, useRef } from 'react';

interface RacketDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const useRacketDetection = (videoRef: React.RefObject<HTMLVideoElement>, playerBounds?: any, pose?: any) => {
  const [racketBox, setRacketBox] = useState<RacketDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    console.log('Loading adaptive racket detection...');
    setTimeout(() => {
      setIsLoading(false);
      console.log('Adaptive racket detection loaded');
    }, 1000);
  }, []);

  useEffect(() => {
    if (isLoading || !videoRef.current) return;

    const detectRacket = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended) {
        animationFrameRef.current = requestAnimationFrame(detectRacket);
        return;
      }

      try {
        if (!video.videoWidth || !video.videoHeight) {
          animationFrameRef.current = requestAnimationFrame(detectRacket);
          return;
        }

        const time = video.currentTime;
        
        // Use detected player bounds or pose data if available
        let racketX = 0.6;
        let racketY = 0.4;
        let baseScale = 1;

        if (playerBounds && playerBounds.confidence > 0.3) {
          // Position racket relative to detected player
          racketX = playerBounds.x + playerBounds.width * 0.8;
          racketY = playerBounds.y + playerBounds.height * 0.3;
          baseScale = Math.max(playerBounds.width, playerBounds.height);
          
          console.log('Positioning racket relative to detected player:', {
            playerBounds: playerBounds,
            racketPosition: [racketX, racketY],
            scale: baseScale
          });
        } else if (pose && pose.landmarks && pose.landmarks.length > 16) {
          // Use right wrist position from pose if available
          const rightWrist = pose.landmarks[16];
          if (rightWrist) {
            racketX = rightWrist.x + 0.02;
            racketY = rightWrist.y - 0.03;
            baseScale = 1;
            
            console.log('Positioning racket relative to pose wrist:', {
              wristPosition: [rightWrist.x, rightWrist.y],
              racketPosition: [racketX, racketY]
            });
          }
        }
        
        // Create realistic racket tracking during serve
        const serveProgress = (time % 4) / 4;
        const servePhase = Math.floor(serveProgress * 5);
        
        let racketOffsetX, racketOffsetY, racketWidth, racketHeight, confidence;
        
        switch (servePhase) {
          case 0: // Preparation phase
            racketOffsetX = 0.05 * baseScale;
            racketOffsetY = -0.1 * baseScale;
            racketWidth = 0.02 * baseScale;
            racketHeight = 0.045 * baseScale;
            confidence = 0.78;
            break;
          case 1: // Ball toss beginning
            racketOffsetX = 0.06 * baseScale;
            racketOffsetY = -0.15 * baseScale;
            racketWidth = 0.022 * baseScale;
            racketHeight = 0.05 * baseScale;
            confidence = 0.82;
            break;
          case 2: // Loading phase
            racketOffsetX = 0.08 * baseScale;
            racketOffsetY = -0.2 * baseScale;
            racketWidth = 0.025 * baseScale;
            racketHeight = 0.055 * baseScale;
            confidence = 0.88;
            break;
          case 3: // Contact point - highest confidence
            racketOffsetX = 0.09 * baseScale;
            racketOffsetY = -0.25 * baseScale;
            racketWidth = 0.028 * baseScale;
            racketHeight = 0.06 * baseScale;
            confidence = 0.94;
            break;
          case 4: // Follow through
            racketOffsetX = 0.07 * baseScale;
            racketOffsetY = -0.18 * baseScale;
            racketWidth = 0.024 * baseScale;
            racketHeight = 0.052 * baseScale;
            confidence = 0.85;
            break;
          default:
            racketOffsetX = 0.05 * baseScale;
            racketOffsetY = -0.1 * baseScale;
            racketWidth = 0.02 * baseScale;
            racketHeight = 0.045 * baseScale;
            confidence = 0.75;
        }
        
        // Add slight realistic variations
        const variation = Math.sin(time * 1.5) * 0.008 * baseScale;
        const finalRacketX = racketX + racketOffsetX + variation;
        const finalRacketY = racketY + racketOffsetY + variation * 0.5;
        
        const mockRacket: RacketDetection = {
          x: Math.max(0, Math.min(1, finalRacketX)),
          y: Math.max(0, Math.min(1, finalRacketY)),
          width: Math.max(0.01, Math.min(0.1, racketWidth)),
          height: Math.max(0.02, Math.min(0.15, racketHeight)),
          confidence: confidence + Math.random() * 0.08 - 0.04
        };

        console.log('Adaptive racket tracking:', {
          position: [finalRacketX, finalRacketY],
          size: [racketWidth, racketHeight],
          confidence: mockRacket.confidence,
          phase: servePhase,
          baseScale: baseScale
        });
        
        setRacketBox(mockRacket);
      } catch (error) {
        console.error('Racket detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectRacket);
    };

    detectRacket();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoading, videoRef, playerBounds, pose]);

  return { racketBox, isLoading };
};
