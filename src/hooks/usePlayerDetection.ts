
import { useState, useEffect } from 'react';
import { useBallDetection } from './useBallDetection';

interface PlayerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const usePlayerDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [playerBounds, setPlayerBounds] = useState<PlayerBounds | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { ballDetection } = useBallDetection(videoRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const detectPlayer = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        // Create a stable player region
        const bounds = {
          x: 0.2,
          y: 0.1,
          width: 0.6,
          height: 0.8,
          confidence: 0.9
        };
        
        setPlayerBounds(bounds);
        setIsAnalyzing(true);
        console.log('Player bounds set:', bounds);
      }
    };

    // Initial detection
    if (video.readyState >= 2) {
      detectPlayer();
    } else {
      video.addEventListener('loadeddata', detectPlayer);
    }

    return () => {
      video.removeEventListener('loadeddata', detectPlayer);
    };
  }, [videoRef]);

  return { 
    playerBounds, 
    ballDetection, 
    isAnalyzing 
  };
};
