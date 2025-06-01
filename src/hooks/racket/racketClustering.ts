
interface RacketDetectionPoint {
  x: number;
  y: number;
  score: number;
}

export const clusterRacketDetections = (
  detections: RacketDetectionPoint[], 
  maxDistance: number
): RacketDetectionPoint[][] => {
  const clusters: RacketDetectionPoint[][] = [];
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

export const findBestRacketCluster = (
  clusters: RacketDetectionPoint[][]
): RacketDetectionPoint[] => {
  return clusters.reduce((best, current) => 
    current.length > best.length ? current : best, []);
};

export const calculateClusterCenter = (
  cluster: RacketDetectionPoint[]
): { centerX: number; centerY: number; avgScore: number } => {
  const centerX = cluster.reduce((sum, r) => sum + r.x, 0) / cluster.length;
  const centerY = cluster.reduce((sum, r) => sum + r.y, 0) / cluster.length;
  const avgScore = cluster.reduce((sum, r) => sum + r.score, 0) / cluster.length;
  
  return { centerX, centerY, avgScore };
};
