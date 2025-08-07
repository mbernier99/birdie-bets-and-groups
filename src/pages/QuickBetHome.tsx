import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const QuickBetHome: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("5");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    document.title = "Quick Bet • Golf CTP & Long Drive";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Create or join quick golf bets: Closest to the Pin and Long Drive.";
      document.head.appendChild(m);
    }
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.href);
    if (!canonical.parentElement) document.head.appendChild(canonical);

    const stored = localStorage.getItem("qb_name");
    if (stored) setName(stored);
  }, []);

  const startRoom = (mode: "ctp" | "long-drive") => {
    if (!name.trim()) {
      toast({ title: "Enter your name", description: "We use it in the room and leaderboard.", variant: "destructive" });
      return;
    }
    localStorage.setItem("qb_name", name.trim());
    const code = generateRoomCode();
    sessionStorage.setItem(`qb_host_${code}`, "1");
    sessionStorage.setItem(`qb_amount_${code}`, amount);
    navigate(`/quick-bet/${code}`, { replace: false, state: { mode } });
  };

  const joinRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) return;
    if (!name.trim()) {
      toast({ title: "Enter your name", description: "We use it in the room and leaderboard.", variant: "destructive" });
      return;
    }
    localStorage.setItem("qb_name", name.trim());
    navigate(`/quick-bet/${code}`);
  };

  const amountNum = useMemo(() => Number(amount) || 0, [amount]);

  return (
    <div className="mx-auto max-w-md p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Quick Bet</h1>
        <p className="text-muted-foreground">Closest to the Pin and Long Drive — no login, no setup.</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex items-center gap-2">
            <Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <span className="text-sm text-muted-foreground">Wager amount</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Button onClick={() => startRoom("ctp")} className="w-full">Create CTP Room (${amountNum || 0})</Button>
        <Button onClick={() => startRoom("long-drive")} variant="secondary" className="w-full">Create Long Drive (${amountNum || 0})</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Join a room</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Input placeholder="Room code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
          <Button onClick={joinRoom}>Join</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickBetHome;
