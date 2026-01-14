import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, Timer, RotateCcw, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Sample steps
const steps = [
  "Corte o frango em cubos médios e tempere com sal e pimenta.",
  "Em uma frigideira grande, aqueça um fio de azeite e doure o frango. Reserve.",
  "Na mesma frigideira, refogue a cebola e o alho picados até dourar.",
  "Adicione o tomate pelado e deixe cozinhar por 5 minutos.",
  "Junte o frango, o creme de leite e misture bem.",
  "Deixe cozinhar em fogo baixo por mais 5 minutos.",
  "Finalize com manjericão fresco e sirva com arroz.",
];

export default function Cook() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showComplete, setShowComplete] = useState(false);

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const isStepComplete = completedSteps.has(currentStep);

  const handleToggleStep = () => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(currentStep)) {
        next.delete(currentStep);
      } else {
        next.add(currentStep);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else if (completedSteps.size === steps.length) {
      setShowComplete(true);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    // Log that recipe was cooked
    console.log("Recipe completed!");
    navigate("/app/chat");
  };

  if (showComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 rounded-3xl bg-success/10 flex items-center justify-center mb-6 animate-bounce-gentle">
          <PartyPopper className="w-12 h-12 text-success" />
        </div>
        <h1 className="font-display font-bold text-2xl mb-2">
          Parabéns!
        </h1>
        <p className="text-muted-foreground mb-8">
          Você completou a receita. Bom apetite!
        </p>
        <Button variant="hero" size="lg" onClick={handleFinish}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-display font-semibold">
            Passo {currentStep + 1} de {steps.length}
          </span>
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Timer className="w-5 h-5" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors cursor-pointer",
                i === currentStep 
                  ? "bg-primary" 
                  : completedSteps.has(i) 
                    ? "bg-success" 
                    : "bg-muted"
              )}
              onClick={() => setCurrentStep(i)}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-md w-full text-center">
          {/* Step number */}
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors",
            isStepComplete ? "bg-success/10" : "bg-primary/10"
          )}>
            {isStepComplete ? (
              <Check className="w-8 h-8 text-success" />
            ) : (
              <span className="font-display font-bold text-2xl text-primary">
                {currentStep + 1}
              </span>
            )}
          </div>

          {/* Step text */}
          <p className="text-xl leading-relaxed text-foreground">
            {steps[currentStep]}
          </p>

          {/* Mark as done */}
          <button
            onClick={handleToggleStep}
            className={cn(
              "mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
              isStepComplete
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {isStepComplete ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Desfazer
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Marcar como feito
              </>
            )}
          </button>
        </div>
      </main>

      {/* Navigation */}
      <footer className="px-4 py-6 border-t border-border bg-card safe-area-bottom">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrev}
            disabled={isFirstStep}
            className="flex-1"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Anterior
          </Button>
          <Button
            variant="hero"
            size="lg"
            onClick={handleNext}
            disabled={isLastStep && completedSteps.size < steps.length}
            className="flex-1"
          >
            {isLastStep ? "Finalizar" : "Próximo"}
            {!isLastStep && <ChevronRight className="w-5 h-5 ml-1" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
