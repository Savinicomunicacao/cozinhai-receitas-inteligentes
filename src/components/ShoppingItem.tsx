import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShoppingItemProps {
  id: string;
  name: string;
  quantity: string | null;
  isPurchased: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ShoppingItem({
  id,
  name,
  quantity,
  isPurchased,
  onToggle,
  onRemove,
}: ShoppingItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all",
        isPurchased
          ? "bg-muted/50 opacity-60"
          : "bg-card border border-border shadow-sm"
      )}
    >
      <button
        onClick={() => onToggle(id)}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
          isPurchased
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground/40 hover:border-primary"
        )}
        aria-label={isPurchased ? "Desmarcar como comprado" : "Marcar como comprado"}
      >
        {isPurchased && <Check className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-sm font-medium truncate",
            isPurchased && "line-through text-muted-foreground"
          )}
        >
          {name}
        </span>
        {quantity && (
          <span className="text-xs text-muted-foreground">{quantity}</span>
        )}
      </div>

      <button
        onClick={() => onRemove(id)}
        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
        aria-label="Remover item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
