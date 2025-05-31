
import { useState, useEffect } from 'react';

interface ServeMetrics {
  elbow: number;
  knee: number;
  xFactor: number;
  contactHeight: number;
  followThrough: number;
}

export const useServeAnalysis = (pose: any, racketBox: any) => {
  const [metrics, setMetrics] = useState<ServeMetrics>({
    elbow: 0,
    knee: 0,
    xFactor: 0,
    contactHeight: 0,
    followThrough: 0
  });
  const [similarity, setSimilarity] = useState(0);

  useEffect(() => {
    if (!pose || !pose.landmarks) return;

    // Calculate metrics based on pose landmarks
    const calculateMetrics = () => {
      // Mock calculations - in real implementation would calculate actual angles
      const newMetrics = {
        elbow: 145 + Math.random() * 20, // degrees
        knee: 135 + Math.random() * 20, // degrees
        xFactor: 40 + Math.random() * 15, // degrees
        contactHeight: 210 + Math.random() * 30, // cm
        followThrough: 12 + Math.random() * 8 // frames
      };

      setMetrics(newMetrics);
      
      // Calculate similarity score
      const targetMetrics = { elbow: 150, knee: 140, xFactor: 45, contactHeight: 220, followThrough: 15 };
      const deviations = Object.keys(newMetrics).map(key => {
        const target = targetMetrics[key as keyof typeof targetMetrics];
        const actual = newMetrics[key as keyof typeof newMetrics];
        return Math.abs(actual - target) / target;
      });
      const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
      setSimilarity(Math.max(0, Math.min(100, 100 - avgDeviation * 100)));
    };

    calculateMetrics();
  }, [pose, racketBox]);

  const saveSession = async () => {
    // Save to IndexedDB or local storage
    const session = {
      timestamp: new Date().toISOString(),
      metrics,
      similarity
    };
    
    localStorage.setItem(`serve-session-${Date.now()}`, JSON.stringify(session));
  };

  const resetMetrics = () => {
    setMetrics({
      elbow: 0,
      knee: 0,
      xFactor: 0,
      contactHeight: 0,
      followThrough: 0
    });
    setSimilarity(0);
  };

  return { metrics, similarity, saveSession, resetMetrics };
};
