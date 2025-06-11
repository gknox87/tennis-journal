import { useState, useEffect, useRef, useCallback } from 'react';
import * as ort from 'onnxruntime-web';

interface BallDetection {
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
  modelPath: '/models/tennis_ball_detector.onnx', // Our custom trained model
  fallbackModelPath: '/models/tennis-ball-yolo.onnx', // Previous generic model as fallback
  inputSize: 416,
  confidenceThreshold: 0.25, // Adjusted for our custom model
  nmsThreshold: 0.4
};

// Class names from your tennis ball tracker dataset
const CLASS_NAMES = [
  'tennis ball', 'tennis racket'
];

export const useYoloBallDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  config: Partial<ModelConfig> = {}
) => {
  const [ballDetection, setBallDetection] = useState<BallDetection | null>(null);
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

  // Initialize ONNX Runtime
  useEffect(() => {
    const initializeORT = async () => {
      try {
        // Configure ONNX Runtime for web with optimized settings
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.0/dist/';
        ort.env.wasm.numThreads = 2; // Increase to 2 threads for better performance
        ort.env.logLevel = 'warning'; // Reduce console noise
        
        console.log('[YoloBallDetection] ONNX Runtime initialized');
      } catch (err) {
        console.error('[YoloBallDetection] Failed to initialize ONNX Runtime:', err);
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
    
    // Try to load the primary model first
    const modelPath = fullConfig.modelPath;
    let loadSuccess = false;
    
    try {
      console.log(`[YoloBallDetection] Attempting to load primary model: ${modelPath}`);
      
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
      
      // Log model info
      console.log('[YoloBallDetection] Primary model loaded successfully');
      console.log('[YoloBallDetection] Model inputs:', session.inputNames);
      console.log('[YoloBallDetection] Model outputs:', session.outputNames);
      
    } catch (primaryError) {
      console.warn('[YoloBallDetection] Primary model failed to load:', primaryError);
      
      // Try fallback model if available
      if (fullConfig.fallbackModelPath) {
        try {
          console.log(`[YoloBallDetection] Attempting to load fallback model: ${fullConfig.fallbackModelPath}`);
          
          const session = await ort.InferenceSession.create(fullConfig.fallbackModelPath, {
            executionProviders: ['wasm'],
            graphOptimizationLevel: 'all'
          });
          
          sessionRef.current = session;
          setModelLoaded(true);
          setUsingFallback(true);
          loadSuccess = true;
          console.log('[YoloBallDetection] Fallback model loaded successfully');
          
        } catch (fallbackError) {
          console.error('[YoloBallDetection] Fallback model also failed:', fallbackError);
        }
      }
      
      if (!loadSuccess) {
        setError('No YOLO model available. Using color-based detection.');
        console.log('[YoloBallDetection] No models available, will use color-based fallback');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fullConfig.modelPath, fullConfig.fallbackModelPath, modelLoaded]);

  // Optimized image preprocessing
  const preprocessImage = (canvas: HTMLCanvasElement): ort.Tensor => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    
    // Resize to model input size
    const inputSize = fullConfig.inputSize;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = inputSize;
    tempCanvas.height = inputSize;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // Disable image smoothing for faster processing
    tempCtx.imageSmoothingEnabled = false;
    tempCtx.drawImage(canvas, 0, 0, inputSize, inputSize);
    
    const imageData = tempCtx.getImageData(0, 0, inputSize, inputSize);
    const data = imageData.data;
    
    // Convert to RGB and normalize [0, 255] -> [0, 1]
    const float32Data = new Float32Array(3 * inputSize * inputSize);
    
    for (let i = 0; i < inputSize * inputSize; i++) {
      const pixelIndex = i * 4;
      const tensorIndex = i;
      
      // RGB channels (normalize to 0-1)
      float32Data[tensorIndex] = data[pixelIndex] / 255.0; // R
      float32Data[tensorIndex + inputSize * inputSize] = data[pixelIndex + 1] / 255.0; // G
      float32Data[tensorIndex + 2 * inputSize * inputSize] = data[pixelIndex + 2] / 255.0; // B
    }
    
    return new ort.Tensor('float32', float32Data, [1, 3, inputSize, inputSize]);
  };

  // Post-process YOLO output
  const postprocessOutput = (output: ort.Tensor, originalWidth: number, originalHeight: number): BallDetection | null => {
    try {
      const outputData = output.data as Float32Array;
      const inputSize = fullConfig.inputSize;
      
      // If using fallback model, it might not detect tennis balls specifically
      if (usingFallback) {
        console.log('[YoloBallDetection] Using fallback model - tennis ball detection may not be accurate');
        return null;
      }
      
      // YOLOv8 output format: [batch, num_classes + 4, anchors] 
      // Our custom model has 2 classes: tennis ball (0), tennis racket (1)
      let bestDetection: BallDetection | null = null;
      let bestConfidence = 0;
      
      // Tennis ball is class index 0 in our custom model
      const tennisBallIndex = 0;
      
      // Calculate number of anchors from output tensor shape
      const outputShape = output.dims;
      
      if (outputShape.length !== 3) {
        console.warn('[YoloBallDetection] Unexpected output tensor shape');
        return null;
      }
      
      const batchSize = outputShape[0]; // Should be 1
      const numChannels = outputShape[1]; // Should be 6 (4 bbox + 2 classes)
      const numAnchors = outputShape[2]; // Number of detection anchors
      
      for (let i = 0; i < numAnchors; i++) {
        // YOLOv8 format: [x_center, y_center, width, height, class0_conf, class1_conf]
        const x_center = outputData[i]; // First row: x_center
        const y_center = outputData[numAnchors + i]; // Second row: y_center
        const width = outputData[2 * numAnchors + i]; // Third row: width
        const height = outputData[3 * numAnchors + i]; // Fourth row: height
        const tennisBallConf = outputData[4 * numAnchors + i]; // Fifth row: tennis ball confidence
        const tennisRacketConf = outputData[5 * numAnchors + i]; // Sixth row: tennis racket confidence
        
        // Use tennis ball confidence
        const confidence = tennisBallConf;
        
        if (confidence > fullConfig.confidenceThreshold && confidence > bestConfidence) {
          // Convert from normalized coordinates to original image coordinates
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
        }
      }
      
      return bestDetection;
    } catch (err) {
      console.error('[YoloBallDetection] Error in post-processing:', err);
      return null;
    }
  };

  // Optimized detection function with frame skipping
  const detectBall = useCallback(async () => {
    const video = videoRef.current;
    const session = sessionRef.current;
    
    if (!video || !session || video.readyState < 2 || isRunningRef.current) {
      return;
    }
    
    // Throttle ball detection to 15 FPS for better performance
    const now = performance.now();
    if (now - lastProcessTimeRef.current < 66) {
      return;
    }
    lastProcessTimeRef.current = now;
    
    isRunningRef.current = true;
    
    try {
      // Create canvas if it doesn't exist
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(video, 0, 0);
      
      // Preprocess image
      const inputTensor = preprocessImage(canvas);
      
      // Run inference
      const feeds = { images: inputTensor };
      const results = await session.run(feeds);
      
      // Get output tensor (name may vary based on your model)
      const outputName = Object.keys(results)[0];
      const output = results[outputName];
      
      // Post-process results
      const detection = postprocessOutput(output, canvas.width, canvas.height);
      setBallDetection(detection);
      
    } catch (err) {
      console.error('[YoloBallDetection] Detection error:', err);
      setBallDetection(null);
    } finally {
      isRunningRef.current = false;
    }
  }, [videoRef, fullConfig.confidenceThreshold, usingFallback]);

  // Optimized detection loop using timeout instead of requestAnimationFrame
  const startDetection = useCallback(() => {
    if (!sessionRef.current || animationRef.current) return;
    
    const detect = async () => {
      await detectBall();
      if (sessionRef.current) { // Only continue if session still exists
        animationRef.current = window.setTimeout(detect, 66); // 15 FPS
      }
    };
    
    detect();
  }, [detectBall]);

  // Stop detection loop
  const stopDetection = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    isRunningRef.current = false;
  }, []);

  // Auto-start detection when model is loaded and video is ready
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      if (sessionRef.current) {
        sessionRef.current.release();
      }
    };
  }, [stopDetection]);

  return {
    ballDetection,
    isLoading,
    error,
    modelLoaded,
    usingFallback,
    startDetection,
    stopDetection
  };
}; 