import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Chat from "./pages/Chat";
import Pantry from "./pages/Pantry";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Recipe from "./pages/Recipe";
import Cook from "./pages/Cook";
import History from "./pages/History";
import Paywall from "./pages/Paywall";
import NotFound from "./pages/NotFound";

// Layouts
import { AppLayout } from "./layouts/AppLayout";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user needs onboarding
  if (profile && !profile.has_completed_onboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Onboarding route - only show if user hasn't completed onboarding
function OnboardingRoute() {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If already completed onboarding, go to chat
  if (profile?.has_completed_onboarding) {
    return <Navigate to="/app/chat" replace />;
  }

  return <Onboarding />;
}

// Auth route - redirect to app if already logged in
function AuthRoute() {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (user) {
    // Check onboarding status
    if (profile && !profile.has_completed_onboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/app/chat" replace />;
  }

  return <Auth />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthRoute />} />
      <Route path="/onboarding" element={<OnboardingRoute />} />
      <Route path="/paywall" element={<Paywall />} />
      
      {/* App routes with bottom nav */}
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="chat" element={<Chat />} />
        <Route path="pantry" element={<Pantry />} />
        <Route path="saved" element={<Saved />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Full-screen routes */}
      <Route path="/app/recipe/:id" element={<ProtectedRoute><Recipe /></ProtectedRoute>} />
      <Route path="/app/cook/:id" element={<ProtectedRoute><Cook /></ProtectedRoute>} />
      <Route path="/app/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
