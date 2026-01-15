import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string | null;
  category: string | null;
  is_purchased: boolean;
  created_at: string;
  purchased_at: string | null;
}

export interface CategoryGroup {
  category: string;
  items: ShoppingItem[];
}

export function useShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingFromChat, setIsAddingFromChat] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("shopping_list_items")
        .select("*")
        .eq("user_id", user.id)
        .order("is_purchased", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching shopping items:", error);
      toast.error("Erro ao carregar lista de compras");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("shopping-list-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list_items",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchItems]);

  const addItem = async (name: string, quantity?: string | null) => {
    if (!user) {
      toast.error("Faça login para adicionar itens");
      return false;
    }

    try {
      const { error } = await supabase.from("shopping_list_items").insert({
        user_id: user.id,
        name: name.trim(),
        quantity: quantity?.trim() || null,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Erro ao adicionar item");
      return false;
    }
  };

  const addItemsFromChat = async (message: string): Promise<number> => {
    if (!user) {
      toast.error("Faça login para adicionar itens");
      return 0;
    }

    setIsAddingFromChat(true);

    try {
      const response = await supabase.functions.invoke("parse-shopping-items", {
        body: { message },
      });

      if (response.error) throw response.error;

      const { items: parsedItems } = response.data as {
        items: Array<{ name: string; quantity: string | null; category: string | null }>;
      };

      if (!parsedItems || parsedItems.length === 0) {
        toast.info("Não consegui identificar itens na mensagem");
        return 0;
      }

      // Insert all items with category
      const itemsToInsert = parsedItems.map((item) => ({
        user_id: user.id,
        name: item.name,
        quantity: item.quantity,
        category: item.category || null,
      }));

      const { error } = await supabase
        .from("shopping_list_items")
        .insert(itemsToInsert);

      if (error) throw error;

      const count = parsedItems.length;
      toast.success(
        `${count} ${count === 1 ? "item adicionado" : "itens adicionados"}!`
      );
      return count;
    } catch (error) {
      console.error("Error adding items from chat:", error);
      toast.error("Erro ao processar itens");
      return 0;
    } finally {
      setIsAddingFromChat(false);
    }
  };

  const updateItem = async (id: string, name: string, quantity: string | null) => {
    try {
      const { error } = await supabase
        .from("shopping_list_items")
        .update({
          name: name.trim(),
          quantity: quantity?.trim() || null,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Item atualizado!");
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Erro ao atualizar item");
      throw error;
    }
  };

  const togglePurchased = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newPurchasedState = !item.is_purchased;

    try {
      const { error } = await supabase
        .from("shopping_list_items")
        .update({
          is_purchased: newPurchasedState,
          purchased_at: newPurchasedState ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error toggling item:", error);
      toast.error("Erro ao atualizar item");
    }
  };

  const removeItem = async (id: string) => {
    // Optimistic update - remove from UI immediately
    const previousItems = items;
    setItems((current) => current.filter((item) => item.id !== id));

    try {
      const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      // Rollback on error
      setItems(previousItems);
      console.error("Error removing item:", error);
      toast.error("Erro ao remover item");
      throw error;
    }
  };

  const clearPurchased = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .eq("user_id", user.id)
        .eq("is_purchased", true);

      if (error) throw error;
      toast.success("Itens comprados removidos!");
    } catch (error) {
      console.error("Error clearing purchased:", error);
      toast.error("Erro ao limpar itens");
    }
  };

  const pendingItems = items.filter((item) => !item.is_purchased);
  const purchasedItems = items.filter((item) => item.is_purchased);

  // Group items by category (only categories with 2+ items)
  const categorizedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};

    pendingItems.forEach((item) => {
      const cat = item.category || "Outros";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Only return categories with 2+ items
    return Object.entries(groups)
      .filter(([_, catItems]) => catItems.length >= 2)
      .map(([category, catItems]) => ({ category, items: catItems }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [pendingItems]);

  // Items that don't belong to any category with 2+ items
  const uncategorizedItems = useMemo(() => {
    const categoriesWithMultiple = new Set(
      categorizedItems.map((g) => g.category)
    );

    return pendingItems.filter((item) => {
      const cat = item.category || "Outros";
      return !categoriesWithMultiple.has(cat);
    });
  }, [pendingItems, categorizedItems]);

  return {
    items,
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
    refetch: fetchItems,
  };
}
