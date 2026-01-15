import { useState } from "react";
import { ShoppingCart, Trash2, ChevronDown, ChevronUp, Package } from "lucide-react";
import { useShoppingList } from "@/hooks/useShoppingList";
import { ShoppingItem } from "@/components/ShoppingItem";
import { ShoppingListInput } from "@/components/ShoppingListInput";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Pantry() {
  const { user, loading: authLoading } = useAuth();
  const {
    pendingItems,
    purchasedItems,
    isLoading,
    isAddingFromChat,
    addItem,
    addItemsFromChat,
    togglePurchased,
    removeItem,
    clearPurchased,
  } = useShoppingList();

  const [purchasedOpen, setPurchasedOpen] = useState(true);

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Lista de Compras</h2>
        <p className="text-muted-foreground mb-6">
          Faça login para criar e gerenciar sua lista de compras inteligente.
        </p>
        <Button asChild>
          <a href="/auth">Fazer Login</a>
        </Button>
      </div>
    );
  }

  const totalItems = pendingItems.length + purchasedItems.length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Lista de Compras
            </h1>
            <span className="text-sm text-muted-foreground">
              {pendingItems.length} {pendingItems.length === 1 ? "item" : "itens"} pendente{pendingItems.length !== 1 && "s"}
            </span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-4 border-b border-border bg-muted/30">
        <ShoppingListInput
          onAddItems={addItemsFromChat}
          onAddSingleItem={addItem}
          isProcessing={isAddingFromChat}
        />
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Lista vazia
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Use o campo acima para adicionar itens. Você pode digitar ou falar vários itens de uma vez!
            </p>
          </div>
        ) : (
          <>
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1">
                  Pendentes
                </h2>
                <div className="space-y-2">
                  {pendingItems.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      quantity={item.quantity}
                      isPurchased={item.is_purchased}
                      onToggle={togglePurchased}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Purchased Items */}
            {purchasedItems.length > 0 && (
              <Collapsible open={purchasedOpen} onOpenChange={setPurchasedOpen}>
                <div className="flex items-center justify-between px-1 mb-2">
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                    Comprados ({purchasedItems.length})
                    {purchasedOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </CollapsibleTrigger>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        Limpar
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Limpar itens comprados?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso removerá permanentemente todos os {purchasedItems.length} itens marcados como comprados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={clearPurchased}>
                          Limpar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <CollapsibleContent className="space-y-2">
                  {purchasedItems.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      quantity={item.quantity}
                      isPurchased={item.is_purchased}
                      onToggle={togglePurchased}
                      onRemove={removeItem}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </div>
    </div>
  );
}
