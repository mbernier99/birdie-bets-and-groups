import React, { useState } from 'react';
import { Target, MapPin, Camera, Eye, Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import EnhancedARMeasurement, { EnhancedARMeasurement as EnhancedARMeasurementType } from './EnhancedARMeasurement';

interface ReferencePoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  photoUrl?: string;
  confidence?: 'high' | 'medium' | 'low';
  method?: 'enhanced-ar' | 'ar-camera' | 'gps-multi-sample' | 'gps-fallback';
  deviceOrientation?: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  // Enhanced properties
  measurements?: any[];
  averagedAccuracy?: number;
  stabilityScore?: number;
  heightEstimate?: number;
}

interface EnhancedReferencePointManagerProps {
  gameMode: 'ctp' | 'long-drive';
  referencePoints: {
    pin?: ReferencePoint;
    tee?: ReferencePoint;
    start?: ReferencePoint;
  };
  onReferencePointSet: (type: 'pin' | 'tee' | 'start', measurement: EnhancedARMeasurementType) => void;
  isHost: boolean;
}

const EnhancedReferencePointManager: React.FC<EnhancedReferencePointManagerProps> = ({
  gameMode,
  referencePoints,
  onReferencePointSet,
  isHost
}) => {
  const [showARCapture, setShowARCapture] = useState<'pin' | 'tee' | 'start' | null>(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState<ReferencePoint | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState<ReferencePoint | null>(null);

  const handleReferenceCapture = (type: 'pin' | 'tee' | 'start') => (measurement: EnhancedARMeasurementType) => {
    onReferencePointSet(type, measurement);
    setShowARCapture(null);
  };

  const getInstructions = (type: 'pin' | 'tee' | 'start') => {
    switch (type) {
      case 'pin':
        return "Align your camera with the flag/pin and capture. Use zoom if needed for precise alignment.";
      case 'tee':
        return "Align your camera with the tee box markers and capture the starting position.";
      case 'start':
        return "Align your camera with the starting point for closest to pin shots.";
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

  const getQualityScore = (point: ReferencePoint): number => {
    let score = 0;
    
    // Accuracy score (0-40)
    if (point.accuracy && point.accuracy <= 2) score += 40;
    else if (point.accuracy && point.accuracy <= 5) score += 30;
    else if (point.accuracy && point.accuracy <= 10) score += 20;
    else score += 10;
    
    // Confidence score (0-30)
    if (point.confidence === 'high') score += 30;
    else if (point.confidence === 'medium') score += 20;
    else score += 10;
    
    // Method score (0-30)
    if (point.method === 'enhanced-ar') score += 30;
    else if (point.method === 'ar-camera') score += 20;
    else score += 10;
    
    return score;
  };

  const getQualityColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (point: ReferencePoint) => {
    const score = getQualityScore(point);
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Fair</Badge>;
  };

  const calculateSetupProgress = (): number => {
    if (gameMode === 'ctp') {
      const startSet = referencePoints.start ? 50 : 0;
      const pinSet = referencePoints.pin ? 50 : 0;
      return startSet + pinSet;
    } else {
      return referencePoints.tee ? 100 : 0;
    }
  };

  if (showARCapture) {
    return (
      <EnhancedARMeasurement
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
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Enhanced Reference Points
            {isHost && <Badge variant="secondary" className="text-xs">Host Controls</Badge>}
          </CardTitle>
          {isHost && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Setup Progress</span>
                <span>{calculateSetupProgress()}%</span>
              </div>
              <Progress value={calculateSetupProgress()} />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {gameMode === 'ctp' && (
            <>
              {/* Start Point for CTP */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Start Point
                      {referencePoints.start && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {referencePoints.start 
                        ? `±${referencePoints.start.accuracy?.toFixed(1) || '5.0'}m accuracy`
                        : 'Not set'
                      }
                    </div>
                    {referencePoints.start && (
                      <div className="mt-1">
                        {getQualityBadge(referencePoints.start)}
                      </div>
                    )}
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
                  {referencePoints.start && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetailsDialog(referencePoints.start!)}
                    >
                      Details
                    </Button>
                  )}
                  {isHost && (
                    <Button
                      variant={referencePoints.start ? "outline" : "default"}
                      size="sm"
                      onClick={() => setShowARCapture('start')}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      {referencePoints.start ? 'Update' : 'Set'}
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Pin Location */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      Pin Location
                      {referencePoints.pin && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {referencePoints.pin 
                        ? `±${referencePoints.pin.accuracy?.toFixed(1) || '5.0'}m accuracy`
                        : 'Not set'
                      }
                    </div>
                    {referencePoints.pin && (
                      <div className="mt-1">
                        {getQualityBadge(referencePoints.pin)}
                      </div>
                    )}
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
                  {referencePoints.pin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetailsDialog(referencePoints.pin!)}
                    >
                      Details
                    </Button>
                  )}
                  {isHost && (
                    <Button
                      variant={referencePoints.pin ? "outline" : "default"}
                      size="sm"
                      onClick={() => setShowARCapture('pin')}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      {referencePoints.pin ? 'Update' : 'Set'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {gameMode === 'long-drive' && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-orange-600" />
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    Tee Location
                    {referencePoints.tee && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {referencePoints.tee 
                      ? `±${referencePoints.tee.accuracy?.toFixed(1) || '5.0'}m accuracy`
                      : 'Not set'
                    }
                  </div>
                  {referencePoints.tee && (
                    <div className="mt-1">
                      {getQualityBadge(referencePoints.tee)}
                    </div>
                  )}
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
                {referencePoints.tee && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailsDialog(referencePoints.tee!)}
                  >
                    Details
                  </Button>
                )}
                {isHost && (
                  <Button
                    variant={referencePoints.tee ? "outline" : "default"}
                    size="sm"
                    onClick={() => setShowARCapture('tee')}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    {referencePoints.tee ? 'Update' : 'Set'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {!isHost && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-700 font-medium">
                Only the host can set reference points
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Enhanced AR measurements will be available once setup is complete
              </div>
            </div>
          )}

          {/* Enhanced Features Info */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-700">
                <div className="font-medium mb-1">Enhanced AR Features Active</div>
                <div>Multi-sample GPS • Sensor fusion • Outlier detection • Photo overlays</div>
              </div>
            </div>
          </div>
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
                    ±{showPhotoDialog.accuracy?.toFixed(1) || '0'}m
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
                    {showPhotoDialog.method === 'enhanced-ar' ? 'Enhanced AR' :
                     showPhotoDialog.method === 'ar-camera' ? 'AR Camera' : 'GPS'}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Quality</div>
                  <div className={getQualityColor(getQualityScore(showPhotoDialog))}>
                    {getQualityScore(showPhotoDialog)}/100
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!showDetailsDialog} onOpenChange={() => setShowDetailsDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Measurement Details</DialogTitle>
          </DialogHeader>
          {showDetailsDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Coordinates</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    {showDetailsDialog.latitude.toFixed(7)}, {showDetailsDialog.longitude.toFixed(7)}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Quality Score</div>
                  <div className={getQualityColor(getQualityScore(showDetailsDialog))}>
                    {getQualityScore(showDetailsDialog)}/100
                  </div>
                </div>
                {showDetailsDialog.stabilityScore && (
                  <div>
                    <div className="font-medium">Stability</div>
                    <div className="text-muted-foreground">
                      {showDetailsDialog.stabilityScore.toFixed(0)}%
                    </div>
                  </div>
                )}
                <div>
                  <div className="font-medium">Timestamp</div>
                  <div className="text-muted-foreground">
                    {new Date(showDetailsDialog.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              
              {showDetailsDialog.measurements && (
                <div>
                  <div className="font-medium text-sm mb-2">Sample Details</div>
                  <div className="text-xs text-muted-foreground">
                    {showDetailsDialog.measurements.length} GPS samples averaged
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedReferencePointManager;