import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import Paywall from "./pages/Paywall";
import NotFound from "./pages/NotFound";

// Layouts
import { AppLayout } from "./layouts/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/paywall" element={<Paywall />} />
          
          {/* App routes with bottom nav */}
          <Route path="/app" element={<AppLayout />}>
            <Route path="chat" element={<Chat />} />
            <Route path="pantry" element={<Pantry />} />
            <Route path="saved" element={<Saved />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Full-screen recipe routes */}
          <Route path="/app/recipe/:id" element={<Recipe />} />
          <Route path="/app/cook/:id" element={<Cook />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
