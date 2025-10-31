import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';

interface PhotoVerificationProps {
  betId: string;
  playerId: string;
  betType: string;
  onPhotoUploaded?: (photoUrl: string) => void;
}

export const PhotoVerification: React.FC<PhotoVerificationProps> = ({
  betId,
  playerId,
  betType,
  onPhotoUploaded
}) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const takePhoto = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Camera } = await import('@capacitor/camera');
        const { CameraResultType, CameraSource } = await import('@capacitor/camera');
        
        const image = await Camera.getPhoto({
          quality: 80,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera
        });

        if (image.dataUrl) {
          setPhoto(image.dataUrl);
        }
      } else {
        // Web: use file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        
        input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        };
        
        input.click();
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      toast({
        title: "Camera error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpload = async () => {
    if (!photo) return;

    setUploading(true);
    try {
      // In a real implementation, you would upload to Supabase Storage here
      // For now, we'll just simulate the upload and call the callback
      
      // Simulated upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Photo uploaded",
        description: "Photo submitted for verification"
      });

      onPhotoUploaded?.(photo);
      setPhoto(null);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Photo Verification</CardTitle>
        <CardDescription>
          {betType === 'closest-to-pin' && 'Take a photo of your ball position relative to the pin'}
          {betType === 'longest-drive' && 'Take a photo of your drive position'}
          {betType === 'first-to-green' && 'Take a photo confirming you reached the green'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {photo ? (
          <div className="relative">
            <img 
              src={photo} 
              alt="Verification" 
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={() => setPhoto(null)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-4">No photo taken yet</p>
            <Button onClick={takePhoto} variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>
        )}

        {photo && (
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Photo
              </>
            )}
          </Button>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <strong>Tip:</strong> Take a clear photo showing the position clearly. 
          The tournament admin will review all photos to determine the winner.
        </div>
      </CardContent>
    </Card>
  );
};
