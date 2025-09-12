import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useQuickBetRoom, QuickBetMode, LocationRef } from "@/hooks/useQuickBetRoom";
import { useOptimizedGPS } from "@/hooks/useOptimizedGPS";
import { calculateDistance } from "@/utils/gpsCalculations";
import { Plus } from "lucide-react";
import InviteSheet from "@/components/quickbet/InviteSheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EnhancedReferencePointManager from "@/components/ar/EnhancedReferencePointManager";
import EnhancedShotTracker from "@/components/ar/EnhancedShotTracker";
import { ARMeasurement } from "@/components/ar/ARMeasurement";
import { EnhancedARMeasurement } from "@/components/ar/EnhancedARMeasurement";

function metersToYards(m: number) {
  return m * 1.09361;
}

interface EnhancedShotData {
  id: string;
  playerId: string;
  playerName: string;
  measurement: EnhancedARMeasurement;
  distanceYards: number;
  timestamp: number;
  ranking: number;
}

const QuickBetRoom: React.FC = () => {
  const { roomId = "" } = useParams();
  const nav = useNavigate();
  const { state: navState } = useLocation();
  const { toast } = useToast();

  const storedName = (typeof window !== "undefined" && localStorage.getItem("qb_name")) || "";
  const [name, setName] = useState(storedName);
  const [amount, setAmountInput] = useState<string>(sessionStorage.getItem(`qb_amount_${roomId}`) || "5");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [namePromptOpen, setNamePromptOpen] = useState(!storedName);

  const isHost = Boolean(sessionStorage.getItem(`qb_host_${roomId}`));

  const { location, getCurrentLocation, requestPermission, isLocationEnabled } = useOptimizedGPS({ accuracy: 'high', mode: 'betting' });

  const {
    participants,
    shots,
    state,
    setMode,
    setAmount,
    setStartLocation,
    setPinLocation,
    setTeeLocation,
    recordShot,
    canRecordShot,
  } = useQuickBetRoom({ roomId, name, isHost });

  useEffect(() => {
    document.title = `Quick Bet • ${roomId}`;
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    if (!canonical.parentElement) document.head.appendChild(canonical);
  }, [roomId]);

  useEffect(() => {
    if (isHost && navState?.mode) {
      setMode(navState.mode as QuickBetMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHost, navState]);

  // Auto-open invite for host on first load
  useEffect(() => {
    if (isHost && !sessionStorage.getItem(`qb_invite_shown_${roomId}`)) {
      setInviteOpen(true);
      sessionStorage.setItem(`qb_invite_shown_${roomId}`, "1");
    }
  }, [isHost, roomId]);

  const handleReferencePointSet = (type: 'pin' | 'tee' | 'start', measurement: EnhancedARMeasurement) => {
    const locationRef: LocationRef = {
      latitude: measurement.latitude,
      longitude: measurement.longitude,
      accuracy: measurement.accuracy,
      timestamp: measurement.timestamp,
      photoUrl: measurement.photoUrl,
      confidence: measurement.confidence,
      method: measurement.method as 'ar-camera' | 'gps-fallback', // Type assertion for compatibility
      deviceOrientation: measurement.deviceOrientation
    };

    if (type === 'pin') {
      setPinLocation(locationRef);
    } else if (type === 'tee') {
      setTeeLocation(locationRef);
    } else if (type === 'start') {
      setStartLocation(locationRef);
    }

    const enhancedInfo = measurement.method === 'enhanced-ar' ? 
      ` • ${measurement.measurements?.length || 0} samples averaged` : '';

    toast({ 
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} location set`,
      description: `${measurement.confidence.toUpperCase()} accuracy measurement${enhancedInfo}`
    });
  };

  const handleShotRecorded = (shotData: EnhancedShotData) => {
    const locationRef: LocationRef = {
      latitude: shotData.measurement.latitude,
      longitude: shotData.measurement.longitude,
      accuracy: shotData.measurement.accuracy,
      timestamp: shotData.measurement.timestamp,
      photoUrl: shotData.measurement.photoUrl,
      confidence: shotData.measurement.confidence,
      method: shotData.measurement.method as 'ar-camera' | 'gps-fallback', // Type assertion for compatibility
      deviceOrientation: shotData.measurement.deviceOrientation
    };

    recordShot(locationRef);
    
    const enhancedInfo = shotData.measurement.method === 'enhanced-ar' ? 
      ` • Stability: ${shotData.measurement.stabilityScore?.toFixed(0) || 0}%` : '';

    toast({ 
      title: "Enhanced shot recorded",
      description: `Distance: ${shotData.distanceYards.toFixed(1)} yards • ${shotData.measurement.confidence.toUpperCase()}${enhancedInfo}`
    });
  };

  const leaderboard = useMemo(() => {
    if (!state.mode) return [] as Array<{ playerName: string; distanceMeters: number; shotId: string; timestamp: number }>;
    if (state.mode === 'ctp') {
      if (!state.pinLocation) return [];
      return shots.map((s) => ({
        playerName: s.playerName,
        shotId: s.id,
        timestamp: s.location.timestamp,
        distanceMeters: calculateDistance({ latitude: s.location.latitude, longitude: s.location.longitude }, { latitude: state.pinLocation.latitude, longitude: state.pinLocation.longitude }),
      })).sort((a, b) => a.distanceMeters - b.distanceMeters);
    }
    // long-drive
    if (!state.teeLocation) return [];
    return shots.map((s) => ({
      playerName: s.playerName,
      shotId: s.id,
      timestamp: s.location.timestamp,
      distanceMeters: calculateDistance({ latitude: state.teeLocation.latitude, longitude: state.teeLocation.longitude }, { latitude: s.location.latitude, longitude: s.location.longitude }),
    })).sort((a, b) => b.distanceMeters - a.distanceMeters);
  }, [shots, state.mode, state.pinLocation, state.teeLocation]);

  

  return (
    <div className="mx-auto max-w-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Room {roomId}</h1>
          <p className="text-muted-foreground text-sm">{state.mode ? (state.mode === 'ctp' ? 'Closest to the Pin' : 'Long Drive') : isHost ? 'Choose a mode to start' : 'Waiting for host...'}</p>
        </div>
        <Button variant="outline" onClick={() => setInviteOpen(true)}>Invite</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Participants <Badge variant="secondary">{participants.length}</Badge></span>
            <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)} aria-label="Invite participants">
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <Badge key={p.key} variant={p.key === (sessionStorage.getItem('qb_client_key') || '') ? 'default' : 'secondary'}>{p.name}</Badge>
          ))}
          {participants.length === 0 && <span className="text-sm text-muted-foreground">No participants yet. Tap + to invite others.</span>}
        </CardContent>
      </Card>

      {isHost && !state.mode && (
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setMode('ctp')}>Closest to the Pin</Button>
          <Button variant="secondary" onClick={() => setMode('long-drive')}>Long Drive</Button>
        </div>
      )}

      {isHost && (
        <Card>
          <CardHeader>
            <CardTitle>Wager</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Input type="number" inputMode="decimal" value={amount} onChange={(e) => { setAmountInput(e.target.value); setAmount(Number(e.target.value || 0)); }} />
            <span className="text-sm text-muted-foreground">per player</span>
          </CardContent>
        </Card>
      )}

      {state.mode && (
        <EnhancedReferencePointManager
          gameMode={state.mode}
          referencePoints={{
            pin: state.pinLocation,
            tee: state.teeLocation,
            start: state.startLocation
          }}
          onReferencePointSet={handleReferencePointSet}
          isHost={isHost}
        />
      )}

      {state.mode && (
        <EnhancedShotTracker
          referencePoints={{
            pin: state.pinLocation,
            tee: state.teeLocation
          }}
          onShotRecorded={handleShotRecorded}
          gameMode={state.mode}
          playerId={name}
          playerName={name}
          recentShots={[]}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboard.length === 0 && (
            <div className="text-sm text-muted-foreground">No shots yet.</div>
          )}
          {leaderboard.map((row, idx) => (
            <div key={row.shotId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={idx === 0 ? 'default' : 'secondary'}>#{idx + 1}</Badge>
                <span>{row.playerName}</span>
              </div>
              <div className="text-sm font-medium">{metersToYards(row.distanceMeters).toFixed(1)} yd</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={() => nav('/quick-bet')}>Leave</Button>
        <div className="text-xs text-muted-foreground">GPS: {isLocationEnabled ? 'Active' : 'Disabled'}</div>
      </div>

      <InviteSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        roomId={roomId}
        mode={state.mode}
        amount={Number(amount) || undefined}
        name={name}
      />

      <Dialog open={namePromptOpen} onOpenChange={setNamePromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your name</DialogTitle>
            <DialogDescription>We’ll show this to others in the room and on the leaderboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                const trimmed = name.trim();
                if (!trimmed) return;
                localStorage.setItem("qb_name", trimmed);
                setName(trimmed);
                setNamePromptOpen(false);
              }}
              disabled={!name.trim()}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickBetRoom;
