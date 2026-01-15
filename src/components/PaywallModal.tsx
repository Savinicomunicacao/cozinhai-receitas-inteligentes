import { X, Check, Sparkles, Zap, Camera, ListChecks, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  reason?: "limit" | "feature";
}

const benefits = [
  { icon: Zap, text: "Sugestões ilimitadas" },
  { icon: Camera, text: "Escanear receitas de livros" },
  { icon: ListChecks, text: "Pastas para organizar receitas" },
  { icon: Heart, text: "Favoritos ilimitados" },
  { icon: Sparkles, text: "Sem anúncios" },
];

export function PaywallModal({ open, onClose, onSubscribe, reason = "limit" }: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="bg-foreground/40 backdrop-blur-sm" />
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="bg-card rounded-3xl overflow-hidden animate-slide-up">
          {/* Header with gradient */}
          <div className="gradient-hero px-6 pt-8 pb-12 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/80 hover:bg-primary-foreground/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <h2 className="font-display text-2xl font-bold text-primary-foreground mb-2">
              Cozinha.ai Pro
            </h2>
            <p className="text-primary-foreground/80">
              {reason === "limit" 
                ? "Você atingiu o limite semanal"
                : "Este recurso é exclusivo Pro"
              }
            </p>
          </div>

          {/* Benefits */}
          <div className="px-6 py-6 -mt-6 bg-card rounded-t-3xl relative z-10">
            <ul className="space-y-4 mb-6">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-[15px] text-foreground">{benefit.text}</span>
                </li>
              ))}
            </ul>

            {/* Pricing */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-display font-bold text-foreground">R$14,99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                7 dias grátis • Cancele quando quiser
              </p>
            </div>

            {/* CTA */}
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full"
              onClick={onSubscribe}
            >
              Ativar teste grátis
            </Button>

            <button 
              onClick={onClose}
              className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
            >
              Continuar com plano gratuito
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
