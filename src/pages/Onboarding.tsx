import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Target, AlertCircle, Microwave, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  options: {
    id: string;
    label: string;
    emoji?: string;
  }[];
  multiSelect: boolean;
}

const steps: OnboardingStep[] = [
  {
    id: "speed",
    title: "Quanto tempo você tem?",
    description: "Isso ajuda a filtrar receitas pelo tempo de preparo",
    icon: Clock,
    options: [
      { id: "rapida", label: "Rápidas", emoji: "⚡" },
      { id: "normal", label: "Sem pressa", emoji: "🍳" },
    ],
    multiSelect: false,
  },
  {
    id: "goals",
    title: "Seus objetivos",
    description: "Podemos priorizar receitas que se encaixam melhor",
    icon: Target,
    options: [
      { id: "saudavel", label: "Comer mais saudável", emoji: "🥗" },
      { id: "economico", label: "Economizar", emoji: "💰" },
      { id: "variar", label: "Variar o cardápio", emoji: "✨" },
      { id: "pratico", label: "Praticidade", emoji: "⏰" },
    ],
    multiSelect: true,
  },
  {
    id: "restrictions",
    title: "Restrições alimentares",
    description: "Evitaremos esses ingredientes nas sugestões",
    icon: AlertCircle,
    options: [
      { id: "sem-lactose", label: "Sem lactose", emoji: "🥛" },
      { id: "sem-gluten", label: "Sem glúten", emoji: "🌾" },
      { id: "vegetariana", label: "Vegetariana", emoji: "🥬" },
      { id: "vegana", label: "Vegana", emoji: "🌱" },
      { id: "nenhuma", label: "Nenhuma", emoji: "✅" },
    ],
    multiSelect: true,
  },
  {
    id: "equipment",
    title: "O que você tem na cozinha?",
    description: "Assim sugerimos receitas possíveis de fazer",
    icon: Microwave,
    options: [
      { id: "airfryer", label: "Airfryer", emoji: "🍟" },
      { id: "forno", label: "Forno", emoji: "🔥" },
      { id: "microondas", label: "Micro-ondas", emoji: "📻" },
      { id: "panela-pressao", label: "Panela de pressão", emoji: "🫕" },
      { id: "liquidificador", label: "Liquidificador", emoji: "🥤" },
    ],
    multiSelect: true,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const currentSelections = selections[step.id] || [];

  const handleSelect = (optionId: string) => {
    if (step.multiSelect) {
      setSelections((prev) => ({
        ...prev,
        [step.id]: currentSelections.includes(optionId)
          ? currentSelections.filter((id) => id !== optionId)
          : [...currentSelections, optionId],
      }));
    } else {
      setSelections((prev) => ({
        ...prev,
        [step.id]: [optionId],
      }));
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      setIsSaving(true);
      try {
        await completeOnboarding(selections);
        toast.success("Preferências salvas!");
        navigate("/app/chat");
      } catch (error) {
        console.error("Error saving preferences:", error);
        toast.error("Erro ao salvar preferências");
      } finally {
        setIsSaving(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = async () => {
    // Still mark onboarding as complete even if skipped
    setIsSaving(true);
    try {
      await completeOnboarding({});
      navigate("/app/chat");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      navigate("/app/chat");
    } finally {
      setIsSaving(false);
    }
  };

  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="px-4 pt-4">
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Icon className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-2xl mb-2">
            {step.title}
          </h1>
          <p className="text-muted-foreground mb-8">
            {step.description}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {step.options.map((option) => {
              const isSelected = currentSelections.includes(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  )}
                >
                  {option.emoji && (
                    <span className="text-2xl">{option.emoji}</span>
                  )}
                  <span className="flex-1 font-medium">{option.label}</span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-border bg-card">
        <div className="max-w-md mx-auto space-y-3">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleNext}
            disabled={currentSelections.length === 0 || isSaving}
          >
            {isSaving ? "Salvando..." : isLastStep ? "Começar a cozinhar" : "Continuar"}
            <ChevronRight className="w-5 h-5" />
          </Button>
          
          <button
            onClick={handleSkip}
            disabled={isSaving}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Pular por enquanto
          </button>
        </div>
      </footer>
    </div>
  );
}
