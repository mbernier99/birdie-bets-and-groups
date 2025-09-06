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
        <h1 className="text-2xl font-semibold">Setup Your Bet</h1>
        <p className="text-muted-foreground">Enter details and invite players to your challenge</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bet Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <Input 
              placeholder="Display name for other players" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Wager Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <Input 
                type="number" 
                inputMode="decimal" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5" 
              />
              <span className="text-sm text-muted-foreground">per player</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Game Type</label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => startRoom("ctp")} 
                className="h-16 flex-col gap-1"
              >
                <Target className="h-5 w-5" />
                <div className="text-xs">Closest to Pin</div>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => startRoom("long-drive")} 
                className="h-16 flex-col gap-1"
              >
                <TrendingUp className="h-5 w-5" />
                <div className="text-xs">Long Drive</div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mb-4">
        <div className="text-sm text-muted-foreground">or</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Join Existing Bet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input 
            placeholder="Enter room code (e.g., ABC123)" 
            value={joinCode} 
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())} 
          />
          <Button onClick={joinRoom} className="w-full">Join Bet Room</Button>
        </CardContent>
      </Card>

      <div className="mt-6 p-3 bg-muted/50 rounded-lg">
        <div className="text-xs text-muted-foreground text-center">
          <div className="font-medium mb-1">Next steps:</div>
          <div>After creating, you'll get a room code to share with friends. Set reference points with AR, then compete!</div>
        </div>
      </div>
    </div>
  );
};

export default QuickBetHome;
