import { useState, useRef, FormEvent } from "react";
import { Send, Mic, Plus, Loader2, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShoppingListInputProps {
  onAddItems: (message: string) => Promise<number>;
  onAddSingleItem: (name: string) => Promise<boolean>;
  isProcessing?: boolean;
}

export function ShoppingListInput({
  onAddItems,
  onAddSingleItem,
  isProcessing = false,
}: ShoppingListInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualItem, setManualItem] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;

    const text = message.trim();
    setMessage("");
    await onAddItems(text);
  };

  const handleManualAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!manualItem.trim()) return;

    const success = await onAddSingleItem(manualItem.trim());
    if (success) {
      setManualItem("");
      setShowManualAdd(false);
      toast.success("Item adicionado!");
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      const { data, error } = await supabase.functions.invoke("transcribe", {
        body: { audio: base64Audio },
      });

      if (error) throw error;

      if (data?.transcript) {
        // Automatically add items from transcription
        await onAddItems(data.transcript);
        toast.success("Itens adicionados por voz!");
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.error("Não foi possível transcrever o áudio");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Erro ao transcrever áudio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Recording error:", error);
      toast.error("Erro ao acessar microfone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isDisabled = isProcessing || isTranscribing;

  return (
    <div className="space-y-3">
      {/* Main chat input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite os itens: banana, leite, pão..."
          disabled={isDisabled}
          className="w-full pl-4 pr-24 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {message.trim() ? (
            <button
              type="submit"
              disabled={isDisabled}
              className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowManualAdd(!showManualAdd);
                  setTimeout(() => manualInputRef.current?.focus(), 100);
                }}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleMicClick}
                disabled={isTranscribing}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  isRecording
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  isTranscribing && "opacity-50"
                )}
              >
                {isTranscribing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isRecording ? (
                  <Square className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            </>
          )}
        </div>
      </form>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-destructive text-sm animate-pulse">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          Gravando... Fale os itens que deseja adicionar
        </div>
      )}

      {/* Manual add input */}
      {showManualAdd && (
        <form onSubmit={handleManualAdd} className="flex gap-2">
          <input
            ref={manualInputRef}
            type="text"
            value={manualItem}
            onChange={(e) => setManualItem(e.target.value)}
            placeholder="Nome do item"
            className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!manualItem.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Adicionar
          </button>
        </form>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Dica: Diga ou escreva vários itens de uma vez, como "2kg de arroz, leite e ovos"
      </p>
    </div>
  );
}
