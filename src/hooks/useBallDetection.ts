
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
      // Process every 3rd frame for better performance
      if (frameCountRef.current % 3 !== 0) {
        return;
      }

      try {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use smaller canvas for processing to improve accuracy
        const scale = Math.min(320 / video.videoWidth, 240 / video.videoHeight);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const ball = findTennisBall(imageData.data, canvas.width, canvas.height);
        
        if (ball && ball.confidence > 0.6) {
          // Add to history for validation
          detectionHistoryRef.current.push(ball);
          if (detectionHistoryRef.current.length > 3) {
            detectionHistoryRef.current.shift();
          }
          
          // Only show detection if it's consistent
          if (detectionHistoryRef.current.length >= 2) {
            const validatedBall = validateBallDetection(detectionHistoryRef.current);
            if (validatedBall) {
              setBallDetection(validatedBall);
              console.log('Valid ball detected:', validatedBall);
            }
          }
        } else {
          // Clear detection if no valid ball found
          if (detectionHistoryRef.current.length > 0) {
            detectionHistoryRef.current = [];
            setBallDetection(null);
          }
        }
      } catch (error) {
        console.error('Ball detection error:', error);
      }
    };

    // Run ball detection at 10 FPS for better accuracy
    const interval = setInterval(detectBall, 100);

    return () => {
      clearInterval(interval);
    };
  }, [videoRef]);

  const findTennisBall = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    const candidates: Array<{x: number, y: number, score: number, radius: number}> = [];
    
    // Focus on upper portion of the frame where tennis balls are more likely to be
    const startY = Math.floor(height * 0.1);
    const endY = Math.floor(height * 0.8);
    const startX = Math.floor(width * 0.1);
    const endX = Math.floor(width * 0.9);
    
    // Scan for tennis ball colors with strict criteria
    for (let y = startY; y < endY; y += 4) {
      for (let x = startX; x < endX; x += 4) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Very strict tennis ball color detection
        const isTennisBallColor = (
          // Bright yellow-green tennis ball (more restrictive)
          (g > 180 && r > 160 && r < 220 && b < 80 && 
           Math.abs(g - r) < 30 && (g - b) > 100 && (r - b) > 80) ||
          // Fluorescent yellow (very bright)
          (g > 200 && r > 180 && b < 60 && g > r && (g - r) < 20)
        );
        
        if (isTennisBallColor) {
          // Check for circular pattern with strict size constraints
          const circularData = analyzeCircularRegion(data, x, y, width, height);
          if (circularData.score > 0.4 && circularData.estimatedRadius >= 3 && circularData.estimatedRadius <= 12) {
            candidates.push({
              x: x / width,
              y: y / height,
              score: circularData.score,
              radius: circularData.estimatedRadius
            });
          }
        }
      }
    }
    
    if (candidates.length > 0) {
      // Filter candidates by clustering nearby detections
      const filteredCandidates = clusterAndFilterCandidates(candidates);
      
      if (filteredCandidates.length > 0) {
        // Find best candidate with size and position validation
        const best = filteredCandidates.reduce((max, current) => {
          // Prefer candidates with appropriate size for tennis balls
          const sizeScore = (current.radius >= 4 && current.radius <= 10) ? 0.3 : 0;
          // Prefer candidates in reasonable court positions (not edges)
          const positionScore = (current.x > 0.15 && current.x < 0.85 && current.y > 0.15 && current.y < 0.75) ? 0.2 : 0;
          const totalScore = current.score + sizeScore + positionScore;
          
          const maxSizeScore = (max.radius >= 4 && max.radius <= 10) ? 0.3 : 0;
          const maxPositionScore = (max.x > 0.15 && max.x < 0.85 && max.y > 0.15 && max.y < 0.75) ? 0.2 : 0;
          const maxTotalScore = max.score + maxSizeScore + maxPositionScore;
          
          return totalScore > maxTotalScore ? current : max;
        });
        
        // Only return if confidence is high enough
        if (best.score + (best.radius >= 4 && best.radius <= 10 ? 0.3 : 0) > 0.6) {
          return {
            x: best.x,
            y: best.y,
            radius: Math.max(0.01, Math.min(0.03, best.radius / Math.min(width, height))),
            confidence: Math.min(0.95, best.score + 0.1)
          };
        }
      }
    }
    
    return null;
  };

  const analyzeCircularRegion = (data: Uint8ClampedArray, centerX: number, centerY: number, width: number, height: number) => {
    let yellowPixels = 0;
    let totalPixels = 0;
    let edgeConsistency = 0;
    
    const minRadius = 3;
    const maxRadius = 12;
    
    // Check multiple radius levels for circular consistency
    for (let radius = minRadius; radius <= maxRadius; radius += 2) {
      let circleYellowPixels = 0;
      let circlePixels = 0;
      
      // Sample points around the circle
      const samples = Math.max(8, radius * 2);
      for (let i = 0; i < samples; i++) {
        const angle = (i / samples) * 2 * Math.PI;
        const x = Math.round(centerX + radius * Math.cos(angle));
        const y = Math.round(centerY + radius * Math.sin(angle));
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          circlePixels++;
          totalPixels++;
          
          // Strict tennis ball color check
          if (g > 170 && r > 150 && b < 90 && Math.abs(g - r) < 40 && (g - b) > 80) {
            circleYellowPixels++;
            yellowPixels++;
          }
        }
      }
      
      // Check for consistent circular edge
      if (circlePixels > 0) {
        const yellowRatio = circleYellowPixels / circlePixels;
        if (yellowRatio > 0.6) {
          edgeConsistency += yellowRatio;
        }
      }
    }
    
    const yellowRatio = totalPixels > 0 ? yellowPixels / totalPixels : 0;
    const avgEdgeConsistency = edgeConsistency / ((maxRadius - minRadius) / 2 + 1);
    
    // Require both good color ratio and circular consistency
    const score = (yellowRatio * 0.6) + (avgEdgeConsistency * 0.4);
    
    return {
      score,
      estimatedRadius: (minRadius + maxRadius) / 2
    };
  };

  const clusterAndFilterCandidates = (candidates: Array<{x: number, y: number, score: number, radius: number}>) => {
    const clusters: Array<{x: number, y: number, score: number, radius: number, count: number}> = [];
    const clusterDistance = 0.08; // Increased clustering distance
    
    for (const candidate of candidates) {
      let addedToCluster = false;
      
      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(candidate.x - cluster.x, 2) + Math.pow(candidate.y - cluster.y, 2)
        );
        
        if (distance < clusterDistance) {
          // Add to existing cluster
          cluster.x = (cluster.x * cluster.count + candidate.x) / (cluster.count + 1);
          cluster.y = (cluster.y * cluster.count + candidate.y) / (cluster.count + 1);
          cluster.score = Math.max(cluster.score, candidate.score);
          cluster.radius = (cluster.radius * cluster.count + candidate.radius) / (cluster.count + 1);
          cluster.count++;
          addedToCluster = true;
          break;
        }
      }
      
      if (!addedToCluster) {
        clusters.push({
          x: candidate.x,
          y: candidate.y,
          score: candidate.score,
          radius: candidate.radius,
          count: 1
        });
      }
    }
    
    // Return clusters with at least 2 detections (reduces false positives)
    return clusters.filter(cluster => cluster.count >= 2);
  };

  const validateBallDetection = (history: BallDetection[]): BallDetection | null => {
    if (history.length < 2) return null;
    
    // Check for consistency in position (ball shouldn't jump around too much)
    const avgX = history.reduce((sum, ball) => sum + ball.x, 0) / history.length;
    const avgY = history.reduce((sum, ball) => sum + ball.y, 0) / history.length;
    const avgRadius = history.reduce((sum, ball) => sum + ball.radius, 0) / history.length;
    const avgConfidence = history.reduce((sum, ball) => sum + ball.confidence, 0) / history.length;
    
    // Check if detections are reasonably consistent
    const maxVariation = 0.05; // 5% of screen
    const isConsistent = history.every(ball => 
      Math.abs(ball.x - avgX) < maxVariation && 
      Math.abs(ball.y - avgY) < maxVariation
    );
    
    if (isConsistent && avgConfidence > 0.6) {
      return {
        x: avgX,
        y: avgY,
        radius: avgRadius,
        confidence: Math.min(0.95, avgConfidence)
      };
    }
    
    return null;
  };

  return { ballDetection, isLoading };
};
