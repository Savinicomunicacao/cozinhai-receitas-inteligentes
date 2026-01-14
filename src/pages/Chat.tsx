import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { FilterChips } from "@/components/FilterChips";
import { PaywallModal } from "@/components/PaywallModal";
import { ChefHat, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const availableFilters = [
  "Rápida",
  "Econômica", 
  "Fit",
  "Airfryer",
  "Vegetariana",
  "Sem lactose",
];

export default function Chat() {
  const navigate = useNavigate();
  const { messages, isLoading, sendMessage } = useChat();
  const { profile } = useAuth();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPro = profile?.is_pro ?? false;
  const weeklyUsage = profile?.weekly_usage_count ?? 0;
  const weeklyLimit = 7;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    // Include active filters in the message context
    let messageWithFilters = text;
    if (activeFilters.length > 0) {
      messageWithFilters = `${text} (Filtros: ${activeFilters.join(', ')})`;
    }
    sendMessage(messageWithFilters);
  };

  const handleToggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleViewRecipe = (id: string) => {
    navigate(`/app/recipe/${id}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-72px)] bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg">Cozinha.ai</h1>
              <p className="text-xs text-muted-foreground">
                {isPro ? "Plano Pro ✨" : `${weeklyUsage}/${weeklyLimit} sugestões esta semana`}
              </p>
            </div>
          </div>
          
          <FilterChips
            filters={availableFilters}
            activeFilters={activeFilters}
            onToggle={handleToggleFilter}
          />
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            recipes={message.recipes}
            onViewRecipe={handleViewRecipe}
            onSaveRecipe={(id) => console.log("Save recipe:", id)}
          />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Pensando em receitas...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="sticky bottom-[72px] bg-background">
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendAudio={(transcript) => handleSendMessage(transcript)}
          onSendImage={(imageData) => handleSendMessage(`[IMAGEM:${imageData}]`)}
          disabled={isLoading}
          isPro={isPro}
        />
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={() => {
          setShowPaywall(false);
          navigate("/paywall");
        }}
        reason="feature"
      />
    </div>
  );
}
