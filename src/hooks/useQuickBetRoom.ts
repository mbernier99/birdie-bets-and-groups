import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type QuickBetMode = "ctp" | "long-drive";

export interface LocationRef {
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

export interface Shot {
  id: string;
  playerKey: string;
  playerName: string;
  location: LocationRef;
  distanceYards?: number;
}

interface UseQuickBetRoomOptions {
  roomId: string;
  name: string;
  isHost: boolean;
}

interface RoomState {
  mode?: QuickBetMode;
  amount?: number;
  startLocation?: LocationRef; // Common start for CTP
  pinLocation?: LocationRef;   // Target for CTP
  teeLocation?: LocationRef;   // Start for Long Drive
}

export function useQuickBetRoom({ roomId, name, isHost }: UseQuickBetRoomOptions) {
  const [clientKey] = useState(() => {
    const existing = sessionStorage.getItem("qb_client_key");
    if (existing) return existing;
    const k = crypto.randomUUID();
    sessionStorage.setItem("qb_client_key", k);
    return k;
  });

  const [participants, setParticipants] = useState<Array<{ key: string; name: string }>>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [state, setState] = useState<RoomState>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Helpers to broadcast small updates
  const send = (event: string, payload: any) => {
    channelRef.current?.send({ type: "broadcast", event, payload });
  };

  const setMode = (mode: QuickBetMode) => {
    if (!isHost) return;
    setState((s) => ({ ...s, mode }));
    send("mode:set", { mode });
  };
  const setAmount = (amount: number) => {
    if (!isHost) return;
    setState((s) => ({ ...s, amount }));
    send("amount:set", { amount });
  };
  const setStartLocation = (loc: LocationRef) => {
    if (!isHost) return;
    setState((s) => ({ ...s, startLocation: loc }));
    send("start:set", { loc });
  };
  const setPinLocation = (loc: LocationRef) => {
    if (!isHost) return;
    setState((s) => ({ ...s, pinLocation: loc }));
    send("pin:set", { loc });
  };
  const setTeeLocation = (loc: LocationRef) => {
    if (!isHost) return;
    setState((s) => ({ ...s, teeLocation: loc }));
    send("tee:set", { loc });
  };

  const recordShot = (loc: LocationRef) => {
    const shot: Shot = {
      id: crypto.randomUUID(),
      playerKey: clientKey,
      playerName: name,
      location: loc,
    };
    setShots((prev) => [shot, ...prev]);
    send("shot:new", { shot });
  };

  // Derived helpers
  const canRecordShot = useMemo(() => {
    if (!state.mode) return false;
    if (state.mode === "ctp") return Boolean(state.pinLocation);
    if (state.mode === "long-drive") return Boolean(state.teeLocation);
    return false;
  }, [state.mode, state.pinLocation, state.teeLocation]);

  useEffect(() => {
    document.title = `Quick Bet Room • ${roomId}`;
  }, [roomId]);

  useEffect(() => {
    const channel = supabase.channel(`quick_bet:${roomId}` as string, {
      config: {
        broadcast: { self: true },
        presence: { key: clientKey },
      },
    });

    channel
      .on("broadcast", { event: "mode:set" }, ({ payload }) => setState((s) => ({ ...s, mode: payload.mode })))
      .on("broadcast", { event: "amount:set" }, ({ payload }) => setState((s) => ({ ...s, amount: payload.amount })))
      .on("broadcast", { event: "start:set" }, ({ payload }) => setState((s) => ({ ...s, startLocation: payload.loc })))
      .on("broadcast", { event: "pin:set" }, ({ payload }) => setState((s) => ({ ...s, pinLocation: payload.loc })))
      .on("broadcast", { event: "tee:set" }, ({ payload }) => setState((s) => ({ ...s, teeLocation: payload.loc })))
      .on("broadcast", { event: "shot:new" }, ({ payload }) => setShots((prev) => {
        const exists = prev.some((p) => p.id === payload.shot.id);
        return exists ? prev : [payload.shot, ...prev];
      }))
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ name: string }>();
        const list: Array<{ key: string; name: string }> = [];
        Object.entries(state).forEach(([key, metas]) => {
          metas.forEach((m: any) => list.push({ key, name: m.name }));
        });
        setParticipants(list);
      });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ name });
        // Host can re-broadcast current snapshot on subscribe (simple approach)
        if (isHost) {
          if (state.mode) send("mode:set", { mode: state.mode });
          if (state.amount != null) send("amount:set", { amount: state.amount });
          if (state.startLocation) send("start:set", { loc: state.startLocation });
          if (state.pinLocation) send("pin:set", { loc: state.pinLocation });
          if (state.teeLocation) send("tee:set", { loc: state.teeLocation });
          if (shots.length) shots.forEach((shot) => send("shot:new", { shot }));
        }
      }
    });

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  // We intentionally omit `shots` to avoid re-subscribing on every shot.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, name, isHost, clientKey]);

  return {
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
  } as const;
}
