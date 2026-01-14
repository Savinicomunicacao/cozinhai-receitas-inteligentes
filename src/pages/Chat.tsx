import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { FilterChips } from "@/components/FilterChips";
import { PaywallModal } from "@/components/PaywallModal";
import { ChefHat } from "lucide-react";

// Import recipe images
import frangoCremoso from "@/assets/recipe-frango-cremoso.jpg";
import panquecaBanana from "@/assets/recipe-panqueca-banana.jpg";
import macarrao from "@/assets/recipe-macarrao.jpg";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recipes?: {
    id: string;
    title: string;
    imageUrl?: string;
    prepTime: number;
    servings: number;
    difficulty: "facil" | "medio" | "dificil";
    tags: string[];
    shortReason?: string;
  }[];
}

// Sample recipes for demo
const sampleRecipes = [
  {
    id: "1",
    title: "Frango Cremoso Rápido",
    imageUrl: frangoCremoso,
    prepTime: 25,
    servings: 4,
    difficulty: "facil" as const,
    tags: ["Rápida", "Proteína"],
    shortReason: "Perfeito com o frango e creme que você tem!",
  },
  {
    id: "2",
    title: "Macarrão Alho e Óleo com Toque Especial",
    imageUrl: macarrao,
    prepTime: 15,
    servings: 2,
    difficulty: "facil" as const,
    tags: ["Rápida", "Econômica"],
    shortReason: "Simples e saboroso com seus ingredientes.",
  },
  {
    id: "3",
    title: "Salada Completa com Frango",
    prepTime: 20,
    servings: 2,
    difficulty: "facil" as const,
    tags: ["Fit", "Saudável"],
    shortReason: "Uma opção leve e nutritiva.",
  },
];

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente de cozinha. Me conta o que você tem na geladeira ou o que está com vontade de comer, e eu sugiro receitas deliciosas!",
    },
  ]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);
  const [usageCount] = useState(3); // Demo: 3 of 7 used
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Entendi! Com ${text}, tenho ótimas sugestões para você:`,
        recipes: sampleRecipes,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
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
                {usageCount}/7 sugestões esta semana
              </p>
            </div>
          </div>
          
          <FilterChips
            filters={[]}
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
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="sticky bottom-[72px] bg-background">
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendAudio={() => setShowPaywall(true)}
          onSendImage={() => setShowPaywall(true)}
          isPro={false}
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
