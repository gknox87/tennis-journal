
export const analyzeRacketPattern = (
  data: Uint8ClampedArray, 
  centerX: number, 
  centerY: number, 
  width: number, 
  height: number
): number => {
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

export const isRacketFrame = (r: number, g: number, b: number): boolean => {
  const brightness = (r + g + b) / 3;
  const contrast = Math.max(r, g, b) - Math.min(r, g, b);
  // Dark frame with good contrast
  return brightness < 100 && contrast > 20;
};

export const isRacketString = (r: number, g: number, b: number): boolean => {
  const brightness = (r + g + b) / 3;
  // Bright strings (white or yellow)
  return brightness > 160 && (
    (r > 180 && g > 180 && b > 180) || // White
    (g > 150 && r > 120 && b < 120)    // Yellow
  );
};

export const isRacketHandle = (r: number, g: number, b: number): boolean => {
  const brightness = (r + g + b) / 3;
  // Handle colors (usually dark or colored grip tape)
  return brightness < 120 && brightness > 30;
};
