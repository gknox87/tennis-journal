
import { useState, useEffect } from 'react';

export const useYoloWasm = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [racketBox, setRacketBox] = useState<any>(null);

  useEffect(() => {
    // Mock racket detection for now - in real implementation would use YOLOv8-WASM
    const mockRacketDetection = () => {
      if (!videoRef.current) return;

      // Simulate racket bounding box
      const mockRacket = {
        x: 0.6, // normalized x coordinate
        y: 0.5, // normalized y coordinate
        width: 0.1, // normalized width
        height: 0.2, // normalized height
        confidence: 0.85
      };

      setRacketBox(mockRacket);
    };

    const interval = setInterval(mockRacketDetection, 100);
    return () => clearInterval(interval);
  }, [videoRef]);

  return { racketBox };
};
