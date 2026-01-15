import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, Timer, RotateCcw, PartyPopper, Play, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Recipe {
  id: string;
  title: string;
  steps: string[];
}

export default function Cook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showComplete, setShowComplete] = useState(false);
  
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState(0);

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, steps')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRecipe(data);
    } catch (error) {
      console.error("Error loading recipe:", error);
      toast.error("Erro ao carregar receita");
    } finally {
      setIsLoading(false);
    }
  };

  // Detect time mentioned in a step (e.g., "5 minutos", "30 segundos")
  const detectTimeInStep = useCallback((step: string): number | null => {
    // Match patterns like "5 minutos", "30 segundos", "por 10 minutos"
    const minMatch = step.match(/(\d+)\s*minuto/i);
    const secMatch = step.match(/(\d+)\s*segundo/i);
    const hourMatch = step.match(/(\d+)\s*hora/i);
    
    if (hourMatch) return parseInt(hourMatch[1]) * 3600;
    if (minMatch) return parseInt(minMatch[1]) * 60;
    if (secMatch) return parseInt(secMatch[1]);
    return null;
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // Play notification sound or vibrate
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            toast.success("⏰ Timer finalizado!", { duration: 5000 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerInitialSeconds(seconds);
    setIsTimerRunning(true);
    toast.success(`Timer iniciado: ${formatTime(seconds)}`);
  };

  const toggleTimer = () => {
    setIsTimerRunning(prev => !prev);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setTimerInitialSeconds(0);
  };

  const steps = recipe?.steps || [];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const isStepComplete = completedSteps.has(currentStep);
  const currentStepTime = steps[currentStep] ? detectTimeInStep(steps[currentStep]) : null;

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
    console.log("Recipe completed!");
    navigate("/app/chat");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando receita...</div>
      </div>
    );
  }

  if (!recipe || steps.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display font-bold text-xl mb-2">Receita não encontrada</h1>
        <p className="text-muted-foreground mb-6">Não foi possível carregar os passos desta receita.</p>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

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
          {/* Timer display/button */}
          {timerSeconds > 0 ? (
            <button 
              onClick={toggleTimer}
              className={cn(
                "px-3 py-2 rounded-full flex items-center gap-2 font-mono text-sm font-medium transition-colors",
                isTimerRunning ? "bg-primary text-primary-foreground" : "bg-muted"
              )}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {formatTime(timerSeconds)}
            </button>
          ) : currentStepTime ? (
            <button 
              onClick={() => startTimer(currentStepTime)}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
            >
              <Timer className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center opacity-50">
              <Timer className="w-5 h-5" />
            </div>
          )}
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

      {/* Timer bar when active */}
      {timerSeconds > 0 && (
        <div className="px-4 py-2 bg-card border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Timer ativo</span>
            </div>
            <button 
              onClick={resetTimer}
              className="p-1 hover:bg-muted rounded-full"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${(timerSeconds / timerInitialSeconds) * 100}%` }}
            />
          </div>
        </div>
      )}

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

          {/* Timer quick start button */}
          {currentStepTime && timerSeconds === 0 && (
            <button
              onClick={() => startTimer(currentStepTime)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
            >
              <Timer className="w-4 h-4" />
              Iniciar timer de {formatTime(currentStepTime)}
            </button>
          )}

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
