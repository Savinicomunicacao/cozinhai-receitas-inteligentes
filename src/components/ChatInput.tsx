import { useState, useRef, useCallback } from "react";
import { Mic, Camera, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendAudio?: (transcript: string) => void;
  onSendImage?: (imageData: string) => void;
  disabled?: boolean;
  isPro?: boolean;
}

export function ChatInput({ 
  onSendMessage, 
  onSendAudio, 
  onSendImage, 
  disabled = false,
  isPro = false 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessingAudio(true);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64 and send to transcription
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          // For now, we'll just inform the user - transcription would need OpenAI Whisper
          // In a full implementation, this would call an edge function for transcription
          toast.info("Áudio gravado! Transcrevendo...");
          
          // Simulate transcription - in production, call Whisper API
          setTimeout(() => {
            onSendAudio?.("(Áudio: funcionalidade de transcrição em desenvolvimento)");
            setIsProcessingAudio(false);
          }, 1000);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Gravando áudio...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  }, [onSendAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleMicClick = () => {
    if (!isPro) {
      toast.error("Função disponível apenas no plano Pro", {
        action: {
          label: "Ver planos",
          onClick: () => window.location.href = "/paywall",
        },
      });
      return;
    }
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleCameraClick = () => {
    if (!isPro) {
      toast.error("Função disponível apenas no plano Pro", {
        action: {
          label: "Ver planos",
          onClick: () => window.location.href = "/paywall",
        },
      });
      return;
    }
    
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onSendImage?.(base64);
      toast.success("Imagem enviada! Analisando...");
      
      // For now, send a message about the image
      onSendMessage("(Enviou uma foto dos ingredientes)");
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex items-center gap-2 p-3 bg-card border-t border-border">
        {/* Camera Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCameraClick}
          className={cn(
            "btn-icon shrink-0",
            !isPro && "opacity-50"
          )}
          disabled={disabled || isRecording}
        >
          <Camera className="w-5 h-5" />
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isRecording ? "Gravando..." : "O que você quer preparar?"}
            className="input-chat pr-12"
            disabled={disabled || isRecording || isProcessingAudio}
          />
          
          {/* Send or Mic Button inside input */}
          {message.trim() ? (
            <Button
              type="submit"
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-icon-primary w-9 h-9"
              disabled={disabled}
            >
              <Send className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={handleMicClick}
              className={cn(
                "absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9",
                isRecording 
                  ? "btn-icon-accent animate-pulse-soft" 
                  : "btn-icon-ghost",
                !isPro && "opacity-50"
              )}
              disabled={disabled || isProcessingAudio}
            >
              {isProcessingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRecording ? (
                <X className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-center gap-2 py-2 bg-accent/10 text-accent rounded-t-xl animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium">Gravando... Toque para parar</span>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessingAudio && (
        <div className="absolute -top-12 left-0 right-0 flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary rounded-t-xl animate-fade-in">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Processando áudio...</span>
        </div>
      )}
    </form>
  );
}
