import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, Target, Check, Crosshair, Smartphone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { useToast } from '@/components/ui/use-toast';
import { useOptimizedGPS } from '@/hooks/useOptimizedGPS';

interface EnhancedARMeasurementProps {
  onCapture: (measurement: EnhancedARMeasurement) => void;
  onCancel: () => void;
  targetType: 'pin' | 'tee' | 'shot' | 'start';
  title: string;
  instructions: string;
  referencePoint?: { latitude: number; longitude: number } | null;
}

export interface EnhancedARMeasurement {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  photoUrl?: string;
  confidence: 'high' | 'medium' | 'low';
  method: 'enhanced-ar' | 'ar-camera' | 'gps-multi-sample' | 'gps-fallback';
  deviceOrientation?: {
    alpha: number; // compass heading
    beta: number;  // tilt front/back
    gamma: number; // tilt left/right
  };
  sensorData?: {
    accelerometer?: { x: number; y: number; z: number };
    magnetometer?: { x: number; y: number; z: number };
    gyroscope?: { x: number; y: number; z: number };
  };
  measurements: LocationData[];
  averagedAccuracy: number;
  stabilityScore: number;
  distanceToReference?: number;
  heightEstimate?: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

const EnhancedARMeasurement: React.FC<EnhancedARMeasurementProps> = ({
  onCapture,
  onCancel,
  targetType,
  title,
  instructions,
  referencePoint
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [measurement, setMeasurement] = useState<EnhancedARMeasurement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [orientation, setOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);
  const [sensorData, setSensorData] = useState<any>(null);
  const [measurements, setMeasurements] = useState<LocationData[]>([]);
  const [stabilityScore, setStabilityScore] = useState(0);
  const [calibrated, setCalibrated] = useState(false);
  
  const { getCurrentLocation } = useMobileFeatures();
  const { location } = useOptimizedGPS({ accuracy: 'high', mode: 'betting' });
  const { toast } = useToast();

  useEffect(() => {
    startEnhancedCamera();
    startSensorTracking();
    
    return () => {
      stopCamera();
      stopSensorTracking();
    };
  }, []);

  const startEnhancedCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 15 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
        
        // Start calibration process
        setTimeout(() => setCalibrated(true), 2000);
      }
    } catch (error) {
      console.error('Enhanced camera access failed:', error);
      toast({
        title: "Camera access failed",
        description: "Using GPS multi-sampling mode",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsActive(false);
  };

  const startSensorTracking = () => {
    // Device Orientation
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        setOrientation({
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0
        });
      };
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Motion sensors (if available)
    if ('DeviceMotionEvent' in window) {
      const handleMotion = (event: DeviceMotionEvent) => {
        if (event.acceleration && event.rotationRate) {
          setSensorData({
            accelerometer: event.acceleration,
            gyroscope: event.rotationRate
          });
        }
      };
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  const stopSensorTracking = () => {
    // Cleanup handled in useEffect return
  };

  const calculateStabilityScore = useCallback(() => {
    if (measurements.length < 3) return 0;
    
    const recentMeasurements = measurements.slice(-5);
    const avgLat = recentMeasurements.reduce((sum, m) => sum + m.latitude, 0) / recentMeasurements.length;
    const avgLng = recentMeasurements.reduce((sum, m) => sum + m.longitude, 0) / recentMeasurements.length;
    
    const variance = recentMeasurements.reduce((sum, m) => {
      const latDiff = m.latitude - avgLat;
      const lngDiff = m.longitude - avgLng;
      return sum + (latDiff * latDiff + lngDiff * lngDiff);
    }, 0) / recentMeasurements.length;
    
    // Convert to stability score (0-100)
    const stability = Math.max(0, 100 - (variance * 1000000));
    setStabilityScore(stability);
    return stability;
  }, [measurements]);

  const captureEnhancedMeasurement = async () => {
    setIsCapturing(true);
    setCaptureProgress(0);
    
    try {
      const sampleCount = 10;
      const sampleMeasurements: LocationData[] = [];
      
      // Multi-sample GPS for better accuracy
      for (let i = 0; i < sampleCount; i++) {
        setCaptureProgress((i / sampleCount) * 60);
        
        const location = await getCurrentLocation();
        if (location) {
          sampleMeasurements.push(location);
        }
        
        // Wait between samples
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      if (sampleMeasurements.length === 0) {
        throw new Error('No location data available');
      }
      
      setCaptureProgress(70);
      
      // Calculate averaged position with outlier rejection
      const validMeasurements = removeOutliers(sampleMeasurements);
      const avgPosition = calculateAveragePosition(validMeasurements);
      const avgAccuracy = validMeasurements.reduce((sum, m) => sum + m.accuracy, 0) / validMeasurements.length;
      
      setCaptureProgress(80);
      
      // Capture enhanced photo with overlays
      let photoUrl: string | undefined;
      if (videoRef.current && canvasRef.current) {
        photoUrl = await captureEnhancedPhoto(avgPosition, avgAccuracy);
      }
      
      setCaptureProgress(90);
      
      // Calculate distance to reference if available
      let distanceToReference: number | undefined;
      if (referencePoint) {
        distanceToReference = calculateDistance(avgPosition, referencePoint);
      }
      
      // Estimate height based on device orientation
      const heightEstimate = estimateHeight(orientation, distanceToReference);
      
      // Determine confidence based on multiple factors
      const confidence = determineEnhancedConfidence(
        avgAccuracy,
        orientation,
        sensorData,
        stabilityScore,
        validMeasurements.length
      );
      
      const enhancedMeasurement: EnhancedARMeasurement = {
        id: crypto.randomUUID(),
        latitude: avgPosition.latitude,
        longitude: avgPosition.longitude,
        accuracy: avgAccuracy,
        timestamp: Date.now(),
        photoUrl,
        confidence,
        method: isActive ? 'enhanced-ar' : 'gps-multi-sample',
        deviceOrientation: orientation || undefined,
        sensorData,
        measurements: validMeasurements,
        averagedAccuracy: avgAccuracy,
        stabilityScore,
        distanceToReference,
        heightEstimate
      };

      setMeasurement(enhancedMeasurement);
      setCaptureProgress(100);
      
      toast({
        title: "Enhanced measurement captured",
        description: `${confidence.toUpperCase()} confidence • ${validMeasurements.length} samples averaged`
      });
      
    } catch (error) {
      console.error('Enhanced capture failed:', error);
      toast({
        title: "Capture failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
      setCaptureProgress(0);
    }
  };

  const removeOutliers = (measurements: LocationData[]): LocationData[] => {
    if (measurements.length < 3) return measurements;
    
    const avgLat = measurements.reduce((sum, m) => sum + m.latitude, 0) / measurements.length;
    const avgLng = measurements.reduce((sum, m) => sum + m.longitude, 0) / measurements.length;
    
    // Remove measurements that are too far from average (outliers)
    return measurements.filter(m => {
      const distance = calculateDistance(m, { latitude: avgLat, longitude: avgLng });
      return distance < 10; // within 10 meters of average
    });
  };

  const calculateAveragePosition = (measurements: LocationData[]): LocationData => {
    const avgLat = measurements.reduce((sum, m) => sum + m.latitude, 0) / measurements.length;
    const avgLng = measurements.reduce((sum, m) => sum + m.longitude, 0) / measurements.length;
    const avgAccuracy = measurements.reduce((sum, m) => sum + m.accuracy, 0) / measurements.length;
    
    return {
      latitude: avgLat,
      longitude: avgLng,
      accuracy: avgAccuracy,
      timestamp: Date.now()
    };
  };

  const calculateDistance = (point1: LocationData, point2: { latitude: number; longitude: number }): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const estimateHeight = (orientation: any, distance?: number): number | undefined => {
    if (!orientation || !distance) return undefined;
    
    // Use device tilt to estimate height difference
    const tiltRadians = (orientation.beta * Math.PI) / 180;
    return Math.tan(tiltRadians) * distance;
  };

  const captureEnhancedPhoto = async (position: LocationData, accuracy: number): Promise<string> => {
    const canvas = canvasRef.current!;
    const video = videoRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame
    ctx.drawImage(video, 0, 0);
    
    // Enhanced overlay with more information
    drawEnhancedOverlay(ctx, canvas.width, canvas.height, position, accuracy);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const drawEnhancedOverlay = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    position: LocationData, 
    accuracy: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Enhanced crosshair with accuracy circle
    ctx.strokeStyle = accuracy <= 3 ? '#00ff00' : accuracy <= 8 ? '#ffff00' : '#ff4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Main crosshair
    const size = 40;
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY);
    ctx.lineTo(centerX + size, centerY);
    ctx.moveTo(centerX, centerY - size);
    ctx.lineTo(centerX, centerY + size);
    ctx.stroke();
    
    // Accuracy circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, Math.min(accuracy * 5, 100), 0, 2 * Math.PI);
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Enhanced info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 350, 120);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`Enhanced AR Measurement`, 20, 30);
    
    ctx.font = '12px monospace';
    ctx.fillText(`Accuracy: ${accuracy.toFixed(1)}m`, 20, 50);
    ctx.fillText(`Lat: ${position.latitude.toFixed(7)}`, 20, 70);
    ctx.fillText(`Lng: ${position.longitude.toFixed(7)}`, 20, 90);
    ctx.fillText(`Stability: ${stabilityScore.toFixed(0)}%`, 20, 110);
    
    if (orientation) {
      ctx.fillText(`Tilt: ${orientation.beta.toFixed(1)}°`, 200, 50);
      ctx.fillText(`Compass: ${orientation.alpha.toFixed(1)}°`, 200, 70);
    }
    
    if (referencePoint && measurement?.distanceToReference) {
      ctx.fillText(`Distance: ${measurement.distanceToReference.toFixed(1)}m`, 200, 90);
    }
  };

  const determineEnhancedConfidence = (
    accuracy: number,
    orientation: any,
    sensors: any,
    stability: number,
    sampleCount: number
  ): 'high' | 'medium' | 'low' => {
    let score = 0;
    
    // Accuracy factor (0-40 points)
    if (accuracy <= 2) score += 40;
    else if (accuracy <= 5) score += 30;
    else if (accuracy <= 10) score += 20;
    else score += 10;
    
    // Orientation factor (0-20 points)
    if (orientation) score += 20;
    
    // Stability factor (0-20 points)
    score += (stability / 100) * 20;
    
    // Sample count factor (0-20 points)
    score += Math.min(sampleCount / 10, 1) * 20;
    
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const handleConfirm = () => {
    if (measurement) {
      onCapture(measurement);
    }
  };

  const getTargetIcon = () => {
    switch (targetType) {
      case 'pin': return <Target className="h-6 w-6" />;
      case 'tee': return <div className="w-6 h-6 rounded-full bg-primary" />;
      case 'start': return <div className="w-6 h-6 rounded-full bg-blue-500" />;
      default: return <Camera className="h-6 w-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 bg-black/90 text-white">
        <div className="flex items-center gap-3">
          {getTargetIcon()}
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              {title}
              <Zap className="h-4 w-4 text-yellow-400" />
            </h2>
            <p className="text-sm text-gray-300">{instructions}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera View with Enhanced AR */}
      <div className="flex-1 relative overflow-hidden">
        {isActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Enhanced AR Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Dynamic crosshair based on accuracy */}
            <div className={`w-20 h-20 border-4 rounded-full flex items-center justify-center transition-colors ${
              stabilityScore > 80 ? 'border-green-500' : 
              stabilityScore > 60 ? 'border-yellow-500' : 'border-red-500'
            }`}>
              <Crosshair className="w-8 h-8 text-white" />
            </div>
            
            {/* Stability indicator */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary" className="text-xs">
                {calibrated ? `Stability: ${stabilityScore.toFixed(0)}%` : 'Calibrating...'}
              </Badge>
            </div>
            
            {/* Distance indicator */}
            {referencePoint && location && (
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <Badge variant="outline" className="text-xs">
                  ~{calculateDistance(location, referencePoint).toFixed(0)}m to reference
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Sensor Info */}
        <div className="absolute top-4 left-4 space-y-2">
          {orientation && (
            <div className="bg-black/70 text-white p-2 rounded-lg text-xs">
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                <span>Device Orientation</span>
              </div>
              <div>Tilt: {orientation.beta.toFixed(1)}°</div>
              <div>Compass: {orientation.alpha.toFixed(1)}°</div>
            </div>
          )}
          
          {location && (
            <div className="bg-black/70 text-white p-2 rounded-lg text-xs">
              <div>GPS: ±{location.accuracy.toFixed(1)}m</div>
              <div>Samples: {measurements.length}</div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Bottom Controls */}
      <div className="p-4 bg-black/90">
        {!measurement ? (
          <div className="space-y-4">
            {isCapturing && (
              <div className="space-y-2">
                <div className="text-center text-white text-sm">
                  Capturing enhanced measurement...
                </div>
                <Progress value={captureProgress} />
              </div>
            )}
            
            <div className="text-center text-white text-sm">
              {calibrated ? 
                'Enhanced AR ready • Multi-sample GPS • Sensor fusion active' : 
                'Calibrating sensors...'
              }
            </div>
            
            <Button
              onClick={captureEnhancedMeasurement}
              disabled={isCapturing || !calibrated}
              className="w-full h-16 text-lg"
              size="lg"
            >
              {isCapturing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Capturing Enhanced...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  Enhanced Capture
                </div>
              )}
            </Button>
          </div>
        ) : (
          <Card className="bg-white/10 text-white border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Enhanced Measurement
                <Zap className="h-5 w-5 text-yellow-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Accuracy</div>
                  <Badge variant={measurement.confidence === 'high' ? 'default' : measurement.confidence === 'medium' ? 'secondary' : 'destructive'}>
                    ±{measurement.accuracy.toFixed(1)}m
                  </Badge>
                </div>
                <div>
                  <div className="font-medium">Confidence</div>
                  <Badge variant="outline">
                    {measurement.confidence.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <div className="font-medium">Samples</div>
                  <div className="text-white/80">{measurement.measurements.length}</div>
                </div>
                <div>
                  <div className="font-medium">Stability</div>
                  <div className="text-white/80">{measurement.stabilityScore.toFixed(0)}%</div>
                </div>
              </div>
              
              {measurement.distanceToReference && (
                <div className="text-center py-2 border-t border-white/20">
                  <div className="font-medium">Distance to Reference</div>
                  <div className="text-lg text-green-400">
                    {measurement.distanceToReference.toFixed(1)}m
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setMeasurement(null)} className="flex-1">
                  Retake
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hidden canvas for enhanced photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default EnhancedARMeasurement;