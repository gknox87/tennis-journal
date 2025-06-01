
import { useState, useEffect, useRef } from 'react';

interface PlayerRegion {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  confidence: number;
  keyPoints: Array<{x: number, y: number, type: string, confidence: number}>;
}

export const useRealPlayerDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [playerRegion, setPlayerRegion] = useState<PlayerRegion | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>();
  const animationFrameRef = useRef<number>();
  const lastAnalysisRef = useRef<number>(0);

  useEffect(() => {
    const detectRealPlayer = () => {
      const video = videoRef.current;
      if (!video || video.paused || video.ended || !video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(detectRealPlayer);
        return;
      }

      const now = performance.now();
      if (now - lastAnalysisRef.current < 33) { // 30 FPS
        animationFrameRef.current = requestAnimationFrame(detectRealPlayer);
        return;
      }
      lastAnalysisRef.current = now;

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
        const playerDetection = analyzeFrameForPlayer(imageData.data, canvas.width, canvas.height);
        
        if (playerDetection && playerDetection.confidence > 0.5) {
          setPlayerRegion(playerDetection);
          console.log('Real player detected:', playerDetection);
        }
      } catch (error) {
        console.error('Real player detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detectRealPlayer);
    };

    detectRealPlayer();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef]);

  const analyzeFrameForPlayer = (data: Uint8ClampedArray, width: number, height: number): PlayerRegion | null => {
    const playerPixels: Array<{x: number, y: number, score: number, type: string}> = [];
    
    // Scan for human features with high precision
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        let score = 0;
        let type = '';
        
        // Detect skin tones with improved accuracy
        if (isSkinTone(r, g, b)) {
          score += 3;
          type = 'skin';
        }
        
        // Detect tennis clothing
        if (isTennisClothing(r, g, b)) {
          score += 2;
          type = 'clothing';
        }
        
        // Detect hair
        if (isHairColor(r, g, b)) {
          score += 1;
          type = 'hair';
        }
        
        if (score > 0) {
          playerPixels.push({x, y, score, type});
        }
      }
    }

    if (playerPixels.length > 50) {
      // Find the main cluster
      const clusters = clusterPixels(playerPixels, width * 0.1);
      const mainCluster = clusters.reduce((largest, current) => 
        current.length > largest.length ? current : largest, []);
      
      if (mainCluster.length > 30) {
        return calculatePlayerRegion(mainCluster, width, height);
      }
    }

    return null;
  };

  const isSkinTone = (r: number, g: number, b: number): boolean => {
    // Enhanced skin detection
    return r > 95 && g > 40 && b > 20 && 
           Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
           Math.abs(r - g) > 15 && r > g && r > b;
  };

  const isTennisClothing = (r: number, g: number, b: number): boolean => {
    // White tennis attire and bright colors
    const brightness = (r + g + b) / 3;
    const isWhite = r > 200 && g > 200 && b > 200;
    const isBright = brightness > 180;
    return isWhite || isBright;
  };

  const isHairColor = (r: number, g: number, b: number): boolean => {
    const brightness = (r + g + b) / 3;
    return brightness < 80 || // Dark hair
           (r > 150 && g > 120 && b > 80); // Light hair
  };

  const clusterPixels = (pixels: Array<{x: number, y: number, score: number, type: string}>, maxDistance: number) => {
    const clusters: Array<Array<{x: number, y: number, score: number, type: string}>> = [];
    const visited = new Set<number>();
    
    for (let i = 0; i < pixels.length; i++) {
      if (visited.has(i)) continue;
      
      const cluster = [pixels[i]];
      visited.add(i);
      
      for (let j = i + 1; j < pixels.length; j++) {
        if (visited.has(j)) continue;
        
        const distance = Math.sqrt(
          Math.pow(pixels[i].x - pixels[j].x, 2) + 
          Math.pow(pixels[i].y - pixels[j].y, 2)
        );
        
        if (distance <= maxDistance) {
          cluster.push(pixels[j]);
          visited.add(j);
        }
      }
      
      clusters.push(cluster);
    }
    
    return clusters;
  };

  const calculatePlayerRegion = (pixels: Array<{x: number, y: number, score: number, type: string}>, width: number, height: number): PlayerRegion => {
    const xs = pixels.map(p => p.x);
    const ys = pixels.map(p => p.y);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const regionWidth = Math.max(width * 0.15, maxX - minX);
    const regionHeight = Math.max(height * 0.4, maxY - minY);
    
    // Generate key points based on detected regions
    const keyPoints = generateKeyPoints(pixels, centerX, centerY, regionWidth, regionHeight);
    
    const avgConfidence = pixels.reduce((sum, p) => sum + p.score, 0) / pixels.length / 3;
    
    return {
      centerX: centerX / width,
      centerY: centerY / height,
      width: regionWidth / width,
      height: regionHeight / height,
      confidence: Math.min(0.95, avgConfidence),
      keyPoints
    };
  };

  const generateKeyPoints = (pixels: Array<{x: number, y: number, score: number, type: string}>, centerX: number, centerY: number, width: number, height: number) => {
    const skinPixels = pixels.filter(p => p.type === 'skin');
    const clothingPixels = pixels.filter(p => p.type === 'clothing');
    
    // Find head region (top skin pixels)
    const headPixels = skinPixels.filter(p => p.y < centerY - height * 0.2);
    const headCenter = headPixels.length > 0 ? 
      { x: headPixels.reduce((sum, p) => sum + p.x, 0) / headPixels.length,
        y: headPixels.reduce((sum, p) => sum + p.y, 0) / headPixels.length } :
      { x: centerX, y: centerY - height * 0.3 };
    
    // Find torso region
    const torsoPixels = clothingPixels.filter(p => 
      p.y > centerY - height * 0.1 && p.y < centerY + height * 0.1
    );
    const torsoCenter = torsoPixels.length > 0 ?
      { x: torsoPixels.reduce((sum, p) => sum + p.x, 0) / torsoPixels.length,
        y: torsoPixels.reduce((sum, p) => sum + p.y, 0) / torsoPixels.length } :
      { x: centerX, y: centerY };
    
    return [
      { x: headCenter.x, y: headCenter.y, type: 'head', confidence: 0.9 },
      { x: torsoCenter.x - width * 0.15, y: torsoCenter.y, type: 'left_shoulder', confidence: 0.8 },
      { x: torsoCenter.x + width * 0.15, y: torsoCenter.y, type: 'right_shoulder', confidence: 0.8 },
      { x: centerX, y: centerY + height * 0.3, type: 'center_hip', confidence: 0.7 }
    ];
  };

  return { playerRegion };
};
