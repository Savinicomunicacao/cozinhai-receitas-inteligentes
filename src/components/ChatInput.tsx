import { useState, useRef } from "react";
import { Mic, Camera, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendAudio?: () => void;
  onSendImage?: () => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleMicClick = () => {
    if (!isPro) {
      // Show paywall for non-pro users
      return;
    }
    setIsRecording(!isRecording);
    onSendAudio?.();
  };

  const handleCameraClick = () => {
    if (!isPro) {
      // Show paywall for non-pro users
      return;
    }
    onSendImage?.();
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
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
          disabled={disabled}
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
            placeholder="O que você quer preparar?"
            className="input-chat pr-12"
            disabled={disabled || isRecording}
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
              disabled={disabled}
            >
              {isRecording ? (
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
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Gravando...</span>
        </div>
      )}
    </form>
  );
}
