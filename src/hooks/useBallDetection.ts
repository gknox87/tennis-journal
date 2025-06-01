
import { useState, useEffect, useRef } from 'react';

interface BallDetection {
  x: number;
  y: number;
  radius: number;
  confidence: number;
}

export const useBallDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [ballDetection, setBallDetection] = useState<BallDetection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>();
  const detectionHistoryRef = useRef<BallDetection[]>([]);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const detectBall = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth) {
        return;
      }

      frameCountRef.current++;
      // Process every 2nd frame for better performance
      if (frameCountRef.current % 2 !== 0) {
        return;
      }

      try {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use reasonable canvas size for processing
        const scale = Math.min(400 / video.videoWidth, 300 / video.videoHeight);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const ball = findTennisBall(imageData.data, canvas.width, canvas.height);
        
        if (ball && ball.confidence > 0.3) {
          // Add to history for smoothing
          detectionHistoryRef.current.push(ball);
          if (detectionHistoryRef.current.length > 5) {
            detectionHistoryRef.current.shift();
          }
          
          // Apply smoothing
          const smoothedBall = smoothBallDetection(detectionHistoryRef.current);
          setBallDetection(smoothedBall);
          console.log('Ball detected:', smoothedBall);
        } else {
          // Gradually fade detection if no recent ball found
          if (detectionHistoryRef.current.length > 0) {
            detectionHistoryRef.current = detectionHistoryRef.current.slice(-2);
            if (detectionHistoryRef.current.length > 0) {
              const lastBall = detectionHistoryRef.current[detectionHistoryRef.current.length - 1];
              setBallDetection({
                ...lastBall,
                confidence: lastBall.confidence * 0.7
              });
            } else {
              setBallDetection(null);
            }
          }
        }
      } catch (error) {
        console.error('Ball detection error:', error);
      }
    };

    // Run ball detection at 15 FPS
    const interval = setInterval(detectBall, 66);

    return () => {
      clearInterval(interval);
    };
  }, [videoRef]);

  const findTennisBall = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    const candidates: Array<{x: number, y: number, score: number, size: number}> = [];
    
    // Scan for tennis ball colors with improved detection
    for (let y = 10; y < height - 10; y += 3) {
      for (let x = 10; x < width - 10; x += 3) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Enhanced tennis ball color detection
        const isTennisBallColor = (
          // Bright yellow-green tennis ball
          (g > 160 && r > 140 && r < 240 && b < 100 && Math.abs(g - r) < 60) ||
          // Fluorescent yellow
          (g > 180 && r > 170 && b < 120 && g > r) ||
          // Yellow-green spectrum
          (g > 150 && r > 120 && r < 200 && b < 110 && (g - r) > -20 && (g - r) < 40) ||
          // Bright lime/neon colors
          (g > 200 && r > 150 && b < 80)
        );
        
        if (isTennisBallColor) {
          // Check for circular pattern around this point
          const circularData = analyzeCircularRegion(data, x, y, width, height);
          if (circularData.score > 0.25) {
            candidates.push({
              x: x / width,
              y: y / height,
              score: circularData.score,
              size: circularData.estimatedRadius
            });
          }
        }
      }
    }
    
    if (candidates.length > 0) {
      // Filter out candidates that are too close to each other
      const filteredCandidates = filterNearbyDetections(candidates);
      
      if (filteredCandidates.length > 0) {
        // Find best candidate based on score and size
        const best = filteredCandidates.reduce((max, current) => {
          const sizeBonus = (current.size > 2 && current.size < 15) ? 0.2 : 0;
          const totalScore = current.score + sizeBonus;
          const maxSizeBonus = (max.size > 2 && max.size < 15) ? 0.2 : 0;
          const maxTotalScore = max.score + maxSizeBonus;
          return totalScore > maxTotalScore ? current : max;
        });
        
        return {
          x: best.x,
          y: best.y,
          radius: Math.max(0.015, Math.min(0.04, best.size / Math.min(width, height))),
          confidence: Math.min(0.95, best.score + 0.1)
        };
      }
    }
    
    return null;
  };

  const analyzeCircularRegion = (data: Uint8ClampedArray, centerX: number, centerY: number, width: number, height: number) => {
    let yellowPixels = 0;
    let totalPixels = 0;
    let radiusSum = 0;
    let radiusCount = 0;
    
    const maxRadius = 12;
    
    for (let radius = 2; radius <= maxRadius; radius += 2) {
      let circleYellowPixels = 0;
      let circlePixels = 0;
      
      // Check pixels in a circle at this radius
      const angleStep = Math.PI / (radius * 2);
      for (let angle = 0; angle < 2 * Math.PI; angle += angleStep) {
        const x = Math.round(centerX + radius * Math.cos(angle));
        const y = Math.round(centerY + radius * Math.sin(angle));
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const i = (y * width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          circlePixels++;
          totalPixels++;
          
          // Check if this pixel matches tennis ball color
          if (g > 130 && r > 100 && b < 120 && Math.abs(g - r) < 70) {
            circleYellowPixels++;
            yellowPixels++;
          }
        }
      }
      
      // If this radius has a good proportion of yellow pixels, it might be the ball edge
      if (circlePixels > 0 && (circleYellowPixels / circlePixels) > 0.4) {
        radiusSum += radius;
        radiusCount++;
      }
    }
    
    const yellowRatio = totalPixels > 0 ? yellowPixels / totalPixels : 0;
    const estimatedRadius = radiusCount > 0 ? radiusSum / radiusCount : 5;
    
    // Score based on yellow pixel ratio and circular consistency
    const circularScore = radiusCount > 1 ? 0.3 : 0;
    const colorScore = yellowRatio * 0.7;
    
    return {
      score: colorScore + circularScore,
      estimatedRadius
    };
  };

  const filterNearbyDetections = (candidates: Array<{x: number, y: number, score: number, size: number}>) => {
    const filtered = [];
    const minDistance = 0.05; // Minimum distance between detections
    
    for (const candidate of candidates) {
      let tooClose = false;
      for (const existing of filtered) {
        const distance = Math.sqrt(
          Math.pow(candidate.x - existing.x, 2) + Math.pow(candidate.y - existing.y, 2)
        );
        if (distance < minDistance) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) {
        filtered.push(candidate);
      }
    }
    
    return filtered;
  };

  const smoothBallDetection = (history: BallDetection[]): BallDetection => {
    if (history.length === 1) return history[0];
    
    // Use weighted average with more weight on recent detections
    const weights = history.map((_, i) => Math.pow(1.5, i)); // Exponential weighting
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    const x = history.reduce((sum, ball, i) => sum + ball.x * weights[i], 0) / totalWeight;
    const y = history.reduce((sum, ball, i) => sum + ball.y * weights[i], 0) / totalWeight;
    const radius = history.reduce((sum, ball, i) => sum + ball.radius * weights[i], 0) / totalWeight;
    const confidence = history.reduce((sum, ball, i) => sum + ball.confidence * weights[i], 0) / totalWeight;
    
    return { x, y, radius, confidence };
  };

  return { ballDetection, isLoading };
};
