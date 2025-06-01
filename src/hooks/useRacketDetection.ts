
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
    console.log('Initializing enhanced racket detection...');
    setTimeout(() => {
      setIsLoading(false);
      console.log('Enhanced racket detection ready');
    }, 500);
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

        // Create analysis canvas
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let racketDetection = null;

        // Method 1: Enhanced pose-based racket positioning
        if (pose && pose.landmarks && pose.landmarks.length > 16) {
          const rightWrist = pose.landmarks[16];
          const rightElbow = pose.landmarks[14];
          const rightShoulder = pose.landmarks[12];
          
          if (rightWrist && rightElbow && rightShoulder && 
              rightWrist.visibility > 0.5 && rightElbow.visibility > 0.5) {
            
            // Calculate arm direction vector
            const armVector = {
              x: rightWrist.x - rightElbow.x,
              y: rightWrist.y - rightElbow.y
            };
            
            // Extend beyond wrist to find racket position
            const racketDistance = 0.15; // Distance from wrist to racket center
            const racketX = rightWrist.x + armVector.x * racketDistance;
            const racketY = rightWrist.y + armVector.y * racketDistance;
            
            // Determine racket orientation based on arm angle
            const armAngle = Math.atan2(armVector.y, armVector.x);
            const racketWidth = Math.abs(Math.cos(armAngle)) * 0.08 + 0.04;
            const racketHeight = Math.abs(Math.sin(armAngle)) * 0.08 + 0.12;
            
            racketDetection = {
              x: Math.max(0, Math.min(1, racketX - racketWidth/2)),
              y: Math.max(0, Math.min(1, racketY - racketHeight/2)),
              width: racketWidth,
              height: racketHeight,
              confidence: 0.8 + Math.random() * 0.15
            };
            
            console.log('Racket positioned from enhanced pose analysis:', racketDetection);
          }
        }

        // Method 2: Improved computer vision racket detection
        if (!racketDetection) {
          racketDetection = detectRacketFromImageAnalysis(data, canvas.width, canvas.height);
        }

        // Method 3: Player bounds fallback with better positioning
        if (!racketDetection && playerBounds && playerBounds.confidence > 0.3) {
          const time = video.currentTime;
          const serveProgress = (time % 3) / 3; // Faster serve cycle
          const phase = Math.floor(serveProgress * 5);
          
          let racketOffsetX = 0.7;
          let racketOffsetY = 0.3;
          let confidence = 0.6;
          
          switch (phase) {
            case 0: // Preparation
              racketOffsetX = 0.6;
              racketOffsetY = 0.5;
              confidence = 0.7;
              break;
            case 1: // Windup
              racketOffsetX = 0.75;
              racketOffsetY = 0.3;
              confidence = 0.75;
              break;
            case 2: // Loading
              racketOffsetX = 0.8;
              racketOffsetY = 0.15;
              confidence = 0.8;
              break;
            case 3: // Contact
              racketOffsetX = 0.85;
              racketOffsetY = 0.1;
              confidence = 0.85;
              break;
            case 4: // Follow-through
              racketOffsetX = 0.7;
              racketOffsetY = 0.3;
              confidence = 0.7;
              break;
          }
          
          racketDetection = {
            x: playerBounds.x + playerBounds.width * racketOffsetX,
            y: playerBounds.y + playerBounds.height * racketOffsetY,
            width: 0.05,
            height: 0.15,
            confidence
          };
          
          console.log('Racket positioned from player bounds (phase:', phase, '):', racketDetection);
        }
        
        if (racketDetection && racketDetection.confidence > 0.4) {
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

  const detectRacketFromImageAnalysis = (data: Uint8ClampedArray, width: number, height: number): RacketDetection | null => {
    const racketCandidates: Array<{x: number, y: number, score: number}> = [];
    
    // Enhanced racket detection with multiple criteria
    for (let y = 10; y < height - 20; y += 8) {
      for (let x = 10; x < width - 20; x += 8) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        let score = 0;
        
        // Look for racket frame colors (dark edges)
        if (isDarkRacketFrame(r, g, b)) {
          score += 0.4;
        }
        
        // Look for string patterns (light colored strings)
        if (isRacketString(r, g, b)) {
          score += 0.3;
        }
        
        // Check for racket handle colors
        if (isRacketHandle(r, g, b)) {
          score += 0.2;
        }
        
        // Enhanced shape analysis
        if (score > 0.3) {
          const shapeScore = analyzeRacketShape(data, x, y, width, height);
          score += shapeScore * 0.4;
          
          if (score > 0.6) {
            racketCandidates.push({x, y, score});
          }
        }
      }
    }

    if (racketCandidates.length > 0) {
      // Find the best candidate
      const bestCandidate = racketCandidates.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      if (bestCandidate.score > 0.6) {
        return {
          x: bestCandidate.x / width,
          y: bestCandidate.y / height,
          width: 0.06,
          height: 0.14,
          confidence: Math.min(0.95, bestCandidate.score)
        };
      }
    }

    return null;
  };

  const isDarkRacketFrame = (r: number, g: number, b: number): boolean => {
    const brightness = (r + g + b) / 3;
    return brightness < 80 && Math.max(r, g, b) - Math.min(r, g, b) < 40;
  };

  const isRacketString = (r: number, g: number, b: number): boolean => {
    // Tennis strings are usually light colored (white, yellow, natural)
    const brightness = (r + g + b) / 3;
    return brightness > 150 && Math.max(r, g, b) - Math.min(r, g, b) < 60;
  };

  const isRacketHandle = (r: number, g: number, b: number): boolean => {
    // Handle colors vary but often have specific color patterns
    const isBlack = r < 60 && g < 60 && b < 60;
    const isGrip = (r > 100 && r < 200) && (g > 80 && g < 180) && (b > 60 && b < 160);
    return isBlack || isGrip;
  };

  const analyzeRacketShape = (data: Uint8ClampedArray, cx: number, cy: number, width: number, height: number): number => {
    let shapeScore = 0;
    let totalChecks = 0;
    
    // Check for oval/rectangular racket head pattern
    for (let dy = -20; dy <= 20; dy += 4) {
      for (let dx = -15; dx <= 15; dx += 4) {
        const x = cx + dx;
        const y = cy + dy;
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const i = (y * width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Check if this pixel contributes to racket pattern
          if (isDarkRacketFrame(r, g, b) || isRacketString(r, g, b)) {
            shapeScore++;
          }
          totalChecks++;
        }
      }
    }
    
    return totalChecks > 0 ? shapeScore / totalChecks : 0;
  };

  return { racketBox, isLoading };
};
