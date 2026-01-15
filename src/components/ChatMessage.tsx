import { cn } from "@/lib/utils";
import { RecipeCard } from "./RecipeCard";
import { Image } from "lucide-react";
import { AppLogo } from "./AppLogo";

interface Recipe {
  id: string;
  title: string;
  imageUrl?: string;
  prepTime: number;
  servings: number;
  difficulty: "facil" | "medio" | "dificil";
  tags: string[];
  shortReason?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  recipes?: Recipe[];
  imageUrl?: string;
  onViewRecipe?: (id: string) => void;
  onSaveRecipe?: (id: string) => void;
}

export function ChatMessage({ 
  role, 
  content, 
  recipes,
  imageUrl,
  onViewRecipe,
  onSaveRecipe 
}: ChatMessageProps) {
  const isUser = role === "user";
  
  // Check if content contains an image marker
  const isImageMessage = content.startsWith("[IMAGEM:");
  const extractedImageUrl = isImageMessage 
    ? content.replace("[IMAGEM:", "").replace("]", "") 
    : imageUrl;
  
  // Display text (hide image marker from display)
  const displayContent = isImageMessage ? "" : content;

  return (
    <div className={cn(
      "flex gap-3 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <AppLogo size="sm" />
        </div>
      )}

      {/* Message bubble */}
      <div className={cn(
        "max-w-[85%] space-y-3",
        isUser && "flex flex-col items-end"
      )}>
        {/* Image */}
        {extractedImageUrl && (
          <div className={cn(
            "rounded-2xl overflow-hidden",
            isUser ? "rounded-br-md" : "rounded-bl-md"
          )}>
            <img 
              src={extractedImageUrl} 
              alt="Imagem enviada" 
              className="max-w-[250px] max-h-[250px] object-cover"
            />
          </div>
        )}
        
        {/* Text content */}
        {displayContent && (
          <div className={cn(
            "rounded-2xl px-4 py-3",
            isUser 
              ? "bg-primary text-primary-foreground rounded-br-md" 
              : "bg-card border border-border rounded-bl-md"
          )}>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {displayContent}
            </p>
          </div>
        )}
        
        {/* Photo sent indicator if only image */}
        {isImageMessage && (
          <div className={cn(
            "rounded-2xl px-4 py-3 flex items-center gap-2",
            isUser 
              ? "bg-primary text-primary-foreground rounded-br-md" 
              : "bg-card border border-border rounded-bl-md"
          )}>
            <Image className="w-4 h-4" />
            <span className="text-sm">Foto dos ingredientes</span>
          </div>
        )}

        {/* Recipe suggestions */}
        {recipes && recipes.length > 0 && (
          <div className="space-y-3 w-full">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                {...recipe}
                compact
                onView={() => onViewRecipe?.(recipe.id)}
                onSave={() => onSaveRecipe?.(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
