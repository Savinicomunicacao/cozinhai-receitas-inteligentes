import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth after a brief splash
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="animate-fade-in text-center">
        <div className="w-24 h-24 rounded-3xl gradient-hero flex items-center justify-center mx-auto mb-6 shadow-elevated animate-pulse-soft">
          <ChefHat className="w-12 h-12 text-primary-foreground" />
        </div>
        <h1 className="font-display font-bold text-3xl text-foreground mb-2">
          Cozinha.ai
        </h1>
        <p className="text-muted-foreground">
          O que você tem. O que você faz.
        </p>
      </div>
    </div>
  );
}
