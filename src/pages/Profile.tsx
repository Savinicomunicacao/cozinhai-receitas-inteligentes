import { useNavigate } from "react-router-dom";
import { 
  User, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  Shield, 
  ChevronRight,
  Zap,
  LogOut,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  description?: string;
  action: () => void;
  variant?: "default" | "accent";
}

export default function Profile() {
  const navigate = useNavigate();
  const { profile, signOut, loading } = useAuth();
  
  const usageCount = profile?.weekly_usage_count ?? 0;
  const maxUsage = 7;
  const usagePercentage = (usageCount / maxUsage) * 100;
  const isPro = profile?.is_pro ?? false;

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const menuItems: MenuItem[] = [
    {
      icon: MessageSquare,
      label: "Histórico de Conversas",
      description: "Ver conversas anteriores",
      action: () => navigate("/app/history"),
    },
    {
      icon: Settings,
      label: "Preferências",
      description: "Dieta, equipamentos, tempo",
      action: () => navigate("/onboarding"),
    },
    {
      icon: CreditCard,
      label: "Meu Plano",
      description: isPro ? "Pro ✨" : "Gratuito",
      action: () => navigate("/paywall"),
      variant: "accent",
    },
    {
      icon: HelpCircle,
      label: "Ajuda",
      description: "FAQ e suporte",
      action: () => {},
    },
    {
      icon: Shield,
      label: "Privacidade",
      description: "Termos e políticas",
      action: () => {},
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background pb-24">
      {/* Header */}
      <header className="bg-secondary px-4 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-xl">
              {profile?.name || profile?.email?.split('@')[0] || "Usuária"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPro ? "Plano Pro ✨" : "Plano Gratuito"}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {/* Usage Card - Only show for free users */}
        {!isPro && (
          <div className="card-recipe p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-sm">Uso semanal</p>
                <p className="text-xs text-muted-foreground">
                  {usageCount} de {maxUsage} sugestões usadas
                </p>
              </div>
              <span className="text-2xl font-display font-bold text-primary">
                {maxUsage - usageCount}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Renova toda segunda-feira
            </p>
          </div>
        )}

        {/* Upgrade Banner - Only show for free users */}
        {!isPro && (
          <button
            onClick={() => navigate("/paywall")}
            className="w-full gradient-hero rounded-2xl p-4 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-primary-foreground">
                  Ativar Cozinha.ai Pro
                </p>
                <p className="text-sm text-primary-foreground/80">
                  7 dias grátis • R$14,99/mês
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary-foreground/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        )}

        {/* Pro Badge */}
        {isPro && (
          <div className="w-full gradient-hero rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-primary-foreground">
                  Cozinha.ai Pro ✨
                </p>
                <p className="text-sm text-primary-foreground/80">
                  Você tem acesso ilimitado!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left",
                item.variant === "accent" 
                  ? "bg-accent/10 hover:bg-accent/15" 
                  : "bg-card hover:bg-muted/50 border border-border"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                item.variant === "accent" 
                  ? "bg-accent/20 text-accent" 
                  : "bg-primary/10 text-primary"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.label}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair da conta
        </Button>
      </main>
    </div>
  );
}