
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Tournaments from "./pages/Tournaments";
import Tracker from "./pages/Tracker";
import GolfTracker from "./pages/GolfTracker";
import GolfRules from "./pages/GolfRules";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import TournamentLobby from "./pages/TournamentLobby";
import LiveTournament from "./pages/LiveTournament";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/tournaments" element={
              <ProtectedRoute>
                <Tournaments />
              </ProtectedRoute>
            } />
            <Route path="/tracker" element={
              <ProtectedRoute>
                <Tracker />
              </ProtectedRoute>
            } />
            <Route path="/golf" element={
              <ProtectedRoute>
                <GolfTracker />
              </ProtectedRoute>
            } />
            <Route path="/rules" element={<GolfRules />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/tournament/:id/lobby" element={
              <ProtectedRoute>
                <TournamentLobby />
              </ProtectedRoute>
            } />
            <Route path="/tournament/:id/live" element={
              <ProtectedRoute>
                <LiveTournament />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
