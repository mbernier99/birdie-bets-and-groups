import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileNavigation from '../components/MobileNavigation';
import MobileHeader from '../components/MobileHeader';
import { 
  Target, 
  Zap, 
  Plus, 
  Users, 
  Clock, 
  Trophy,
  DollarSign,
  Play,
  CheckCircle2
} from 'lucide-react';

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Mock data for active and recent bets
const mockActiveBets = [
  {
    id: "ABC123",
    type: "ctp",
    wager: 10,
    players: 3,
    maxPlayers: 4,
    timeLeft: "12 min",
    status: "active"
  },
  {
    id: "XYZ789",
    type: "long-drive",
    wager: 25,
    players: 2,
    maxPlayers: 6,
    timeLeft: "3 min",
    status: "active"
  }
];

const mockRecentBets = [
  {
    id: "DEF456",
    type: "ctp",
    wager: 15,
    result: "won",
    winnings: 45,
    date: "2 hours ago"
  },
  {
    id: "GHI789",
    type: "long-drive", 
    wager: 20,
    result: "lost",
    winnings: 0,
    date: "Yesterday"
  }
];

const EnhancedQuickBet: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<string>("5");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    document.title = "Quick Bet • Golf Betting Hub";
    const meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Join active golf bets or create new ones. Closest to the Pin, Long Drive, and more.";
      document.head.appendChild(m);
    }

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

  const joinRoom = (code?: string) => {
    const roomCode = code || joinCode.trim().toUpperCase();
    if (roomCode.length < 4) return;
    if (!name.trim()) {
      toast({ title: "Enter your name", description: "We use it in the room and leaderboard.", variant: "destructive" });
      return;
    }
    localStorage.setItem("qb_name", name.trim());
    navigate(`/quick-bet/${roomCode}`);
  };

  const rejoinActiveBet = (betId: string) => {
    navigate(`/quick-bet/${betId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Bet</h1>
          <p className="text-gray-600">Fast golf betting - no signup required</p>
        </div>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="new">New Bet</TabsTrigger>
            <TabsTrigger value="active">Active ({mockActiveBets.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* New Bet Tab */}
          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  placeholder="Display name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <Input 
                    type="number" 
                    inputMode="decimal" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="Wager amount"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => startRoom("ctp")}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-emerald-600" />
                    Closest to Pin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Who can get closest to the pin? Winner takes all.</p>
                  <Button className="w-full">Initiate Bet (${Number(amount) || 0})</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => startRoom("long-drive")}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Long Drive
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">Who can drive it the longest? Distance wins.</p>
                  <Button variant="secondary" className="w-full">Initiate Bet (${Number(amount) || 0})</Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Join a Room
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Input 
                  placeholder="Enter room code" 
                  value={joinCode} 
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())} 
                />
                <Button onClick={() => joinRoom()}>Join</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Bets Tab */}
          <TabsContent value="active" className="space-y-4">
            {mockActiveBets.length > 0 ? (
              mockActiveBets.map((bet) => (
                <Card key={bet.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {bet.type === "ctp" ? (
                          <Target className="h-8 w-8 text-emerald-600" />
                        ) : (
                          <Zap className="h-8 w-8 text-blue-600" />
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {bet.type === "ctp" ? "Closest to Pin" : "Long Drive"}
                          </h3>
                          <p className="text-sm text-gray-600">Room: {bet.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {bet.timeLeft}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          ${bet.wager} • {bet.players}/{bet.maxPlayers} players
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" onClick={() => rejoinActiveBet(bet.id)}>
                        Rejoin
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Active Bets</h3>
                  <p className="text-gray-600">Start a new bet to see it here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {mockRecentBets.map((bet) => (
              <Card key={bet.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {bet.type === "ctp" ? (
                        <Target className="h-6 w-6 text-gray-400" />
                      ) : (
                        <Zap className="h-6 w-6 text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-medium">
                          {bet.type === "ctp" ? "Closest to Pin" : "Long Drive"}
                        </h3>
                        <p className="text-sm text-gray-600">{bet.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {bet.result === "won" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-red-100" />
                        )}
                        <Badge variant={bet.result === "won" ? "default" : "secondary"}>
                          {bet.result === "won" ? `+$${bet.winnings}` : `-$${bet.wager}`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default EnhancedQuickBet;