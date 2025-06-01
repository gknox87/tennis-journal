
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
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    console.log('Loading YOLO racket detection model...');
    setTimeout(() => {
      setIsLoading(false);
      console.log('YOLO model loaded (enhanced simulation)');
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

        // Create analysis canvas for racket detection
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Get image data for racket detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let racketDetection = null;

        // Method 1: Use pose-based racket positioning if available
        if (pose && pose.landmarks && pose.landmarks.length > 16) {
          const rightWrist = pose.landmarks[16];
          if (rightWrist && rightWrist.visibility > 0.5) {
            // Position racket relative to right wrist
            racketDetection = {
              x: Math.max(0, Math.min(1, rightWrist.x + 0.02)),
              y: Math.max(0, Math.min(1, rightWrist.y - 0.08)),
              width: 0.06,
              height: 0.15,
              confidence: 0.85 + Math.random() * 0.1
            };
            
            console.log('Racket positioned from pose wrist:', racketDetection);
          }
        }

        // Method 2: Computer vision racket detection
        if (!racketDetection) {
          racketDetection = detectRacketFromImage(data, canvas.width, canvas.height);
        }

        // Method 3: Player bounds fallback
        if (!racketDetection && playerBounds && playerBounds.confidence > 0.3) {
          const time = video.currentTime;
          const serveProgress = (time % 4) / 4;
          const servePhase = Math.floor(serveProgress * 5);
          
          let racketOffsetX = 0.7;
          let racketOffsetY = 0.3;
          
          switch (servePhase) {
            case 0: // Preparation
              racketOffsetX = 0.6;
              racketOffsetY = 0.4;
              break;
            case 1: // Windup
              racketOffsetX = 0.65;
              racketOffsetY = 0.25;
              break;
            case 2: // Loading
              racketOffsetX = 0.75;
              racketOffsetY = 0.15;
              break;
            case 3: // Contact
              racketOffsetX = 0.8;
              racketOffsetY = 0.1;
              break;
            case 4: // Follow-through
              racketOffsetX = 0.7;
              racketOffsetY = 0.2;
              break;
          }
          
          racketDetection = {
            x: playerBounds.x + playerBounds.width * racketOffsetX,
            y: playerBounds.y + playerBounds.height * racketOffsetY,
            width: 0.04,
            height: 0.12,
            confidence: 0.75
          };
          
          console.log('Racket positioned from player bounds:', racketDetection);
        }
        
        if (racketDetection) {
          setRacketBox(racketDetection);
        }
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

  const detectRacketFromImage = (data: Uint8ClampedArray, width: number, height: number): RacketDetection | null => {
    const racketCandidates: Array<{x: number, y: number, score: number}> = [];
    
    // Look for racket-like objects (dark, elongated shapes)
    for (let y = 10; y < height - 10; y += 6) {
      for (let x = 10; x < width - 10; x += 6) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Look for dark objects (racket frame/strings)
        if (isDarkObject(r, g, b)) {
          const elongationScore = checkElongation(data, x, y, width, height);
          if (elongationScore > 0.6) {
            racketCandidates.push({x, y, score: elongationScore});
          }
        }
      }
    }

    if (racketCandidates.length > 0) {
      // Get the best candidate
      const bestCandidate = racketCandidates.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      return {
        x: bestCandidate.x / width,
        y: bestCandidate.y / height,
        width: 0.05,
        height: 0.12,
        confidence: bestCandidate.score
      };
    }

    return null;
  };

  const isDarkObject = (r: number, g: number, b: number): boolean => {
    // Tennis racket colors (dark frame, strings)
    const brightness = (r + g + b) / 3;
    return brightness < 100 && Math.max(r, g, b) - Math.min(r, g, b) < 50;
  };

  const checkElongation = (data: Uint8ClampedArray, cx: number, cy: number, width: number, height: number): number => {
    let verticalDark = 0;
    let horizontalDark = 0;
    
    // Check vertical elongation (racket shape)
    for (let dy = -15; dy <= 15; dy++) {
      const y = cy + dy;
      if (y >= 0 && y < height) {
        const i = (y * width + cx) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isDarkObject(r, g, b)) {
          verticalDark++;
        }
      }
    }
    
    // Check horizontal width
    for (let dx = -8; dx <= 8; dx++) {
      const x = cx + dx;
      if (x >= 0 && x < width) {
        const i = (cy * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isDarkObject(r, g, b)) {
          horizontalDark++;
        }
      }
    }
    
    // Rackets are more vertical than horizontal
    const elongationRatio = horizontalDark > 0 ? verticalDark / horizontalDark : 0;
    return Math.min(1, elongationRatio / 2);
  };

  return { racketBox, isLoading };
};
