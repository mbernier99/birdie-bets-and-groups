import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Target, TrendingUp } from "lucide-react";

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
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">Quick Bet</h1>
        <p className="text-muted-foreground">Create instant Closest to Pin or Long Drive challenges with friends</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Setup Your Bet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input 
            placeholder="Your display name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input 
              type="number" 
              inputMode="decimal" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5" 
            />
            <span className="text-sm text-muted-foreground">wager per player</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 mb-6">
        <Button onClick={() => startRoom("ctp")} className="w-full h-12 text-left">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5" />
            <div>
              <div className="font-medium">Create Closest to Pin</div>
              <div className="text-xs opacity-75">${amountNum || 0} bet • AR distance tracking</div>
            </div>
          </div>
        </Button>
        <Button onClick={() => startRoom("long-drive")} variant="secondary" className="w-full h-12 text-left">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5" />
            <div>
              <div className="font-medium">Create Long Drive</div>
              <div className="text-xs opacity-75">${amountNum || 0} bet • AR distance tracking</div>
            </div>
          </div>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Join existing bet</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Input 
            placeholder="Room code (e.g., ABC123)" 
            value={joinCode} 
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())} 
          />
          <Button onClick={joinRoom}>Join</Button>
        </CardContent>
      </Card>

      <div className="mt-6 p-3 bg-muted/50 rounded-lg">
        <div className="text-xs text-muted-foreground text-center">
          <div className="font-medium mb-1">How it works:</div>
          <div>1. Create or join a room • 2. Set pin/tee location with AR • 3. Record your shots • 4. See live results</div>
        </div>
      </div>
    </div>
  );
};

export default QuickBetHome;
