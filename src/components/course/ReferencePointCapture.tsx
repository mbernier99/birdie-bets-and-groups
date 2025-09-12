import React, { useState, useRef } from 'react';
import { Camera, MapPin, Plus, Save, X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CourseReferencePoint, CourseCoordinate } from '@/types/course';
import useEnhancedMobileFeatures from '@/hooks/useEnhancedMobileFeatures';

interface ReferencePointCaptureProps {
  onReferencePointAdded: (referencePoint: CourseReferencePoint) => void;
  existingPoints?: CourseReferencePoint[];
  holeNumber?: number;
  onClose?: () => void;
}

const ReferencePointCapture: React.FC<ReferencePointCaptureProps> = ({
  onReferencePointAdded,
  existingPoints = [],
  holeNumber,
  onClose
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<CourseCoordinate | null>(null);
  const [referencePointData, setReferencePointData] = useState({
    type: 'fairway_marker' as const,
    name: '',
    description: ''
  });
  const { toast } = useToast();
  const {
    getEnhancedLocation,
    takeEnhancedPhoto,
    isMobile,
    locationPermission,
    cameraPermission
  } = useEnhancedMobileFeatures();

  const handleCapturePhoto = async () => {
    try {
      setIsCapturing(true);
      
      // Get current location with high accuracy
      const location = await getEnhancedLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      
      if (location) {
        setCurrentLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          altitude: location.altitude,
          accuracy: location.accuracy,
          timestamp: Date.now()
        });
      }

      // Take photo with reference point
      const photo = await takeEnhancedPhoto({
        quality: 0.8,
        allowEditing: false,
        resultType: 'dataUrl' as any
      });

      if (photo) {
        setCapturedPhoto(photo);
      }
    } catch (error) {
      console.error('Error capturing reference point:', error);
      toast({
        title: "Capture Failed",
        description: "Unable to capture photo or location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveReferencePoint = () => {
    if (!capturedPhoto || !currentLocation || !referencePointData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please capture a photo, ensure location is available, and enter a name.",
        variant: "destructive"
      });
      return;
    }

    const newReferencePoint: CourseReferencePoint = {
      id: crypto.randomUUID(),
      type: referencePointData.type,
      name: referencePointData.name,
      coordinates: currentLocation,
      description: referencePointData.description,
      photoUrl: capturedPhoto,
      userContributed: true,
      confidenceScore: currentLocation.accuracy ? Math.min(1, 10 / currentLocation.accuracy) : 0.5,
      lastVerified: Date.now(),
      holeNumber
    };

    onReferencePointAdded(newReferencePoint);
    
    toast({
      title: "Reference Point Added",
      description: `${referencePointData.name} has been saved and can be used for precise shot tracking.`
    });

    // Reset form
    setCapturedPhoto(null);
    setCurrentLocation(null);
    setReferencePointData({
      type: 'fairway_marker',
      name: '',
      description: ''
    });
  };

  const getReferenceTypeIcon = (type: string) => {
    switch (type) {
      case 'tee_marker': return '🏌️';
      case 'pin': return '🏁';
      case 'fairway_marker': return '📏';
      case 'sprinkler_head': return '💧';
      case 'cart_path': return '🛤️';
      case 'bunker': return '🏖️';
      case 'tree': return '🌳';
      case 'building': return '🏢';
      default: return '📍';
    }
  };

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return 'secondary';
    if (accuracy <= 3) return 'default'; // High accuracy (green)
    if (accuracy <= 8) return 'secondary'; // Medium accuracy (yellow)
    return 'destructive'; // Low accuracy (red)
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Add Reference Point
              {holeNumber && (
                <Badge variant="outline">Hole {holeNumber}</Badge>
              )}
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Photo Capture Section */}
          <div className="space-y-3">
            <Label>Photo & Location</Label>
            {!capturedPhoto ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <Camera className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Take a photo of the reference point with GPS location
                </p>
                <Button
                  onClick={handleCapturePhoto}
                  disabled={isCapturing || !isMobile || locationPermission !== 'granted' || cameraPermission !== 'granted'}
                  className="flex items-center gap-2"
                >
                  {isCapturing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Capture Reference Point
                    </>
                  )}
                </Button>
                {(!isMobile || locationPermission !== 'granted' || cameraPermission !== 'granted') && (
                  <p className="text-xs text-red-600 mt-2 text-center">
                    Camera and location permissions required
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={capturedPhoto}
                    alt="Reference point"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setCapturedPhoto(null);
                      setCurrentLocation(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {currentLocation && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Location Captured
                      </span>
                    </div>
                    <Badge variant={getAccuracyColor(currentLocation.accuracy)}>
                      ±{currentLocation.accuracy?.toFixed(1) || '5.0'}m
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reference Point Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reference Type</Label>
              <Select
                value={referencePointData.type}
                onValueChange={(value: any) => setReferencePointData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fairway_marker">
                    📏 Fairway Marker (100/150/200 yards)
                  </SelectItem>
                  <SelectItem value="tee_marker">🏌️ Tee Marker</SelectItem>
                  <SelectItem value="pin">🏁 Pin Position</SelectItem>
                  <SelectItem value="sprinkler_head">💧 Sprinkler Head</SelectItem>
                  <SelectItem value="cart_path">🛤️ Cart Path Marker</SelectItem>
                  <SelectItem value="bunker">🏖️ Bunker Edge</SelectItem>
                  <SelectItem value="tree">🌳 Distinctive Tree</SelectItem>
                  <SelectItem value="building">🏢 Building/Structure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Name/Description</Label>
              <Input
                value={referencePointData.name}
                onChange={(e) => setReferencePointData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., 150 Yard Stake"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              value={referencePointData.description}
              onChange={(e) => setReferencePointData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Any helpful details about this reference point..."
              rows={2}
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveReferencePoint}
            disabled={!capturedPhoto || !currentLocation || !referencePointData.name.trim()}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Reference Point
          </Button>
        </CardContent>
      </Card>

      {/* Existing Reference Points */}
      {existingPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Existing Reference Points {holeNumber && `(Hole ${holeNumber})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingPoints
                .filter(point => !holeNumber || point.holeNumber === holeNumber)
                .map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getReferenceTypeIcon(point.type)}</span>
                      <div>
                        <div className="font-medium text-sm">{point.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {point.coordinates.accuracy && (
                            <>±{point.coordinates.accuracy.toFixed(1)}m • </>
                          )}
                          {point.userContributed ? 'User Added' : 'Official'}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getAccuracyColor(point.coordinates.accuracy)}>
                      {(point.confidenceScore || 0.5).toFixed(1)}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferencePointCapture;
