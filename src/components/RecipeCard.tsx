import { Clock, Users, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppLogo } from "./AppLogo";

interface RecipeCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  prepTime: number;
  servings: number;
  difficulty: "facil" | "medio" | "dificil";
  tags: string[];
  shortReason?: string;
  isSaved?: boolean;
  onView?: () => void;
  onSave?: () => void;
  compact?: boolean;
}

const difficultyLabels = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

const difficultyColors = {
  facil: "bg-success/10 text-success",
  medio: "bg-warning/10 text-warning",
  dificil: "bg-accent/10 text-accent",
};

export function RecipeCard({
  title,
  imageUrl,
  prepTime,
  servings,
  difficulty,
  tags,
  shortReason,
  isSaved = false,
  onView,
  onSave,
  compact = false,
}: RecipeCardProps) {
  return (
    <div 
      className={cn(
        "card-recipe cursor-pointer group",
        compact ? "flex gap-3 p-3" : "flex flex-col"
      )}
      onClick={onView}
    >
      {/* Image */}
      <div 
        className={cn(
          "relative overflow-hidden bg-muted",
          compact ? "w-24 h-24 rounded-xl shrink-0" : "aspect-[4/3]"
        )}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <AppLogo size="md" className="opacity-30" />
          </div>
        )}
        
        {/* Save button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 w-8 h-8 bg-card/80 backdrop-blur-sm hover:bg-card shadow-soft",
            compact && "hidden"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4 text-primary" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      <div className={cn("flex-1", !compact && "p-4")}>
        <h3 className={cn(
          "font-display font-semibold text-foreground line-clamp-2",
          compact ? "text-sm" : "text-base mb-2"
        )}>
          {title}
        </h3>

        {/* Meta info */}
        <div className={cn(
          "flex items-center gap-3 text-muted-foreground",
          compact ? "text-xs mt-1" : "text-sm mb-3"
        )}>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {prepTime} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {servings}
          </span>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            difficultyColors[difficulty]
          )}>
            {difficultyLabels[difficulty]}
          </span>
        </div>

        {/* Tags */}
        {!compact && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="chip chip-muted text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Short reason */}
        {!compact && shortReason && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {shortReason}
          </p>
        )}
      </div>
    </div>
  );
}
