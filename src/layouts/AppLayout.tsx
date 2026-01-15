import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
      <BottomNav />
      <InstallPrompt delay={3000} />
    </div>
  );
}
