
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Trophy, Camera, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Press } from '../../types/press';
import { calculateClosestToPin, calculateLongestDrive } from '../../utils/gpsCalculations';

interface BetResolutionPanelProps {
  press: Press;
  players: Array<{ id: string; name: string }>;
  onResolve: (pressId: string, winner: string, measurements: any[]) => void;
  onDispute: (pressId: string, reason: string) => void;
}

const BetResolutionPanel: React.FC<BetResolutionPanelProps> = ({
  press,
  players,
  onResolve,
  onDispute
}) => {
  const [disputeReason, setDisputeReason] = useState('');
  const [showDispute, setShowDispute] = useState(false);

  if (!press.participantShots || press.participantShots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Waiting for Shots</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Waiting for all participants to record their shots for this bet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const calculateResults = () => {
    if (!press.targetLocation || !press.participantShots) return [];

    let results: { playerId: string; distance: number }[] = [];

    switch (press.gameType) {
      case 'closest-to-pin':
        results = calculateClosestToPin(
          press.participantShots.map(shot => ({
            playerId: shot.playerId,
            location: shot.location
          })),
          press.targetLocation
        );
        break;
      case 'longest-drive':
        results = calculateLongestDrive(
          press.participantShots.map(shot => ({
            playerId: shot.playerId,
            location: shot.location
          })),
          press.targetLocation
        );
        break;
    }

    return results.map((result, index) => ({
      ...result,
      rank: index + 1,
      playerName: players.find(p => p.id === result.playerId)?.name || 'Unknown'
    }));
  };

  const results = calculateResults();
  const winner = results[0];
  const allShotsVerified = press.participantShots?.every(shot => shot.verified) || false;
  const canAutoResolve = allShotsVerified && results.length > 0;

  const handleAutoResolve = () => {
    if (!winner || !press.participantShots) return;

    const measurements = results.map(result => ({
      playerId: result.playerId,
      distance: result.distance,
      verified: true
    }));

    onResolve(press.id, winner.playerId, measurements);
  };

  const handleDispute = () => {
    if (!disputeReason.trim()) return;
    onDispute(press.id, disputeReason);
    setDisputeReason('');
    setShowDispute(false);
  };

  const getGameTypeDisplay = (gameType: string) => {
    switch (gameType) {
      case 'closest-to-pin': return 'Closest to Pin';
      case 'longest-drive': return 'Longest Drive';
      case 'first-to-green': return 'First to Green';
      default: return gameType.replace('-', ' ');
    }
  };

  const formatDistance = (distance: number) => {
    return `${distance.toFixed(1)}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>{getGameTypeDisplay(press.gameType)} Resolution</span>
          </div>
          <Badge variant={canAutoResolve ? "default" : "secondary"}>
            ${press.amount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Results */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Results</h4>
          {results.map((result, index) => (
            <div key={result.playerId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-300 text-gray-700'
                }`}>
                  {result.rank}
                </div>
                <span className="font-medium text-sm">{result.playerName}</span>
                {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
              </div>
              <div className="text-sm text-gray-600">
                {formatDistance(result.distance)}
              </div>
            </div>
          ))}
        </div>

        {/* Shot Verification Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Shot Verification</h4>
          {press.participantShots?.map(shot => {
            const player = players.find(p => p.id === shot.playerId);
            return (
              <div key={shot.playerId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{player?.name || 'Unknown'}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    ±{shot.location.accuracy.toFixed(0)}m
                  </span>
                  {shot.verified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {canAutoResolve ? (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Ready to resolve: {winner?.playerName} wins by {formatDistance(winner?.distance || 0)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleAutoResolve}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Resolve Bet
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowDispute(true)}
                  className="flex-1"
                >
                  Dispute
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Waiting for all shots to be verified
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dispute Form */}
        {showDispute && (
          <div className="space-y-2 p-3 border border-gray-200 rounded">
            <h5 className="font-medium text-sm">Dispute Resolution</h5>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Explain why you're disputing these results..."
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={3}
            />
            <div className="flex space-x-2">
              <Button 
                onClick={handleDispute}
                disabled={!disputeReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Submit Dispute
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowDispute(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BetResolutionPanel;
