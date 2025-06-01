
import { useState, useEffect, useRef } from 'react';

interface PlayerBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface BallDetection {
  x: number;
  y: number;
  radius: number;
  confidence: number;
}

export const usePlayerDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [playerBounds, setPlayerBounds] = useState<PlayerBounds | null>(null);
  const [ballDetection, setBallDetection] = useState<BallDetection | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>();
  const animationFrameRef = useRef<number>();

  const analyzeFrame = () => {
    const video = videoRef.current;
    if (!video || video.paused || video.ended || !video.videoWidth || !video.videoHeight) {
      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }

    try {
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

      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Enhanced player detection
      const playerDetection = detectPlayer(data, canvas.width, canvas.height);
      if (playerDetection) {
        setPlayerBounds(playerDetection);
        console.log('Player detected:', playerDetection);
      }

      // Ball detection
      const ballDetection = detectBall(data, canvas.width, canvas.height);
      if (ballDetection) {
        setBallDetection(ballDetection);
        console.log('Ball detected:', ballDetection);
      }

    } catch (error) {
      console.error('Frame analysis error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(analyzeFrame);
  };

  const detectPlayer = (data: Uint8ClampedArray, width: number, height: number): PlayerBounds | null => {
    const playerRegions: Array<{x: number, y: number, weight: number}> = [];
    
    // Multi-pass detection for better accuracy
    for (let y = 0; y < height; y += 6) {
      for (let x = 0; x < width; x += 6) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        let weight = 0;
        
        // Detect skin tones (higher weight)
        if (isSkinTone(r, g, b)) {
          weight += 3;
        }
        
        // Detect tennis clothing (white/bright colors)
        if (isTennisClothing(r, g, b)) {
          weight += 2;
        }
        
        // Detect hair colors
        if (isHairColor(r, g, b)) {
          weight += 1;
        }
        
        if (weight > 0) {
          playerRegions.push({x, y, weight});
        }
      }
    }

    if (playerRegions.length > 20) {
      // Cluster detection - find main player cluster
      const clusters = clusterRegions(playerRegions, width * 0.1);
      const mainCluster = clusters.reduce((largest, current) => 
        current.length > largest.length ? current : largest, []);
      
      if (mainCluster.length > 15) {
        const bounds = getBoundingBox(mainCluster);
        
        // Validate player dimensions
        if (bounds && bounds.width > width * 0.08 && bounds.height > height * 0.2) {
          const confidence = Math.min(0.95, mainCluster.length / 50);
          
          return {
            x: bounds.x / width,
            y: bounds.y / height,
            width: bounds.width / width,
            height: bounds.height / height,
            confidence
          };
        }
      }
    }

    return null;
  };

  const detectBall = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    const ballCandidates: Array<{x: number, y: number, score: number}> = [];
    
    // Look for tennis ball (bright yellow/green, circular)
    for (let y = 5; y < height - 5; y += 4) {
      for (let x = 5; x < width - 5; x += 4) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isTennisBallColor(r, g, b)) {
          const circularityScore = checkCircularity(data, x, y, width, height, 4);
          if (circularityScore > 0.7) {
            ballCandidates.push({x, y, score: circularityScore});
          }
        }
      }
    }

    if (ballCandidates.length > 0) {
      const bestCandidate = ballCandidates.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      return {
        x: bestCandidate.x / width,
        y: bestCandidate.y / height,
        radius: 0.015,
        confidence: bestCandidate.score
      };
    }

    return null;
  };

  const isSkinTone = (r: number, g: number, b: number): boolean => {
    return r > 95 && g > 40 && b > 20 && 
           Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
           Math.abs(r - g) > 15 && r > g && r > b;
  };

  const isTennisClothing = (r: number, g: number, b: number): boolean => {
    // White tennis attire
    const isWhite = r > 170 && g > 170 && b > 170 && Math.abs(r - g) < 30;
    // Bright colored tennis wear
    const isBright = Math.max(r, g, b) > 180 && (r + g + b) > 450;
    return isWhite || isBright;
  };

  const isHairColor = (r: number, g: number, b: number): boolean => {
    // Various hair colors
    const isDark = r < 80 && g < 80 && b < 80;
    const isBrown = r > 60 && r < 150 && g > 40 && g < 120 && b > 20 && b < 100;
    const isBlonde = r > 150 && g > 120 && b > 80 && r > g && g > b;
    return isDark || isBrown || isBlonde;
  };

  const isTennisBallColor = (r: number, g: number, b: number): boolean => {
    // Tennis ball fluorescent yellow-green
    return g > 180 && r > 120 && r < 255 && b < 120 && g > r * 0.9;
  };

  const checkCircularity = (data: Uint8ClampedArray, cx: number, cy: number, width: number, height: number, radius: number): number => {
    let circularPixels = 0;
    let totalPixels = 0;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (isTennisBallColor(r, g, b)) {
              circularPixels++;
            }
            totalPixels++;
          }
        }
      }
    }
    
    return totalPixels > 0 ? circularPixels / totalPixels : 0;
  };

  const clusterRegions = (regions: Array<{x: number, y: number, weight: number}>, maxDistance: number) => {
    const clusters: Array<Array<{x: number, y: number, weight: number}>> = [];
    const visited = new Set<number>();
    
    for (let i = 0; i < regions.length; i++) {
      if (visited.has(i)) continue;
      
      const cluster = [regions[i]];
      visited.add(i);
      
      for (let j = i + 1; j < regions.length; j++) {
        if (visited.has(j)) continue;
        
        const distance = Math.sqrt(
          Math.pow(regions[i].x - regions[j].x, 2) + 
          Math.pow(regions[i].y - regions[j].y, 2)
        );
        
        if (distance <= maxDistance) {
          cluster.push(regions[j]);
          visited.add(j);
        }
      }
      
      clusters.push(cluster);
    }
    
    return clusters;
  };

  const getBoundingBox = (points: Array<{x: number, y: number}>) => {
    if (points.length === 0) return null;
    
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;
    
    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  useEffect(() => {
    if (videoRef.current) {
      setIsAnalyzing(true);
      analyzeFrame();
    }

    return () => {
      setIsAnalyzing(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef]);

  return { 
    playerBounds, 
    ballDetection, 
    isAnalyzing 
  };
};
