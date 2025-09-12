import React, { useState } from 'react';
import { Camera, Eye, Award, Users, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CourseReferencePoint, ReferencePointBet, PhotoVerification } from '@/types/course';
import useEnhancedMobileFeatures from '@/hooks/useEnhancedMobileFeatures';

interface PhotoVerificationBettingProps {
  tournamentId: string;
  holeNumber: number;
  referencePoints: CourseReferencePoint[];
  existingBets: ReferencePointBet[];
  currentPlayerId: string;
  onBetCreated: (bet: ReferencePointBet) => void;
  onPhotoVerificationSubmitted: (verification: PhotoVerification) => void;
}

const PhotoVerificationBetting: React.FC<PhotoVerificationBettingProps> = ({
  tournamentId,
  holeNumber,
  referencePoints,
  existingBets,
  currentPlayerId,
  onBetCreated,
  onPhotoVerificationSubmitted
}) => {
  const [isCreatingBet, setIsCreatingBet] = useState(false);
  const [newBetData, setNewBetData] = useState({
    referencePointId: '',
    betType: 'closest_to_reference' as const,
    amount: 10,
    description: ''
  });
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const { toast } = useToast();
  const { takeEnhancedPhoto, isMobile, cameraPermission } = useEnhancedMobileFeatures();

  const handleCreateBet = () => {
    const selectedReference = referencePoints.find(p => p.id === newBetData.referencePointId);
    if (!selectedReference) {
      toast({
        title: "No Reference Point Selected",
        description: "Please select a reference point for the bet.",
        variant: "destructive"
      });
      return;
    }

    const bet: ReferencePointBet = {
      id: crypto.randomUUID(),
      tournamentId,
      holeNumber,
      referencePointId: newBetData.referencePointId,
      betType: newBetData.betType,
      description: newBetData.description || `${newBetData.betType === 'closest_to_reference' ? 'Closest to' : 'Over/Under'} ${selectedReference.name}`,
      amount: newBetData.amount,
      participants: [currentPlayerId],
      status: 'open',
      createdAt: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
    };

    onBetCreated(bet);
    setIsCreatingBet(false);
    setNewBetData({
      referencePointId: '',
      betType: 'closest_to_reference',
      amount: 10,
      description: ''
    });

    toast({
      title: "Bet Created",
      description: `${bet.description} - $${bet.amount} bet is now open for participation.`
    });
  };

  const handlePhotoVerification = async (betId: string) => {
    try {
      const photo = await takeEnhancedPhoto({
        quality: 0.8,
        allowEditing: false,
        resultType: 'dataUrl' as any
      });

      if (photo) {
        setCapturedPhoto(photo);
        
        const verification: PhotoVerification = {
          id: crypto.randomUUID(),
          shotId: betId, // In this context, using bet ID
          playerId: currentPlayerId,
          photoUrl: photo,
          referencePointsVisible: [newBetData.referencePointId], // Would be detected in practice
          timestamp: Date.now(),
          verified: false
        };

        onPhotoVerificationSubmitted(verification);
        setCapturedPhoto(null);

        toast({
          title: "Photo Submitted",
          description: "Your verification photo has been submitted for review."
        });
      }
    } catch (error) {
      toast({
        title: "Photo Capture Failed",
        description: "Unable to capture verification photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getReferencePointIcon = (type: string) => {
    switch (type) {
      case 'fairway_marker': return '📏';
      case 'pin': return '🏁';
      case 'tee_marker': return '🏌️';
      case 'sprinkler_head': return '💧';
      default: return '📍';
    }
  };

  const getTimeRemaining = (expiresAt: number) => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';
    
    const minutes = Math.floor(remaining / (1000 * 60));
    if (minutes < 60) return `${minutes}m remaining`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m remaining`;
  };

  return (
    <div className="space-y-4">
      {/* Create New Bet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Reference Point Betting
            <Badge variant="outline">Hole {holeNumber}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Create precision bets using course reference points with photo verification for close calls.
          </div>

          <Dialog open={isCreatingBet} onOpenChange={setIsCreatingBet}>
            <DialogTrigger asChild>
              <Button className="w-full" disabled={referencePoints.length === 0}>
                <Award className="h-4 w-4 mr-2" />
                Create Reference Point Bet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Reference Point Bet</DialogTitle>
                <DialogDescription>
                  Set up a precision bet using a known reference point on the course
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reference Point</Label>
                  <Select
                    value={newBetData.referencePointId}
                    onValueChange={(value) => setNewBetData(prev => ({ ...prev, referencePointId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a reference point" />
                    </SelectTrigger>
                    <SelectContent>
                      {referencePoints.map((point) => (
                        <SelectItem key={point.id} value={point.id}>
                          <div className="flex items-center gap-2">
                            <span>{getReferencePointIcon(point.type)}</span>
                            <span>{point.name}</span>
                            {point.coordinates.accuracy && (
                              <Badge variant="secondary" className="text-xs">
                                ±{point.coordinates.accuracy.toFixed(1)}m
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bet Type</Label>
                  <Select
                    value={newBetData.betType}
                    onValueChange={(value: any) => setNewBetData(prev => ({ ...prev, betType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="closest_to_reference">
                        Closest to Reference Point
                      </SelectItem>
                      <SelectItem value="over_under_reference">
                        Over/Under Distance to Reference
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bet Amount ($)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={newBetData.amount}
                    onChange={(e) => setNewBetData(prev => ({ ...prev, amount: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newBetData.description}
                    onChange={(e) => setNewBetData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Custom description for this bet..."
                    rows={2}
                  />
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-sm text-yellow-800">
                    <strong>Photo Verification:</strong> Close calls (within 3 feet) will require photo evidence with the reference point visible.
                  </div>
                </div>

                <Button
                  onClick={handleCreateBet}
                  disabled={!newBetData.referencePointId}
                  className="w-full"
                >
                  Create Bet - ${newBetData.amount}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {referencePoints.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No reference points available for this hole.</p>
              <p className="text-sm">Ask the tournament host to add course reference points.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Bets */}
      {existingBets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Reference Point Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingBets.map((bet) => {
                const referencePoint = referencePoints.find(p => p.id === bet.referencePointId);
                const isParticipant = bet.participants.includes(currentPlayerId);
                const isExpired = bet.expiresAt ? Date.now() > bet.expiresAt : false;
                
                return (
                  <div key={bet.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {referencePoint && (
                          <span className="text-lg">{getReferencePointIcon(referencePoint.type)}</span>
                        )}
                        <div>
                          <div className="font-medium">{bet.description}</div>
                          <div className="text-sm text-muted-foreground">
                            ${bet.amount} • {bet.participants.length} participant{bet.participants.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={bet.status === 'open' ? 'default' : bet.status === 'resolved' ? 'secondary' : 'destructive'}>
                          {bet.status.toUpperCase()}
                        </Badge>
                        {bet.expiresAt && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {getTimeRemaining(bet.expiresAt)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isParticipant && bet.status === 'open' && !isExpired && (
                        <Button size="sm" variant="outline">
                          <Users className="h-4 w-4 mr-1" />
                          Join Bet
                        </Button>
                      )}
                      
                      {isParticipant && bet.status === 'open' && isMobile && cameraPermission === 'granted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePhotoVerification(bet.id)}
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          Submit Photo
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Reference Points */}
      {referencePoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Available Reference Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {referencePoints.map((point) => (
                <div key={point.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getReferencePointIcon(point.type)}</span>
                    <div>
                      <div className="font-medium text-sm">{point.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Accuracy: ±{point.coordinates.accuracy?.toFixed(1) || '3.0'}m
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
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

export default PhotoVerificationBetting;