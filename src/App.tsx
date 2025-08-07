
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MockAuthProvider } from "./contexts/MockAuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { PageSkeleton } from "./components/ui/loading-skeleton";
import ProtectedRoute from "./components/ProtectedRoute";
import MockUserSwitcher from "./components/MockUserSwitcher";

// Lazy load pages for code splitting
const Index = React.lazy(() => import("./pages/Index"));
const Tournaments = React.lazy(() => import("./pages/Tournaments"));
const Tracker = React.lazy(() => import("./pages/Tracker"));
const GolfTracker = React.lazy(() => import("./pages/GolfTracker"));
const GolfRules = React.lazy(() => import("./pages/GolfRules"));

const Auth = React.lazy(() => import("./pages/Auth"));
const TournamentLobby = React.lazy(() => import("./pages/TournamentLobby"));
const LiveTournament = React.lazy(() => import("./pages/LiveTournament"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Quick Bet pages
const QuickBetHome = React.lazy(() => import("./pages/QuickBetHome"));
const QuickBetRoom = React.lazy(() => import("./pages/QuickBetRoom"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except for 408, 429
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MockAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <MockUserSwitcher />
            <BrowserRouter>
              <Suspense fallback={<PageSkeleton />}>
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
                  {/* Quick Bet (no auth required) */}
                  <Route path="/quick-bet" element={<QuickBetHome />} />
                  <Route path="/quick-bet/:roomId" element={<QuickBetRoom />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </MockAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
