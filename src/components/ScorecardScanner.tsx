import React, { useState, useRef } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ScorecardScannerProps {
  onImageCapture: (courseData: any) => void;
  onClose: () => void;
}

const ScorecardScanner: React.FC<ScorecardScannerProps> = ({ onImageCapture, onClose }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please use the upload option instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    try {
      // Convert data URL to File object
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'scorecard.jpg', { type: 'image/jpeg' });
      
      // Create FormData for the Edge Function
      const formData = new FormData();
      formData.append('image', file);
      
      // Call Supabase Edge Function
      const ocrResponse = await fetch('/functions/v1/process-scorecard', {
        method: 'POST',
        body: formData,
      });
      
      const result = await ocrResponse.json();
      
      if (result.success && result.courseData) {
        toast({
          title: "Scorecard processed successfully!",
          description: "Course data has been extracted and populated.",
        });
        
        // Pass the extracted course data to parent
        onImageCapture(result.courseData);
      } else {
        throw new Error(result.error || 'Failed to process scorecard');
      }
      
    } catch (error) {
      console.error('Error processing scorecard:', error);
      toast({
        title: "Processing failed",
        description: "Failed to extract course data. Please try again or enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Scan Scorecard</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!capturedImage && !showCamera && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Take a photo or upload an image of your scorecard to automatically extract course information.
              </p>
              <div className="bg-emerald-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-emerald-800 mb-2">For best results:</h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Ensure the scorecard is well-lit and flat</li>
                  <li>• Include all hole information in the frame</li>
                  <li>• Avoid shadows and glare</li>
                  <li>• Make sure text is clearly readable</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={startCamera} className="h-24 flex flex-col items-center space-y-2">
                <Camera className="h-8 w-8" />
                <span>Take Photo</span>
              </Button>
              
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="scorecard-upload"
                />
                <Label htmlFor="scorecard-upload">
                  <Button asChild variant="outline" className="h-24 w-full flex flex-col items-center space-y-2">
                    <div>
                      <Upload className="h-8 w-8" />
                      <span>Upload Image</span>
                    </div>
                  </Button>
                </Label>
              </div>
            </div>
          </div>
        )}

        {showCamera && (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={capturePhoto} size="lg">
                <Camera className="h-5 w-5 mr-2" />
                Capture
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured scorecard"
                className="w-full rounded-lg border"
              />
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={processImage} disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Extract Course Data'}
              </Button>
              <Button onClick={resetCapture} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScorecardScanner;
