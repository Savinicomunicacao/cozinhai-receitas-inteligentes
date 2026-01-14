import { cn } from "@/lib/utils";
import { RecipeCard } from "./RecipeCard";
import { ChefHat } from "lucide-react";

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
  onViewRecipe?: (id: string) => void;
  onSaveRecipe?: (id: string) => void;
}

export function ChatMessage({ 
  role, 
  content, 
  recipes,
  onViewRecipe,
  onSaveRecipe 
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={cn(
      "flex gap-3 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <ChefHat className="w-5 h-5 text-primary" />
        </div>
      )}

      {/* Message bubble */}
      <div className={cn(
        "max-w-[85%] space-y-3",
        isUser && "flex flex-col items-end"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-card border border-border rounded-bl-md"
        )}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>

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
