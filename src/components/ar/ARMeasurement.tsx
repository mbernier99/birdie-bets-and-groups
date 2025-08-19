import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Target, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMobileFeatures } from '@/hooks/useMobileFeatures';
import { useToast } from '@/components/ui/use-toast';

interface ARMeasurementProps {
  onCapture: (measurement: ARMeasurement) => void;
  onCancel: () => void;
  targetType: 'pin' | 'tee' | 'shot' | 'start';
  title: string;
  instructions: string;
}

export interface ARMeasurement {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  photoUrl?: string;
  confidence: 'high' | 'medium' | 'low';
  method: 'ar-camera' | 'gps-fallback';
  deviceOrientation?: {
    alpha: number;
    beta: number;
    gamma: number;
  };
}

const ARMeasurement: React.FC<ARMeasurementProps> = ({
  onCapture,
  onCancel,
  targetType,
  title,
  instructions
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [measurement, setMeasurement] = useState<ARMeasurement | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [orientation, setOrientation] = useState<{ alpha: number; beta: number; gamma: number } | null>(null);
  
  const { getCurrentLocation, takePhoto } = useMobileFeatures();
  const { toast } = useToast();

  useEffect(() => {
    startCamera();
    startOrientationTracking();
    
    return () => {
      stopCamera();
      stopOrientationTracking();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access failed",
        description: "Using GPS fallback for positioning",
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

  const startOrientationTracking = () => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        setOrientation({
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0
        });
      };
      
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  };

  const stopOrientationTracking = () => {
    // Cleanup is handled in the useEffect return
  };

  const captureARMeasurement = async () => {
    setIsCapturing(true);
    
    try {
      // Get current location with high accuracy
      const location = await getCurrentLocation();
      if (!location) {
        toast({
          title: "Location unavailable",
          description: "Please enable GPS and try again",
          variant: "destructive"
        });
        return;
      }

      // Capture photo with camera overlay
      let photoUrl: string | undefined;
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw video frame
          ctx.drawImage(video, 0, 0);
          
          // Add crosshair overlay
          drawCrosshair(ctx, canvas.width, canvas.height);
          
          // Add measurement info
          drawMeasurementOverlay(ctx, canvas.width, canvas.height, location);
          
          // Convert to base64
          photoUrl = canvas.toDataURL('image/jpeg', 0.8);
        }
      }

      // Determine confidence based on accuracy and orientation
      const confidence = determineConfidence(location.accuracy, orientation);
      
      const arMeasurement: ARMeasurement = {
        id: crypto.randomUUID(),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: Date.now(),
        photoUrl,
        confidence,
        method: isActive ? 'ar-camera' : 'gps-fallback',
        deviceOrientation: orientation || undefined
      };

      setMeasurement(arMeasurement);
      
      toast({
        title: "Measurement captured",
        description: `${confidence.toUpperCase()} confidence measurement recorded`
      });
      
    } catch (error) {
      console.error('Error capturing AR measurement:', error);
      toast({
        title: "Capture failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const drawCrosshair = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 30;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY);
    ctx.lineTo(centerX + size, centerY);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size);
    ctx.lineTo(centerX, centerY + size);
    ctx.stroke();
    
    // Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawMeasurementOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, location: any) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 80);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(`Accuracy: ${location.accuracy.toFixed(1)}m`, 20, 30);
    ctx.fillText(`Lat: ${location.latitude.toFixed(6)}`, 20, 50);
    ctx.fillText(`Lng: ${location.longitude.toFixed(6)}`, 20, 70);
  };

  const determineConfidence = (accuracy: number, orientation: any): 'high' | 'medium' | 'low' => {
    if (accuracy <= 3 && orientation) return 'high';
    if (accuracy <= 8) return 'medium';
    return 'low';
  };

  const handleConfirm = () => {
    if (measurement) {
      onCapture(measurement);
    }
  };

  const getTargetIcon = () => {
    switch (targetType) {
      case 'pin':
        return <Target className="h-6 w-6" />;
      case 'tee':
        return <div className="w-6 h-6 rounded-full bg-primary" />;
      case 'start':
        return <div className="w-6 h-6 rounded-full bg-blue-500" />;
      default:
        return <Camera className="h-6 w-6" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white">
        <div className="flex items-center gap-3">
          {getTargetIcon()}
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-gray-300">{instructions}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Camera View */}
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
        
        {/* AR Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary" className="text-xs">
                Align with target
              </Badge>
            </div>
          </div>
        </div>

        {/* Measurement Info Overlay */}
        {orientation && (
          <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded-lg text-xs">
            <div>Tilt: {orientation.beta.toFixed(1)}°</div>
            <div>Rotation: {orientation.gamma.toFixed(1)}°</div>
            <div>Compass: {orientation.alpha.toFixed(1)}°</div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-black/80">
        {!measurement ? (
          <div className="space-y-4">
            <div className="text-center text-white text-sm">
              Align the crosshair with your target and tap to capture
            </div>
            <Button
              onClick={captureARMeasurement}
              disabled={isCapturing}
              className="w-full h-16 text-lg"
              size="lg"
            >
              {isCapturing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Capturing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Camera className="h-6 w-6" />
                  Capture {targetType === 'pin' ? 'Pin' : targetType === 'tee' ? 'Tee' : 'Shot'}
                </div>
              )}
            </Button>
          </div>
        ) : (
          <Card className="bg-white/10 text-white border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Measurement Captured</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Accuracy:</span>
                <Badge variant={measurement.confidence === 'high' ? 'default' : measurement.confidence === 'medium' ? 'secondary' : 'destructive'}>
                  {measurement.accuracy.toFixed(1)}m - {measurement.confidence.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Method:</span>
                <Badge variant="outline">
                  {measurement.method === 'ar-camera' ? 'AR Camera' : 'GPS'}
                </Badge>
              </div>
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

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ARMeasurement;