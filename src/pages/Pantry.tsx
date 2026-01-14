import { useState } from "react";
import { Plus, Package, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PantryItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  expiresAt?: Date;
  isEmpty: boolean;
}

// Sample items for demo
const sampleItems: PantryItem[] = [
  { id: "1", name: "Frango", quantity: 500, unit: "g", isEmpty: false },
  { id: "2", name: "Arroz", quantity: 1, unit: "kg", isEmpty: false },
  { id: "3", name: "Cebola", quantity: 3, unit: "un", isEmpty: false },
  { id: "4", name: "Alho", isEmpty: false },
  { id: "5", name: "Leite", quantity: 1, unit: "L", expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), isEmpty: false },
  { id: "6", name: "Ovos", quantity: 6, unit: "un", isEmpty: false },
];

export default function Pantry() {
  const [items, setItems] = useState<PantryItem[]>(sampleItems);
  const [newItemName, setNewItemName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem: PantryItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        isEmpty: false,
      };
      setItems((prev) => [...prev, newItem]);
      setNewItemName("");
      setIsDialogOpen(false);
    }
  };

  const handleToggleEmpty = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isEmpty: !item.isEmpty } : item
      )
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const isExpiringSoon = (date?: Date) => {
    if (!date) return false;
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return date.getTime() - Date.now() < threeDays;
  };

  const activeItems = items.filter((item) => !item.isEmpty);
  const emptyItems = items.filter((item) => item.isEmpty);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-semibold text-xl">Minha Cozinha</h1>
            <p className="text-sm text-muted-foreground">
              {activeItems.length} itens disponíveis
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display">Adicionar item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Nome do item</Label>
                  <Input
                    id="item-name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Ex: Tomate, Queijo, Macarrão..."
                    className="h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  />
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {/* Expiring Soon Alert */}
        {activeItems.some((item) => isExpiringSoon(item.expiresAt)) && (
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-foreground">Use primeiro</p>
              <p className="text-sm text-muted-foreground">
                Alguns itens vencem em breve
              </p>
            </div>
          </div>
        )}

        {/* Active Items */}
        <section>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Disponíveis
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {activeItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "card-recipe p-4 relative group",
                  isExpiringSoon(item.expiresAt) && "ring-2 ring-warning/30"
                )}
              >
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {item.name}
                    </p>
                    {item.quantity && item.unit && (
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    )}
                    {isExpiringSoon(item.expiresAt) && (
                      <p className="text-xs text-warning font-medium mt-1">
                        Vence em breve
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-xs h-8"
                  onClick={() => handleToggleEmpty(item.id)}
                >
                  Acabou
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Empty Items */}
        {emptyItems.length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Acabaram
            </h2>
            <div className="space-y-2">
              {emptyItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                >
                  <span className="text-sm text-muted-foreground line-through">
                    {item.name}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleToggleEmpty(item.id)}
                    >
                      Repôs
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
