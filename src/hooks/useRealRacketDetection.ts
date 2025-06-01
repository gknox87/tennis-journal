
import { useState, useEffect, useRef } from 'react';

interface RacketDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const useRealRacketDetection = (videoRef: React.RefObject<HTMLVideoElement>, playerRegion?: any) => {
  const [racketBox, setRacketBox] = useState<RacketDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>();
  const animationFrameRef = useRef<number>();
  const lastDetectionRef = useRef<number>(0);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const detectRealRacket = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(detectRealRacket);
        return;
      }

      const now = performance.now();
      if (now - lastDetectionRef.current < 33) { // 30 FPS
        animationFrameRef.current = requestAnimationFrame(detectRealRacket);
        return;
      }
      lastDetectionRef.current = now;

      try {
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
        const racketDetection = detectRacketFromPixels(imageData.data, canvas.width, canvas.height);
        
        if (racketDetection && racketDetection.confidence > 0.6) {
          setRacketBox(racketDetection);
          console.log('Real racket detected:', racketDetection);
        } else {
          setRacketBox(null);
        }
      } catch (error) {
        console.error('Real racket detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectRealRacket);
    };

    detectRealRacket();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef, playerRegion]);

  const detectRacketFromPixels = (data: Uint8ClampedArray, width: number, height: number): RacketDetection | null => {
    const racketRegions: Array<{x: number, y: number, score: number}> = [];
    
    // Focus search area around player if detected
    let searchStartX = 0, searchEndX = width;
    let searchStartY = 0, searchEndY = height;
    
    if (playerRegion && playerRegion.confidence > 0.5) {
      const px = playerRegion.centerX * width;
      const py = playerRegion.centerY * height;
      const pw = playerRegion.width * width;
      const ph = playerRegion.height * height;
      
      searchStartX = Math.max(0, px - pw);
      searchEndX = Math.min(width, px + pw);
      searchStartY = Math.max(0, py - ph * 0.5);
      searchEndY = Math.min(height, py + ph * 0.5);
    }
    
    // Scan for racket-like patterns in the focused area
    for (let y = searchStartY; y < searchEndY; y += 3) {
      for (let x = searchStartX; x < searchEndX; x += 3) {
        const score = analyzeRacketPattern(data, x, y, width, height);
        
        if (score > 0.7) {
          racketRegions.push({x, y, score});
        }
      }
    }

    if (racketRegions.length > 0) {
      // Find the best candidate and cluster nearby detections
      const clusters = clusterRacketDetections(racketRegions, 30);
      const bestCluster = clusters.reduce((best, current) => 
        current.length > best.length ? current : best, []);
      
      if (bestCluster.length > 0) {
        const centerX = bestCluster.reduce((sum, r) => sum + r.x, 0) / bestCluster.length;
        const centerY = bestCluster.reduce((sum, r) => sum + r.y, 0) / bestCluster.length;
        const avgScore = bestCluster.reduce((sum, r) => sum + r.score, 0) / bestCluster.length;
        
        return {
          x: (centerX - 25) / width,
          y: (centerY - 35) / height,
          width: 50 / width,
          height: 70 / height,
          confidence: Math.min(0.95, avgScore)
        };
      }
    }

    return null;
  };

  const analyzeRacketPattern = (data: Uint8ClampedArray, centerX: number, centerY: number, width: number, height: number): number => {
    let racketScore = 0;
    let totalChecks = 0;
    
    // Check for racket patterns in a focused region
    for (let dy = -25; dy <= 25; dy += 2) {
      for (let dx = -15; dx <= 15; dx += 2) {
        const x = centerX + dx;
        const y = centerY + dy;
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const i = (y * width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Check for racket frame (dark edges)
          if (isRacketFrame(r, g, b)) {
            racketScore += 1.5;
          }
          
          // Check for strings (bright patterns)
          if (isRacketString(r, g, b)) {
            racketScore += 1.2;
          }
          
          // Check for handle grip
          if (isRacketHandle(r, g, b)) {
            racketScore += 1.0;
          }
          
          totalChecks++;
        }
      }
    }
    
    return totalChecks > 0 ? racketScore / totalChecks : 0;
  };

  const isRacketFrame = (r: number, g: number, b: number): boolean => {
    const brightness = (r + g + b) / 3;
    const contrast = Math.max(r, g, b) - Math.min(r, g, b);
    // Dark frame with good contrast
    return brightness < 100 && contrast > 20;
  };

  const isRacketString = (r: number, g: number, b: number): boolean => {
    const brightness = (r + g + b) / 3;
    // Bright strings (white or yellow)
    return brightness > 160 && (
      (r > 180 && g > 180 && b > 180) || // White
      (g > 150 && r > 120 && b < 120)    // Yellow
    );
  };

  const isRacketHandle = (r: number, g: number, b: number): boolean => {
    const brightness = (r + g + b) / 3;
    // Handle colors (usually dark or colored grip tape)
    return brightness < 120 && brightness > 30;
  };

  const clusterRacketDetections = (detections: Array<{x: number, y: number, score: number}>, maxDistance: number) => {
    const clusters: Array<Array<{x: number, y: number, score: number}>> = [];
    const visited = new Set<number>();
    
    for (let i = 0; i < detections.length; i++) {
      if (visited.has(i)) continue;
      
      const cluster = [detections[i]];
      visited.add(i);
      
      for (let j = i + 1; j < detections.length; j++) {
        if (visited.has(j)) continue;
        
        const distance = Math.sqrt(
          Math.pow(detections[i].x - detections[j].x, 2) + 
          Math.pow(detections[i].y - detections[j].y, 2)
        );
        
        if (distance <= maxDistance) {
          cluster.push(detections[j]);
          visited.add(j);
        }
      }
      
      clusters.push(cluster);
    }
    
    return clusters;
  };

  return { racketBox, isLoading };
};
