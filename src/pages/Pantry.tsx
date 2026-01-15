import { useState } from "react";
import { ShoppingCart, Trash2, ChevronDown, ChevronUp, Package, Tag } from "lucide-react";
import { useShoppingList } from "@/hooks/useShoppingList";
import { ShoppingItem } from "@/components/ShoppingItem";
import { ShoppingListInput } from "@/components/ShoppingListInput";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    categorizedItems,
    uncategorizedItems,
    isLoading,
    isAddingFromChat,
    addItem,
    addItemsFromChat,
    updateItem,
    togglePurchased,
    removeItem,
    clearPurchased,
  } = useShoppingList();

  const [purchasedOpen, setPurchasedOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

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
  const hasCategorizedItems = categorizedItems.length > 0;

  const renderPurchasedSection = () => {
    if (purchasedItems.length === 0) return null;

    return (
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
              onUpdate={updateItem}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        Lista vazia
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Use o campo acima para adicionar itens. Você pode digitar ou falar vários itens de uma vez!
      </p>
    </div>
  );

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
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : totalItems === 0 ? (
          renderEmptyState()
        ) : (
          <Tabs defaultValue="pendentes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pendentes" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Pendentes
              </TabsTrigger>
              <TabsTrigger value="categorias" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categorias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendentes" className="space-y-6">
              {/* Pending Items */}
              {pendingItems.length > 0 ? (
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
                      onUpdate={updateItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item pendente
                </div>
              )}

              {/* Purchased Items */}
              {renderPurchasedSection()}
            </TabsContent>

            <TabsContent value="categorias" className="space-y-4">
              {hasCategorizedItems ? (
                <>
                  {/* Categorized Items */}
                  {categorizedItems.map((group) => (
                    <Collapsible
                      key={group.category}
                      open={openCategories.has(group.category)}
                      onOpenChange={() => toggleCategory(group.category)}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary" />
                          <span className="font-medium">{group.category}</span>
                          <span className="text-sm text-muted-foreground">
                            ({group.items.length})
                          </span>
                        </div>
                        {openCategories.has(group.category) ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2 pl-2">
                        {group.items.map((item) => (
                          <ShoppingItem
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            quantity={item.quantity}
                            isPurchased={item.is_purchased}
                            onToggle={togglePurchased}
                            onRemove={removeItem}
                            onUpdate={updateItem}
                          />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}

                  {/* Uncategorized Items (items with unique categories) */}
                  {uncategorizedItems.length > 0 && (
                    <Collapsible
                      open={openCategories.has("__outros__")}
                      onOpenChange={() => toggleCategory("__outros__")}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Outros</span>
                          <span className="text-sm text-muted-foreground">
                            ({uncategorizedItems.length})
                          </span>
                        </div>
                        {openCategories.has("__outros__") ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2 pl-2">
                        {uncategorizedItems.map((item) => (
                          <ShoppingItem
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            quantity={item.quantity}
                            isPurchased={item.is_purchased}
                            onToggle={togglePurchased}
                            onRemove={removeItem}
                            onUpdate={updateItem}
                          />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Tag className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Sem categorias ainda
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    As categorias aparecem automaticamente quando você tem 2 ou mais itens do mesmo tipo.
                  </p>
                </div>
              )}

              {/* Purchased Items in Categories tab too */}
              {purchasedItems.length > 0 && (
                <div className="mt-6">
                  {renderPurchasedSection()}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
