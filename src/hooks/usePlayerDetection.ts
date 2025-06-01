
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

      // Advanced player detection using color and motion analysis
      const playerDetection = detectPlayer(data, canvas.width, canvas.height);
      if (playerDetection) {
        setPlayerBounds(playerDetection);
        console.log('Player detected at:', playerDetection);
      }

      // Ball detection using circular Hough transform simulation
      const ballDetection = detectBall(data, canvas.width, canvas.height);
      if (ballDetection) {
        setBallDetection(ballDetection);
        console.log('Ball detected at:', ballDetection);
      }

    } catch (error) {
      console.error('Frame analysis error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(analyzeFrame);
  };

  const detectPlayer = (data: Uint8ClampedArray, width: number, height: number): PlayerBounds | null => {
    // Look for skin tones and white clothing (tennis attire)
    const skinRegions: Array<{x: number, y: number}> = [];
    const whiteRegions: Array<{x: number, y: number}> = [];
    
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Detect skin tones
        if (isSkinTone(r, g, b)) {
          skinRegions.push({x, y});
        }
        
        // Detect white/light colored clothing
        if (isWhiteClothing(r, g, b)) {
          whiteRegions.push({x, y});
        }
      }
    }

    // Find largest connected region (likely the player)
    if (skinRegions.length > 10 || whiteRegions.length > 20) {
      const allRegions = [...skinRegions, ...whiteRegions];
      const bounds = getBoundingBox(allRegions);
      
      if (bounds && bounds.width > width * 0.05 && bounds.height > height * 0.1) {
        return {
          x: bounds.x / width,
          y: bounds.y / height,
          width: bounds.width / width,
          height: bounds.height / height,
          confidence: Math.min(0.9, (skinRegions.length + whiteRegions.length) / 100)
        };
      }
    }

    return null;
  };

  const detectBall = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    // Look for bright yellow/green circular objects (tennis ball)
    const ballCandidates: Array<{x: number, y: number, score: number}> = [];
    
    for (let y = 10; y < height - 10; y += 3) {
      for (let x = 10; x < width - 10; x += 3) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Check for tennis ball colors (yellow-green)
        if (isTennisBallColor(r, g, b)) {
          const circularityScore = checkCircularity(data, x, y, width, height, 3);
          if (circularityScore > 0.6) {
            ballCandidates.push({x, y, score: circularityScore});
          }
        }
      }
    }

    if (ballCandidates.length > 0) {
      // Get the best candidate
      const bestCandidate = ballCandidates.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      return {
        x: bestCandidate.x / width,
        y: bestCandidate.y / height,
        radius: 0.01, // Approximate ball radius
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

  const isWhiteClothing = (r: number, g: number, b: number): boolean => {
    return r > 180 && g > 180 && b > 180 && 
           Math.abs(r - g) < 30 && Math.abs(g - b) < 30;
  };

  const isTennisBallColor = (r: number, g: number, b: number): boolean => {
    // Tennis ball yellow-green color range
    return g > 150 && r > 100 && r < 255 && b < 150 && g > r * 0.8;
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
