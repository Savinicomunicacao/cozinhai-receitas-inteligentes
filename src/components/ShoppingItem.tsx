import { useState, useRef, useEffect } from "react";
import { Check, Trash2, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ShoppingItemProps {
  id: string;
  name: string;
  quantity: string | null;
  isPurchased: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate?: (id: string, name: string, quantity: string | null) => Promise<void>;
}

export function ShoppingItem({
  id,
  name,
  quantity,
  isPurchased,
  onToggle,
  onRemove,
  onUpdate,
}: ShoppingItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editQuantity, setEditQuantity] = useState(quantity || "");
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditName(name);
    setEditQuantity(quantity || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditName(name);
    setEditQuantity(quantity || "");
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !onUpdate) {
      handleCancelEdit();
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(id, editName.trim(), editQuantity.trim() || null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-card border-2 border-primary shadow-sm">
        <div className="flex-1 space-y-2">
          <Input
            ref={nameInputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nome do item"
            className="h-8 text-sm"
            disabled={isSaving}
          />
          <Input
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Quantidade (opcional)"
            className="h-8 text-sm"
            disabled={isSaving}
          />
        </div>

        <div className="flex flex-col gap-1">
          <button
            onClick={handleSaveEdit}
            disabled={isSaving || !editName.trim()}
            className="p-1.5 text-primary hover:bg-primary/10 transition-colors rounded-lg disabled:opacity-50"
            aria-label="Salvar"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
            aria-label="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

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

      {onUpdate && !isPurchased && (
        <button
          onClick={handleStartEdit}
          className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
          aria-label="Editar item"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

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
