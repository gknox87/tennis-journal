import { useState, useEffect, useRef, useCallback } from 'react';
import * as ort from 'onnxruntime-web';

interface RacketDetection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  timestamp: number;
}

interface ModelConfig {
  modelPath: string;
  fallbackModelPath?: string;
  inputSize: number;
  confidenceThreshold: number;
  nmsThreshold: number;
}

const DEFAULT_CONFIG: ModelConfig = {
  modelPath: '/models/tennis_ball_detector.onnx', // Our custom trained model (detects both ball and racket)
  fallbackModelPath: '/models/tennis-ball-yolo.onnx',
  inputSize: 416,
  confidenceThreshold: 0.3, // Lower threshold for racket detection
  nmsThreshold: 0.4
};

export const useYoloRacketDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  config: Partial<ModelConfig> = {}
) => {
  const [racketDetection, setRacketDetection] = useState<RacketDetection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  
  const sessionRef = useRef<ort.InferenceSession | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const lastProcessTimeRef = useRef<number>(0);
  
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Initialize ONNX Runtime (shared with ball detection)
  useEffect(() => {
    const initializeORT = async () => {
      try {
        // Use optimized settings for racket detection
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.0/dist/';
        ort.env.wasm.numThreads = 2; // Allow 2 threads for racket detection
        ort.env.logLevel = 'warning';
        
        console.log('[YoloRacketDetection] ONNX Runtime initialized');
      } catch (err) {
        console.error('[YoloRacketDetection] Failed to initialize ONNX Runtime:', err);
        setError('Failed to initialize AI engine');
      }
    };
    
    initializeORT();
  }, []);

  // Load the YOLO model
  const loadModel = useCallback(async () => {
    if (sessionRef.current || modelLoaded) return;
    
    setIsLoading(true);
    setError(null);
    
    const modelPath = fullConfig.modelPath;
    let loadSuccess = false;
    
    try {
      console.log(`[YoloRacketDetection] Loading model: ${modelPath}`);
      
      const session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
        enableMemPattern: true,
        enableCpuMemArena: true
      });
      
      sessionRef.current = session;
      setModelLoaded(true);
      setUsingFallback(false);
      loadSuccess = true;
      
      console.log('[YoloRacketDetection] Model loaded successfully for racket detection');
      
    } catch (primaryError) {
      console.warn('[YoloRacketDetection] Primary model failed:', primaryError);
      
      if (fullConfig.fallbackModelPath) {
        try {
          const session = await ort.InferenceSession.create(fullConfig.fallbackModelPath, {
            executionProviders: ['wasm'],
            graphOptimizationLevel: 'all'
          });
          
          sessionRef.current = session;
          setModelLoaded(true);
          setUsingFallback(true);
          loadSuccess = true;
          console.log('[YoloRacketDetection] Fallback model loaded');
          
        } catch (fallbackError) {
          console.error('[YoloRacketDetection] Fallback model failed:', fallbackError);
        }
      }
      
      if (!loadSuccess) {
        setError('No YOLO model available for racket detection');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fullConfig.modelPath, fullConfig.fallbackModelPath, modelLoaded]);

  // Optimized image preprocessing for racket detection
  const preprocessImage = (canvas: HTMLCanvasElement): ort.Tensor => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    
    // Resize to model input size with better quality
    const inputSize = fullConfig.inputSize;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = inputSize;
    tempCanvas.height = inputSize;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // Use better image scaling for racket details
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(canvas, 0, 0, inputSize, inputSize);
    
    const imageData = tempCtx.getImageData(0, 0, inputSize, inputSize);
    const data = imageData.data;
    
    // Convert to normalized RGB tensor
    const float32Data = new Float32Array(3 * inputSize * inputSize);
    
    for (let i = 0; i < inputSize * inputSize; i++) {
      const pixelIndex = i * 4;
      
      // Normalize to [0, 1] range
      float32Data[i] = data[pixelIndex] / 255.0; // R
      float32Data[i + inputSize * inputSize] = data[pixelIndex + 1] / 255.0; // G
      float32Data[i + 2 * inputSize * inputSize] = data[pixelIndex + 2] / 255.0; // B
    }
    
    return new ort.Tensor('float32', float32Data, [1, 3, inputSize, inputSize]);
  };

  // Post-process for racket detection (tennis racket is class index 1)
  const postprocessOutput = (output: ort.Tensor, originalWidth: number, originalHeight: number): RacketDetection | null => {
    try {
      const outputData = output.data as Float32Array;
      const inputSize = fullConfig.inputSize;
      
      if (usingFallback) {
        console.log('[YoloRacketDetection] Using fallback model');
        return null;
      }
      
      let bestDetection: RacketDetection | null = null;
      let bestConfidence = 0;
      
      // Tennis racket is class index 1 in our custom model
      const tennisRacketIndex = 1;
      
      const outputShape = output.dims;
      if (outputShape.length !== 3) {
        console.warn('[YoloRacketDetection] Unexpected output tensor shape');
        return null;
      }
      
      const numChannels = outputShape[1]; // Should be 6 (4 bbox + 2 classes)
      const numAnchors = outputShape[2];
      
      for (let i = 0; i < numAnchors; i++) {
        // YOLOv8 format: [x_center, y_center, width, height, ball_conf, racket_conf]
        const x_center = outputData[i];
        const y_center = outputData[numAnchors + i];
        const width = outputData[2 * numAnchors + i];
        const height = outputData[3 * numAnchors + i];
        const ballConf = outputData[4 * numAnchors + i];
        const racketConf = outputData[5 * numAnchors + i]; // This is what we want
        
        const confidence = racketConf;
        
        if (confidence > fullConfig.confidenceThreshold && confidence > bestConfidence) {
          // Convert from normalized coordinates
          const scaleX = originalWidth / inputSize;
          const scaleY = originalHeight / inputSize;
          
          const x = (x_center - width / 2) * scaleX;
          const y = (y_center - height / 2) * scaleY;
          const w = width * scaleX;
          const h = height * scaleY;
          
          bestDetection = {
            x: Math.max(0, x),
            y: Math.max(0, y),
            width: Math.min(w, originalWidth - x),
            height: Math.min(h, originalHeight - y),
            confidence,
            timestamp: Date.now()
          };
          bestConfidence = confidence;
          
          console.log(`[YoloRacketDetection] Found racket at (${x.toFixed(1)}, ${y.toFixed(1)}) confidence: ${confidence.toFixed(3)}`);
        }
      }
      
      return bestDetection;
    } catch (err) {
      console.error('[YoloRacketDetection] Post-processing error:', err);
      return null;
    }
  };

  // Optimized detection function with frame skipping
  const detectRacket = useCallback(async () => {
    const video = videoRef.current;
    const session = sessionRef.current;
    
    if (!video || !session || video.readyState < 2 || isRunningRef.current) {
      return;
    }
    
    // Throttle racket detection to 10 FPS for better performance
    const now = performance.now();
    if (now - lastProcessTimeRef.current < 100) {
      return;
    }
    lastProcessTimeRef.current = now;
    
    isRunningRef.current = true;
    
    try {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(video, 0, 0);
      
      // Preprocess for racket detection
      const inputTensor = preprocessImage(canvas);
      
      // Run inference
      const feeds = { images: inputTensor };
      const results = await session.run(feeds);
      
      const outputName = Object.keys(results)[0];
      const output = results[outputName];
      
      // Process results for racket
      const detection = postprocessOutput(output, canvas.width, canvas.height);
      setRacketDetection(detection);
      
    } catch (err) {
      console.error('[YoloRacketDetection] Detection error:', err);
      setRacketDetection(null);
    } finally {
      isRunningRef.current = false;
    }
  }, [videoRef, fullConfig.confidenceThreshold, usingFallback]);

  // Optimized detection loop
  const startDetection = useCallback(() => {
    if (!sessionRef.current || animationRef.current) return;
    
    const detect = async () => {
      await detectRacket();
      if (sessionRef.current) {
        // Use timeout instead of requestAnimationFrame for better control
        animationRef.current = window.setTimeout(detect, 100); // 10 FPS
      }
    };
    
    detect();
  }, [detectRacket]);

  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    isRunningRef.current = false;
  }, []);

  // Auto-start detection when model is loaded
  useEffect(() => {
    const video = videoRef.current;
    if (modelLoaded && video) {
      const handleVideoReady = () => {
        if (video.readyState >= 2) {
          startDetection();
        }
      };
      
      video.addEventListener('loadeddata', handleVideoReady);
      video.addEventListener('play', startDetection);
      video.addEventListener('pause', stopDetection);
      video.addEventListener('ended', stopDetection);
      
      if (video.readyState >= 2) {
        handleVideoReady();
      }
      
      return () => {
        video.removeEventListener('loadeddata', handleVideoReady);
        video.removeEventListener('play', startDetection);
        video.removeEventListener('pause', stopDetection);
        video.removeEventListener('ended', stopDetection);
        stopDetection();
      };
    }
  }, [modelLoaded, videoRef, startDetection, stopDetection]);

  // Load model on mount
  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopDetection();
      if (sessionRef.current) {
        sessionRef.current.release();
      }
    };
  }, [stopDetection]);

  return {
    racketDetection,
    isLoading,
    error,
    modelLoaded,
    usingFallback,
    startDetection,
    stopDetection
  };
}; 