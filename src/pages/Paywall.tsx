import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Sparkles, 
  Zap, 
  Camera, 
  ListChecks, 
  Heart, 
  ShoppingCart,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { 
    icon: Zap, 
    title: "Sugestões ilimitadas",
    description: "Sem limite semanal de receitas"
  },
  { 
    icon: Camera, 
    title: "Foto dos ingredientes",
    description: "Tire uma foto e deixe a IA identificar"
  },
  { 
    icon: ListChecks, 
    title: "Modo Cozinhar Comigo",
    description: "Acompanhamento passo a passo"
  },
  { 
    icon: Heart, 
    title: "Favoritos ilimitados",
    description: "Salve quantas receitas quiser"
  },
  { 
    icon: ShoppingCart, 
    title: "Lista de compras",
    description: "Saiba exatamente o que falta"
  },
  { 
    icon: Sparkles, 
    title: "Sem anúncios",
    description: "Experiência limpa e focada"
  },
];

export default function Paywall() {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // Demo: Navigate back
    console.log("Subscribe clicked");
    navigate("/app/chat");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="relative gradient-hero text-primary-foreground px-4 pt-4 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center mb-8 hover:bg-primary-foreground/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10" />
          </div>
          <h1 className="font-display font-bold text-3xl mb-2">
            Cozinha.ai Pro
          </h1>
          <p className="text-primary-foreground/80">
            Desbloqueie todo o potencial da sua cozinha
          </p>
        </div>
      </header>

      {/* Benefits */}
      <main className="flex-1 px-4 -mt-8">
        <div className="bg-card rounded-3xl shadow-elevated p-6 max-w-md mx-auto">
          <ul className="space-y-4 mb-8">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{benefit.title}</p>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Pricing */}
          <div className="text-center py-6 border-t border-b border-border">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-display font-bold text-foreground">R$14,99</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Comece com 7 dias grátis
            </p>
          </div>

          {/* What's included */}
          <div className="py-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Incluso no teste grátis:</p>
            <ul className="space-y-1.5">
              {["Acesso a todos os recursos Pro", "Cancele a qualquer momento", "Sem compromisso"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 bg-card border-t border-border safe-area-bottom">
        <div className="max-w-md mx-auto space-y-3">
          <Button 
            variant="hero" 
            size="xl" 
            className="w-full"
            onClick={handleSubscribe}
          >
            Ativar 7 dias grátis
          </Button>
          
          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com a cobrança automática após o período de teste.
            Cancele a qualquer momento nas configurações.
          </p>
        </div>
      </footer>
    </div>
  );
}
