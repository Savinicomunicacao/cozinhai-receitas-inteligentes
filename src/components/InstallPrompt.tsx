import { useState, useEffect } from 'react';
import { Share, Plus, Smartphone, Zap, Wifi } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface InstallPromptProps {
  delay?: number;
}

export function InstallPrompt({ delay = 3000 }: InstallPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { shouldShowPrompt, isIOS, install, dismiss } = usePWAInstall();

  useEffect(() => {
    if (shouldShowPrompt) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [shouldShowPrompt, delay]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setIsOpen(false);
    } else if (!isIOS) {
      // If install didn't work on non-iOS, just close
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    dismiss();
    setIsOpen(false);
  };

  const handleClose = () => {
    // Just close without saving to localStorage
    setIsOpen(false);
  };

  if (!shouldShowPrompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-3xl">🍳</span>
          </div>
          <DialogTitle className="text-xl">Instale o Cozinha.ai</DialogTitle>
          <DialogDescription className="text-base">
            Adicione na sua tela de início para uma experiência ainda melhor!
          </DialogDescription>
        </DialogHeader>

        {isIOS ? (
          // iOS Instructions
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Para instalar no seu iPhone/iPad:
            </p>
            
            <div className="space-y-3 bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Share className="h-4 w-4" />
                </div>
                <p className="text-sm">
                  Toque no botão <strong>Compartilhar</strong>
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Plus className="h-4 w-4" />
                </div>
                <p className="text-sm">
                  Selecione <strong>"Adicionar à Tela de Início"</strong>
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Smartphone className="h-4 w-4" />
                </div>
                <p className="text-sm">
                  Confirme tocando em <strong>"Adicionar"</strong>
                </p>
              </div>
            </div>

            <Button 
              onClick={handleDismiss} 
              className="w-full"
            >
              Entendi!
            </Button>
          </div>
        ) : (
          // Android/Chrome with native install
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <span className="text-sm">Acesso rápido na tela de início</span>
              </div>
              
              <div className="flex items-center gap-3 p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Wifi className="h-4 w-4" />
                </div>
                <span className="text-sm">Funciona mesmo offline</span>
              </div>
              
              <div className="flex items-center gap-3 p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Smartphone className="h-4 w-4" />
                </div>
                <span className="text-sm">Experiência de app nativo</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleInstall} className="w-full">
                Instalar agora
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDismiss}
                className="w-full text-muted-foreground"
              >
                Talvez depois
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
