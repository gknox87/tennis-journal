
import { analyzeRacketPattern } from './racketPixelAnalysis';
import { clusterRacketDetections, findBestRacketCluster, calculateClusterCenter } from './racketClustering';

interface RacketDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export const detectRacketFromPixels = (
  data: Uint8ClampedArray, 
  width: number, 
  height: number,
  playerRegion?: any
): RacketDetection | null => {
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
    const bestCluster = findBestRacketCluster(clusters);
    
    if (bestCluster.length > 0) {
      const { centerX, centerY, avgScore } = calculateClusterCenter(bestCluster);
      
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
