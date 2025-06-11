import { useState, useEffect, useRef } from 'react';
import { useYoloBallDetection } from './useYoloBallDetection';

interface BallDetection {
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  confidence: number;
  timestamp: number;
  previousPositions?: { x: number; y: number; timestamp: number }[];
}

export const useBallDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [ballDetection, setBallDetection] = useState<BallDetection | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionHistoryRef = useRef<BallDetection[]>([]);
  const colorDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const motionTrailRef = useRef<{ x: number; y: number; timestamp: number }[]>([]);

  // FORCE COLOR DETECTION FOR DEBUGGING - set to true to bypass YOLO
  const FORCE_COLOR_DETECTION = true;
  
  // TEST MODE - creates a fake ball detection to test the drawing pipeline
  const TEST_MODE = true; // TEMPORARILY ENABLED to verify drawing works
  
  // ENHANCED DEBUG MODE - even more aggressive detection for testing
  const ENHANCED_DEBUG = true;

  // Primary YOLO-based detection
  const { 
    ballDetection: yoloBallDetection,
    isLoading: yoloLoading,
    error: yoloError,
    modelLoaded: yoloModelLoaded,
    usingFallback: yoloUsingFallback
  } = useYoloBallDetection(videoRef);

  // Enhanced color-based tennis ball detection with improved algorithm
  const findTennisBallByColor = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    console.log('[BallDetection] Starting color detection on', width, 'x', height, 'image');
    
    const step = ENHANCED_DEBUG ? 2 : 4; // Adaptive step size - smaller for debug mode
    const yellowPixels: { x: number; y: number; intensity: number; confidence: number }[] = [];

    // Enhanced yellow detection with multiple tennis ball color profiles
    const isTennisBallColor = (r: number, g: number, b: number): { isBall: boolean; intensity: number; confidence: number } => {
      // Multiple color profiles for tennis balls
      const brightness = (r + g + b) / 3;
      const saturation = (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(r, g, b, 1);
      
      // Profile 1: Classic bright yellow-green tennis ball (VERY PERMISSIVE)
      const yellowness1 = (r + g) / 2 - b;
      const isYellow1 = r > 60 && g > 60 && b < r * 1.1 && b < g * 1.1 && 
                        yellowness1 > 10 && Math.abs(r - g) < 70 && brightness > 50;
      
      // Profile 2: Slightly greenish tennis ball (VERY PERMISSIVE)
      const isYellow2 = g > r * 0.8 && g > b && g > 70 && r > 40 && b < g * 1.0 && 
                        (g - b) > 10 && brightness > 45;
      
      // Profile 3: Worn/dirty tennis ball (VERY PERMISSIVE)
      const isYellow3 = r > 40 && g > 40 && b < 90 && (r + g) > (b * 1.5) && 
                        brightness > 35 && brightness < 240;
      
      // Profile 4: High contrast/bright lighting (VERY PERMISSIVE)
      const isYellow4 = r > 100 && g > 100 && b < 120 && Math.abs(r - g) < 60 && brightness > 90;
      
      // Profile 5: Low saturation tennis ball (VERY PERMISSIVE)
      const isYellow5 = saturation < 0.4 && brightness > 80 && brightness < 240 && 
                        r > 60 && g > 60 && b < Math.min(r, g) * 1.2;
      
      // Profile 6: EXTREMELY permissive for demo - any yellowish or bright color
      const isYellow6 = (r > 50 && g > 50 && (r + g) > (b * 1.2) && brightness > 35) ||
                        (brightness > 120 && r > 80 && g > 80);
      
      // Profile 7: GREEN-YELLOW tennis ball (common color)
      const isYellow7 = g > 80 && r > 60 && g > r * 0.9 && g > b * 1.2 && brightness > 60;
      
      // Profile 8: ULTRA-PERMISSIVE for debugging - any ball-like color
      const isYellow8 = ENHANCED_DEBUG && (
        (r > 30 && g > 30 && brightness > 25) || // Very low threshold
        (brightness > 100 && (r + g) > b) || // Any bright non-blue
        (g > r * 0.7 && g > b * 0.8 && brightness > 40) // Greenish
      );
      
      let confidence = 0;
      let intensity = 0;
      
      if (isYellow1) {
        confidence = Math.min(0.9, (yellowness1 + brightness/2) / 80);
        intensity = yellowness1 + brightness/2;
      } else if (isYellow2) {
        confidence = Math.min(0.8, (g - b + brightness/3) / 60);
        intensity = (g - b) + brightness/3;
      } else if (isYellow3) {
        confidence = Math.min(0.7, ((r + g - b) + brightness/4) / 90);
        intensity = (r + g - b) + brightness/4;
      } else if (isYellow4) {
        confidence = Math.min(0.85, (brightness + (r + g - b)/2) / 120);
        intensity = brightness + (r + g - b)/2;
      } else if (isYellow5) {
        confidence = Math.min(0.6, (brightness + (r + g - b)/3) / 100);
        intensity = brightness + (r + g - b)/3;
      } else if (isYellow7) {
        confidence = Math.min(0.75, (g + brightness/3) / 100);
        intensity = g + brightness/3;
      } else if (isYellow8) {
        confidence = Math.min(0.4, (brightness + (r + g)/4) / 60);
        intensity = brightness + (r + g)/4;
      } else if (isYellow6) {
        confidence = Math.min(0.5, (brightness + (r + g - b)/4) / 80);
        intensity = brightness + (r + g - b)/4;
      }
      
      return { 
        isBall: confidence > (ENHANCED_DEBUG ? 0.01 : 0.03), // Even lower threshold in debug mode
        intensity, 
        confidence 
      };
    };

    // Find all tennis ball colored pixels with improved search
    let totalPixelsChecked = 0;
    for (let y = step; y < height - step; y += step) {
      for (let x = step; x < width - step; x += step) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        totalPixelsChecked++;

        const colorCheck = isTennisBallColor(r, g, b);
        if (colorCheck.isBall) {
          yellowPixels.push({ 
            x, 
            y, 
            intensity: colorCheck.intensity,
            confidence: colorCheck.confidence
          });
        }
      }
    }

    console.log('[BallDetection] Checked', totalPixelsChecked, 'pixels, found', yellowPixels.length, 'yellow pixels');
    
    if (ENHANCED_DEBUG && yellowPixels.length > 0) {
      console.log('[BallDetection] Sample yellow pixels found:', yellowPixels.slice(0, 3));
    }

    if (yellowPixels.length < 1) { // Accept even 1 pixel for demo
      console.log('[BallDetection] Not enough yellow pixels found');
      return null;
    }

    // Sort by confidence first, then intensity
    yellowPixels.sort((a, b) => (b.confidence * 100 + b.intensity) - (a.confidence * 100 + a.intensity));

    console.log('[BallDetection] Top 5 yellow pixels:', yellowPixels.slice(0, 5));

    // Enhanced clustering with confidence weighting
    const clusters: { 
      x: number; 
      y: number; 
      pixels: number; 
      totalIntensity: number;
      totalConfidence: number;
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
    }[] = [];
    
    const clusterRadius = 30; // Larger radius for better clustering
    const processed = new Set<number>();

    for (let i = 0; i < Math.min(yellowPixels.length, 100); i++) {
      if (processed.has(i)) continue;
      
      const pixel = yellowPixels[i];
      const cluster = {
        x: pixel.x,
        y: pixel.y,
        pixels: 1,
        totalIntensity: pixel.intensity,
        totalConfidence: pixel.confidence,
        minX: pixel.x,
        maxX: pixel.x,
        minY: pixel.y,
        maxY: pixel.y
      };
      processed.add(i);

      // Find nearby pixels within cluster radius
      for (let j = i + 1; j < Math.min(yellowPixels.length, 150); j++) {
        if (processed.has(j)) continue;
        
        const otherPixel = yellowPixels[j];
        const distance = Math.sqrt(
          Math.pow(pixel.x - otherPixel.x, 2) + Math.pow(pixel.y - otherPixel.y, 2)
        );

        if (distance <= clusterRadius) {
          const newPixels = cluster.pixels + 1;
          cluster.x = (cluster.x * cluster.pixels + otherPixel.x) / newPixels;
          cluster.y = (cluster.y * cluster.pixels + otherPixel.y) / newPixels;
          cluster.pixels = newPixels;
          cluster.totalIntensity += otherPixel.intensity;
          cluster.totalConfidence += otherPixel.confidence;
          cluster.minX = Math.min(cluster.minX, otherPixel.x);
          cluster.maxX = Math.max(cluster.maxX, otherPixel.x);
          cluster.minY = Math.min(cluster.minY, otherPixel.y);
          cluster.maxY = Math.max(cluster.maxY, otherPixel.y);
          processed.add(j);
        }
      }

      clusters.push(cluster);
    }

    console.log('[BallDetection] Found', clusters.length, 'clusters');

    if (clusters.length === 0) return null;

    // Enhanced scoring with shape analysis
    const scoredClusters = clusters.map(cluster => {
      const avgIntensity = cluster.totalIntensity / cluster.pixels;
      const avgConfidence = cluster.totalConfidence / cluster.pixels;
      const width = cluster.maxX - cluster.minX;
      const height = cluster.maxY - cluster.minY;
      const aspectRatio = Math.max(width, height) / Math.min(width, height || 1);
      
      // Scoring factors (MORE PERMISSIVE)
      const densityScore = Math.min(cluster.pixels / 10, 1.0); // Lower density requirement
      const intensityScore = Math.min(avgIntensity / 80, 1.0); // Lower intensity requirement
      const confidenceScore = avgConfidence;
      const shapeScore = Math.max(0, 1.5 - (aspectRatio - 1) * 0.3); // More tolerant of non-circular shapes
      const sizeScore = (width >= 1 && width <= 80 && height >= 1 && height <= 80) ? 1.0 : 0.5; // Very permissive size
      
      // Less harsh penalty for small detections
      const sizePenalty = (width < 2 || height < 2) ? 0.3 : 1.0;
      
      const totalScore = densityScore * intensityScore * confidenceScore * shapeScore * sizeScore * sizePenalty;
      
      return { ...cluster, score: totalScore, avgIntensity, avgConfidence };
    });

    // Find the best cluster
    scoredClusters.sort((a, b) => b.score - a.score);
    const bestCluster = scoredClusters[0];

    console.log('[BallDetection] Best cluster:', {
      pixels: bestCluster.pixels,
      score: bestCluster.score,
      avgConfidence: bestCluster.avgConfidence,
      position: { x: bestCluster.x, y: bestCluster.y },
      size: { width: bestCluster.maxX - bestCluster.minX, height: bestCluster.maxY - bestCluster.minY }
    });

    // EXTREMELY lenient threshold for demo
    if (bestCluster.score < 0.005 || bestCluster.pixels < 1) { // Accept almost anything
      console.log('[BallDetection] Best cluster score too low:', bestCluster.score);
      return null;
    }

    const confidence = Math.min(bestCluster.score * 3.0, 0.95); // Much higher boost for demo
    
    const result = {
      x: bestCluster.x / width, // Normalize to 0-1
      y: bestCluster.y / height, // Normalize to 0-1
      confidence,
      timestamp: Date.now()
    };
    
    console.log('[BallDetection] Returning ball detection:', result);
    return result;
  };

  // Optimized color-based detection with motion prediction
  const runColorBasedDetection = () => {
    const video = videoRef.current;
    if (!video) {
      console.log('[BallDetection] No video element');
      return;
    }
    
    console.log('[BallDetection] Video state:', {
      readyState: video.readyState,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      currentTime: video.currentTime,
      paused: video.paused,
      ended: video.ended,
      src: video.src?.substring(0, 50) + '...'
    });
    
    // More permissive video readiness check for uploaded videos
    if (video.readyState < 1) {
      console.log('[BallDetection] Video not ready enough:', video.readyState);
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('[BallDetection] Video has no dimensions, trying with client dimensions');
      
      // Fallback to client dimensions for some video formats
      if (video.clientWidth > 0 && video.clientHeight > 0) {
        console.log('[BallDetection] Using client dimensions:', video.clientWidth, 'x', video.clientHeight);
      } else {
        console.log('[BallDetection] No usable dimensions available');
        return;
      }
    }

    try {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      const canvas = canvasRef.current;
      // Use video dimensions or fallback to client dimensions
      canvas.width = video.videoWidth || video.clientWidth || 640;
      canvas.height = video.videoHeight || video.clientHeight || 480;

      console.log('[BallDetection] Canvas dimensions:', canvas.width, 'x', canvas.height);

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        console.warn('[BallDetection] Canvas 2D context not available');
        return;
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      console.log('[BallDetection] Image data size:', imageData.data.length);
      
      // Sample a few pixels to see what colors we're working with
      const samplePixels = [];
      for (let i = 0; i < Math.min(10, imageData.data.length / 4); i += Math.floor(imageData.data.length / 40)) {
        const index = i * 4;
        samplePixels.push({
          r: imageData.data[index],
          g: imageData.data[index + 1],
          b: imageData.data[index + 2],
          brightness: (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3
        });
      }
      console.log('[BallDetection] Sample pixels from image:', samplePixels);
      
      // First try the main tennis ball detection
      let ball = findTennisBallByColor(imageData.data, canvas.width, canvas.height);
      
      // If no ball found, try a very simple bright spot detection as backup
      if (!ball) {
        console.log('[BallDetection] No tennis ball found, trying bright spot detection');
        ball = findBrightSpot(imageData.data, canvas.width, canvas.height);
      }
      
      // ULTRA-FALLBACK: If still no ball in enhanced debug mode, create a detection for ANY bright area
      if (!ball && ENHANCED_DEBUG) {
        console.log('[BallDetection] ULTRA-FALLBACK: Looking for any bright area in center region');
        ball = findAnyBrightArea(imageData.data, canvas.width, canvas.height);
      }
      
      console.log('[BallDetection] Final ball detection result:', ball);
      
      if (ball && ball.confidence > (ENHANCED_DEBUG ? 0.001 : 0.01)) { // Accept almost any detection
        console.log('[BallDetection] Ball found with confidence:', ball.confidence);
        
        // OVERRIDE: For demo purposes, accept any detection above 0.01 (1%)
        const isValidDetection = ball.confidence > (ENHANCED_DEBUG ? 0.001 : 0.005); // Even more permissive in debug mode
        
        if (isValidDetection) {
          console.log('[BallDetection] ACCEPTING detection with confidence:', ball.confidence);
          
          // Add to history for smoothing and prediction
          detectionHistoryRef.current.push(ball);
          if (detectionHistoryRef.current.length > 5) { // Keep more history for better smoothing
            detectionHistoryRef.current.shift();
          }

          // Use smoothed position with motion prediction
          if (detectionHistoryRef.current.length >= 2) {
            const recent = detectionHistoryRef.current.slice(-3); // Use last 3 detections
            const avgX = recent.reduce((sum, d) => sum + d.x, 0) / recent.length;
            const avgY = recent.reduce((sum, d) => sum + d.y, 0) / recent.length;
            const avgConfidence = recent.reduce((sum, d) => sum + d.confidence, 0) / recent.length;

            // Simple motion prediction if we have enough history
            let predictedX = avgX;
            let predictedY = avgY;
            
            if (recent.length >= 3) {
              const velX = (recent[recent.length - 1].x - recent[0].x) / (recent.length - 1);
              const velY = (recent[recent.length - 1].y - recent[0].y) / (recent.length - 1);
              
              // Small prediction step
              predictedX = avgX + velX * 0.3;
              predictedY = avgY + velY * 0.3;
              
              // Clamp to valid range
              predictedX = Math.max(0, Math.min(1, predictedX));
              predictedY = Math.max(0, Math.min(1, predictedY));
            }

            // Update motion trail
            const now = Date.now();
            motionTrailRef.current.push({ x: predictedX, y: predictedY, timestamp: now });
            
            // Keep only recent trail points (last 1 second)
            motionTrailRef.current = motionTrailRef.current.filter(point => 
              now - point.timestamp < 1000
            );
            
            const finalBall = {
              x: predictedX,
              y: predictedY,
              confidence: Math.max(0.3, avgConfidence * 2.0), // Boost confidence significantly for display
              timestamp: now,
              previousPositions: [...motionTrailRef.current]
            };
            
            console.log('[BallDetection] Setting smoothed ball detection:', finalBall);
            setBallDetection(finalBall);
          } else {
            // Update motion trail for single detection
            const now = Date.now();
            motionTrailRef.current.push({ x: ball.x, y: ball.y, timestamp: now });
            
            // Keep only recent trail points
            motionTrailRef.current = motionTrailRef.current.filter(point => 
              now - point.timestamp < 1000
            );
            
            const finalBall = {
              ...ball,
              confidence: Math.max(0.3, ball.confidence * 3.0), // Boost confidence significantly for display
              previousPositions: [...motionTrailRef.current]
            };
            
            console.log('[BallDetection] Setting single ball detection:', finalBall);
            setBallDetection(finalBall);
          }
          
          lastDetectionTimeRef.current = Date.now();
        } else {
          console.log('[BallDetection] Ball confidence too low:', ball.confidence);
        }
      } else {
        // Clear detection if we haven't seen ball for too long
        if (Date.now() - lastDetectionTimeRef.current > 1000) { // Longer timeout
          console.log('[BallDetection] Clearing ball detection due to timeout');
          setBallDetection(null);
          detectionHistoryRef.current = [];
          motionTrailRef.current = [];
        } else {
          console.log('[BallDetection] No ball found, but within timeout window');
        }
      }
    } catch (error) {
      console.error('[BallDetection] Color-based detection error:', error);
      setBallDetection(null);
    }
  };

  // Simple bright spot detector as a fallback test
  const findBrightSpot = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    console.log('[BallDetection] Running bright spot detection');
    
    const step = 4;
    const brightPixels: { x: number; y: number; score: number }[] = [];

    for (let y = step; y < height - step; y += step) {
      for (let x = step; x < width - step; x += step) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;

        // Look for yellow-green bright areas (tennis ball colors)
        const isYellowish = r > 80 && g > 80 && (r + g) > (b * 1.3);
        const isGreenish = g > 90 && g > r * 0.8 && g > b * 1.1;
        const isBright = brightness > 120;
        
        let score = 0;
        if (isYellowish) score += 0.6;
        if (isGreenish) score += 0.4;
        if (isBright) score += 0.3;
        
        // Boost score for tennis ball-like colors
        if (g >= r && g > b && r > 60 && g > 70) {
          score += 0.5; // Classic tennis ball green-yellow
        }

        if (score > 0.3) {
          brightPixels.push({ x, y, score: score * brightness });
        }
      }
    }

    console.log('[BallDetection] Found', brightPixels.length, 'bright/yellow spots');

    if (brightPixels.length < 1) return null;

    // Find clusters of bright pixels
    const clusters: { x: number; y: number; count: number; totalScore: number }[] = [];
    const processed = new Set<number>();

    for (let i = 0; i < brightPixels.length; i++) {
      if (processed.has(i)) continue;
      
      const pixel = brightPixels[i];
      const cluster = { x: pixel.x, y: pixel.y, count: 1, totalScore: pixel.score };
      processed.add(i);

      // Find nearby pixels
      for (let j = i + 1; j < brightPixels.length; j++) {
        if (processed.has(j)) continue;
        
        const other = brightPixels[j];
        const distance = Math.sqrt(Math.pow(pixel.x - other.x, 2) + Math.pow(pixel.y - other.y, 2));

        if (distance <= 25) { // Cluster radius
          cluster.x = (cluster.x * cluster.count + other.x) / (cluster.count + 1);
          cluster.y = (cluster.y * cluster.count + other.y) / (cluster.count + 1);
          cluster.count++;
          cluster.totalScore += other.score;
          processed.add(j);
        }
      }

      if (cluster.count >= 1) { // Accept single pixel clusters too
        clusters.push(cluster);
      }
    }

    if (clusters.length === 0) return null;

    // Sort by total score and pixel count
    clusters.sort((a, b) => (b.totalScore * b.count) - (a.totalScore * a.count));
    const best = clusters[0];

    console.log('[BallDetection] Best bright spot cluster:', {
      position: { x: best.x, y: best.y },
      count: best.count,
      totalScore: best.totalScore,
      avgScore: best.totalScore / best.count
    });

    return {
      x: best.x / width,
      y: best.y / height,
      confidence: Math.min(0.4, (best.totalScore / best.count) / 200), // Scale to reasonable confidence
      timestamp: Date.now()
    };
  };

  // Ultra-simple fallback - find any bright area in the center region
  const findAnyBrightArea = (data: Uint8ClampedArray, width: number, height: number): BallDetection | null => {
    console.log('[BallDetection] ULTRA-FALLBACK: Scanning center region for any bright area');
    
    // Focus on center region where tennis action typically happens
    const centerX = width / 2;
    const centerY = height / 2;
    const searchRadius = Math.min(width, height) * 0.3;
    
    let brightestPixel = { x: centerX, y: centerY, brightness: 0 };
    
    for (let y = Math.max(0, centerY - searchRadius); y < Math.min(height, centerY + searchRadius); y += 8) {
      for (let x = Math.max(0, centerX - searchRadius); x < Math.min(width, centerX + searchRadius); x += 8) {
        const index = (Math.floor(y) * width + Math.floor(x)) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness > brightestPixel.brightness && brightness > 80) {
          brightestPixel = { x, y, brightness };
        }
      }
    }
    
    if (brightestPixel.brightness > 80) {
      console.log('[BallDetection] ULTRA-FALLBACK found bright area:', brightestPixel);
      return {
        x: brightestPixel.x / width,
        y: brightestPixel.y / height,
        confidence: 0.2, // Low confidence fallback
        timestamp: Date.now()
      };
    }
    
    console.log('[BallDetection] ULTRA-FALLBACK: No bright area found');
    return null;
  };

  // Choose detection method based on YOLO availability
  useEffect(() => {
    console.log('[BallDetection] Detection method evaluation:', {
      yoloModelLoaded,
      yoloError: !!yoloError,
      yoloUsingFallback,
      hasYoloDetection: !!yoloBallDetection
    });

    // Clear any existing color detection interval
    if (colorDetectionIntervalRef.current) {
      clearInterval(colorDetectionIntervalRef.current);
      colorDetectionIntervalRef.current = null;
    }

    // Force color detection for debugging if flag is set
    if (FORCE_COLOR_DETECTION) {
      console.log('[BallDetection] FORCING color-based detection for debugging');
      
      // Start color detection immediately and at regular intervals
      runColorBasedDetection(); // Run once immediately
      colorDetectionIntervalRef.current = setInterval(runColorBasedDetection, 250); // 4 FPS for much better performance
      setIsAnalyzing(true);
      
      return () => {
        if (colorDetectionIntervalRef.current) {
          clearInterval(colorDetectionIntervalRef.current);
          colorDetectionIntervalRef.current = null;
        }
        setIsAnalyzing(false);
      };
    }
    // Always try to use YOLO first if model is loaded
    else if (yoloModelLoaded && !yoloError && !yoloUsingFallback && yoloBallDetection) {
      console.log('[BallDetection] Using YOLO detection');
      
      // Get video dimensions for proper normalization
      const video = videoRef.current;
      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        // YOLO detection comes in pixel coordinates, normalize them
        const normalizedX = (yoloBallDetection.x + yoloBallDetection.width / 2) / video.videoWidth;
        const normalizedY = (yoloBallDetection.y + yoloBallDetection.height / 2) / video.videoHeight;
        
        // Update motion trail for YOLO detection
        const now = Date.now();
        motionTrailRef.current.push({ x: normalizedX, y: normalizedY, timestamp: now });
        
        // Keep only recent trail points
        motionTrailRef.current = motionTrailRef.current.filter(point => 
          now - point.timestamp < 1000
        );
        
        const yoloResult: BallDetection = {
          x: normalizedX,
          y: normalizedY,
          confidence: yoloBallDetection.confidence,
          timestamp: now,
          previousPositions: [...motionTrailRef.current]
        };
        console.log('[BallDetection] Setting YOLO ball detection:', yoloResult);
        setBallDetection(yoloResult);
        setIsAnalyzing(true);
      }
    } else if (yoloModelLoaded && !yoloError && !yoloUsingFallback) {
      // YOLO is available but no detection yet
      console.log('[BallDetection] YOLO active, waiting for detection');
      setBallDetection(null);
      setIsAnalyzing(true);
    } else {
      // Fallback to enhanced color-based detection
      console.log('[BallDetection] Using enhanced color-based fallback detection. Reasons:', {
        modelLoaded: yoloModelLoaded,
        error: yoloError,
        usingFallback: yoloUsingFallback
      });
      
      // Start color detection immediately and at regular intervals
      runColorBasedDetection(); // Run once immediately
      colorDetectionIntervalRef.current = setInterval(runColorBasedDetection, 250); // 4 FPS for much better performance
      setIsAnalyzing(true);
      
      return () => {
        if (colorDetectionIntervalRef.current) {
          clearInterval(colorDetectionIntervalRef.current);
          colorDetectionIntervalRef.current = null;
        }
        setIsAnalyzing(false);
      };
    }
  }, [yoloBallDetection, yoloModelLoaded, yoloLoading, yoloError, yoloUsingFallback, videoRef]);

  // Handle loading state
  useEffect(() => {
    setIsAnalyzing(yoloLoading || yoloModelLoaded);
  }, [yoloLoading, yoloModelLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (colorDetectionIntervalRef.current) {
        clearInterval(colorDetectionIntervalRef.current);
      }
    };
  }, []);

  // Add debug canvas to visualize detection areas
  const createDebugCanvas = (): HTMLCanvasElement | null => {
    const video = videoRef.current;
    if (!video) return null;
    
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = video.videoWidth;
    debugCanvas.height = video.videoHeight;
    debugCanvas.style.position = 'absolute';
    debugCanvas.style.top = '0';
    debugCanvas.style.left = '0';
    debugCanvas.style.zIndex = '1000';
    debugCanvas.style.pointerEvents = 'none';
    debugCanvas.style.border = '2px solid red';
    
    // Try to append to video's parent if possible
    if (video.parentElement) {
      video.parentElement.style.position = 'relative';
      video.parentElement.appendChild(debugCanvas);
    }
    
    return debugCanvas;
  };

  // Test fake ball detection or emergency detection
  useEffect(() => {
    if (TEST_MODE) {
      console.log('[BallDetection] TEST MODE: Creating fake ball detection');
      const fakeInterval = setInterval(() => {
        const now = Date.now();
        const fakeBall = {
          x: 0.5 + 0.1 * Math.sin(now / 1000), // Moving ball for test
          y: 0.3 + 0.05 * Math.cos(now / 800),
          confidence: 0.8,
          timestamp: now,
          previousPositions: []
        };
        console.log('[BallDetection] Setting fake ball:', fakeBall);
        setBallDetection(fakeBall);
      }, 100);
      
      return () => clearInterval(fakeInterval);
    }
    
    // Emergency fallback - if no detection after 5 seconds in enhanced debug mode, create a test detection
    if (ENHANCED_DEBUG && !ballDetection) {
      const emergencyTimeout = setTimeout(() => {
        console.log('[BallDetection] EMERGENCY: Creating test detection to verify drawing pipeline');
        setBallDetection({
          x: 0.4, // Position near visible tennis ball in video
          y: 0.45,
          confidence: 0.3,
          timestamp: Date.now(),
          previousPositions: []
        });
      }, 5000);
      
      return () => clearTimeout(emergencyTimeout);
    }
  }, [TEST_MODE, ENHANCED_DEBUG, ballDetection]);

  return {
    ballDetection,
    isAnalyzing,
    usingYolo: yoloModelLoaded && !yoloError && !yoloUsingFallback && !FORCE_COLOR_DETECTION,
    yoloError: FORCE_COLOR_DETECTION ? 'Forced color detection for debugging' : yoloError
  };
};

