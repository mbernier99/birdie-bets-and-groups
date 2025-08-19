import React, { useState } from 'react';
import { Target, MapPin, Camera, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ARMeasurement, { ARMeasurement as ARMeasurementType } from './ARMeasurement';

interface ReferencePoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  photoUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
  method?: 'ar-camera' | 'gps-fallback';
  deviceOrientation?: {
    alpha: number;
    beta: number;
    gamma: number;
  };
}

interface ReferencePointManagerProps {
  gameMode: 'ctp' | 'long-drive';
  referencePoints: {
    pin?: ReferencePoint;
    tee?: ReferencePoint;
    start?: ReferencePoint;
  };
  onReferencePointSet: (type: 'pin' | 'tee' | 'start', measurement: ARMeasurementType) => void;
  isHost: boolean;
}

const ReferencePointManager: React.FC<ReferencePointManagerProps> = ({
  gameMode,
  referencePoints,
  onReferencePointSet,
  isHost
}) => {
  const [showARCapture, setShowARCapture] = useState<'pin' | 'tee' | 'start' | null>(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState<ReferencePoint | null>(null);

  const handleReferenceCapture = (type: 'pin' | 'tee' | 'start') => (measurement: ARMeasurementType) => {
    onReferencePointSet(type, measurement);
    setShowARCapture(null);
  };

  const getInstructions = (type: 'pin' | 'tee' | 'start') => {
    switch (type) {
      case 'pin':
        return "Align your camera with the flag/pin and capture for precise pin location";
      case 'tee':
        return "Align your camera with the tee box markers and capture the starting position";
      case 'start':
        return "Align your camera with the starting point for closest to pin shots";
      default:
        return "Align your camera with the target and capture";
    }
  };

  const getTitle = (type: 'pin' | 'tee' | 'start') => {
    switch (type) {
      case 'pin':
        return "Set Pin Location";
      case 'tee':
        return "Set Tee Location";
      case 'start':
        return "Set Start Point";
      default:
        return "Set Reference Point";
    }
  };

  if (showARCapture) {
    return (
      <ARMeasurement
        onCapture={handleReferenceCapture(showARCapture)}
        onCancel={() => setShowARCapture(null)}
        targetType={showARCapture}
        title={getTitle(showARCapture)}
        instructions={getInstructions(showARCapture)}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Reference Points
            {isHost && <Badge variant="secondary" className="text-xs">Host Controls</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {gameMode === 'ctp' && (
            <>
              {/* Start Point for CTP */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Start Point</div>
                    <div className="text-sm text-muted-foreground">
                      {referencePoints.start 
                        ? `Set • ${referencePoints.start.confidence?.toUpperCase() || 'MEDIUM'} accuracy`
                        : 'Not set'
                      }
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {referencePoints.start?.photoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPhotoDialog(referencePoints.start!)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {isHost && (
                    <Button
                      variant={referencePoints.start ? "outline" : "default"}
                      size="sm"
                      onClick={() => setShowARCapture('start')}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      {referencePoints.start ? 'Update' : 'Set'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Pin Location */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Pin Location</div>
                    <div className="text-sm text-muted-foreground">
                      {referencePoints.pin 
                        ? `Set • ${referencePoints.pin.confidence?.toUpperCase() || 'MEDIUM'} accuracy`
                        : 'Not set'
                      }
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {referencePoints.pin?.photoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPhotoDialog(referencePoints.pin!)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {isHost && (
                    <Button
                      variant={referencePoints.pin ? "outline" : "default"}
                      size="sm"
                      onClick={() => setShowARCapture('pin')}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      {referencePoints.pin ? 'Update' : 'Set'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {gameMode === 'long-drive' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-orange-600" />
                </div>
                <div>
                  <div className="font-medium">Tee Location</div>
                  <div className="text-sm text-muted-foreground">
                    {referencePoints.tee 
                      ? `Set • ${referencePoints.tee.confidence?.toUpperCase() || 'MEDIUM'} accuracy`
                      : 'Not set'
                    }
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {referencePoints.tee?.photoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPhotoDialog(referencePoints.tee!)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {isHost && (
                  <Button
                    variant={referencePoints.tee ? "outline" : "default"}
                    size="sm"
                    onClick={() => setShowARCapture('tee')}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    {referencePoints.tee ? 'Update' : 'Set'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {!isHost && (
            <div className="text-center text-sm text-muted-foreground py-2">
              Only the host can set reference points
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Dialog */}
      <Dialog open={!!showPhotoDialog} onOpenChange={() => setShowPhotoDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reference Point Photo</DialogTitle>
          </DialogHeader>
          {showPhotoDialog?.photoUrl && (
            <div className="space-y-4">
              <img
                src={showPhotoDialog.photoUrl}
                alt="Reference point"
                className="w-full rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Accuracy</div>
                  <div className="text-muted-foreground">
                    {showPhotoDialog.accuracy?.toFixed(1) || '0'}m
                  </div>
                </div>
                <div>
                  <div className="font-medium">Confidence</div>
                  <div className="text-muted-foreground">
                    {showPhotoDialog.confidence?.toUpperCase() || 'MEDIUM'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Method</div>
                  <div className="text-muted-foreground">
                    {showPhotoDialog.method === 'ar-camera' ? 'AR Camera' : 'GPS'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Time</div>
                  <div className="text-muted-foreground">
                    {new Date(showPhotoDialog.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReferencePointManager;