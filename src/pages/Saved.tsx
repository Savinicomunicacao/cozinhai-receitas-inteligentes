import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, FolderOpen, Plus, Folder, MoreVertical, Edit2, Trash2, ScanLine, LayoutGrid, List, Clock, ChefHat } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { SponsoredCard } from "@/components/SponsoredCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSponsoredContent } from "@/hooks/useSponsoredContent";
import { cn } from "@/lib/utils";

interface SavedRecipe {
  id: string;
  title: string;
  imageUrl?: string;
  prepTime: number;
  servings: number;
  difficulty: "facil" | "medio" | "dificil";
  tags: string[];
  folderId?: string | null;
}

interface RecipeFolder {
  id: string;
  name: string;
  recipeCount: number;
}

type ViewMode = "cards" | "list";

export default function Saved() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isPro = profile?.is_pro ?? false;
  const { content: sponsoredContent } = useSponsoredContent("saved");
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [folders, setFolders] = useState<RecipeFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<RecipeFolder | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    if (user) {
      loadSavedRecipes();
      loadFolders();
    }
  }, [user]);

  const loadSavedRecipes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
          id,
          folder_id,
          recipe:recipes (
            id,
            title,
            image_url,
            prep_time_minutes,
            servings,
            difficulty,
            tags
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const recipes = data
        ?.filter(item => item.recipe)
        .map(item => ({
          id: (item.recipe as any).id,
          title: (item.recipe as any).title,
          imageUrl: (item.recipe as any).image_url,
          prepTime: (item.recipe as any).prep_time_minutes,
          servings: (item.recipe as any).servings,
          difficulty: (item.recipe as any).difficulty as "facil" | "medio" | "dificil",
          tags: (item.recipe as any).tags || [],
          folderId: item.folder_id
        })) || [];

      setSavedRecipes(recipes);
    } catch (error) {
      console.error("Error loading saved recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolders = async () => {
    if (!user) return;

    try {
      const { data: foldersData, error: foldersError } = await supabase
        .from('recipe_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (foldersError) throw foldersError;

      // Get recipe count for each folder
      const { data: savedData } = await supabase
        .from('saved_recipes')
        .select('folder_id')
        .eq('user_id', user.id)
        .not('folder_id', 'is', null);

      const folderCounts: Record<string, number> = {};
      savedData?.forEach(item => {
        if (item.folder_id) {
          folderCounts[item.folder_id] = (folderCounts[item.folder_id] || 0) + 1;
        }
      });

      const foldersWithCount = foldersData?.map(folder => ({
        id: folder.id,
        name: folder.name,
        recipeCount: folderCounts[folder.id] || 0
      })) || [];

      setFolders(foldersWithCount);
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  };

  const handleCreateFolder = async () => {
    if (!user || !newFolderName.trim()) return;

    if (!isPro) {
      toast.error("Pastas são exclusivas do plano Pro", {
        action: {
          label: "Ver planos",
          onClick: () => navigate('/paywall'),
        },
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('recipe_folders')
        .insert({
          user_id: user.id,
          name: newFolderName.trim()
        });

      if (error) throw error;

      toast.success("Pasta criada!");
      setNewFolderName("");
      setIsCreateFolderOpen(false);
      loadFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Erro ao criar pasta");
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;

    try {
      const { error } = await supabase
        .from('recipe_folders')
        .update({ name: newFolderName.trim() })
        .eq('id', editingFolder.id);

      if (error) throw error;

      toast.success("Pasta atualizada!");
      setEditingFolder(null);
      setNewFolderName("");
      loadFolders();
    } catch (error) {
      console.error("Error updating folder:", error);
      toast.error("Erro ao atualizar pasta");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      // First, remove folder_id from all recipes in this folder
      await supabase
        .from('saved_recipes')
        .update({ folder_id: null })
        .eq('folder_id', folderId);

      // Then delete the folder
      const { error } = await supabase
        .from('recipe_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      toast.success("Pasta excluída!");
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      loadFolders();
      loadSavedRecipes();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Erro ao excluir pasta");
    }
  };

  const handleUnsave = async (recipeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (error) throw error;

      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      toast.success("Receita removida dos salvos");
    } catch (error) {
      console.error("Error unsaving recipe:", error);
      toast.error("Erro ao remover receita");
    }
  };

  const handleMoveToFolder = async (recipeId: string, folderId: string | null) => {
    if (!user) return;

    try {
      // First, find the saved_recipe record ID
      const { data: savedRecipe, error: findError } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (findError || !savedRecipe) {
        console.error("Error finding saved recipe:", findError);
        toast.error("Receita salva não encontrada");
        return;
      }

      // Update using the saved_recipes ID
      const { error } = await supabase
        .from('saved_recipes')
        .update({ folder_id: folderId })
        .eq('id', savedRecipe.id);

      if (error) throw error;

      toast.success(folderId ? "Receita movida para pasta!" : "Receita removida da pasta");
      loadSavedRecipes();
      loadFolders();
    } catch (error) {
      console.error("Error moving recipe:", error);
      toast.error("Erro ao mover receita");
    }
  };

  const filteredRecipes = selectedFolder
    ? savedRecipes.filter(r => r.folderId === selectedFolder)
    : savedRecipes;

  const uncategorizedCount = savedRecipes.filter(r => !r.folderId).length;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-semibold text-xl">Receitas Salvas</h1>
            <p className="text-sm text-muted-foreground">
              {savedRecipes.length} receitas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(v => v === "cards" ? "list" : "cards")}
              className="h-9 w-9"
            >
              {viewMode === "cards" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/app/scan-recipe')}
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Escanear
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Folders section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sm text-muted-foreground">Pastas</h2>
            {isPro && (
              <Dialog open={isCreateFolderOpen || !!editingFolder} onOpenChange={(open) => {
                if (!open) {
                  setIsCreateFolderOpen(false);
                  setEditingFolder(null);
                  setNewFolderName("");
                }
              }}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsCreateFolderOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Nova pasta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingFolder ? "Editar pasta" : "Nova pasta"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Nome da pasta"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          editingFolder ? handleUpdateFolder() : handleCreateFolder();
                        }
                      }}
                    />
                    <Button 
                      onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                      className="w-full"
                      disabled={!newFolderName.trim()}
                    >
                      {editingFolder ? "Salvar" : "Criar pasta"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setSelectedFolder(null)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-colors shrink-0",
                !selectedFolder 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-card border-border hover:border-primary"
              )}
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-sm font-medium">Todas ({savedRecipes.length})</span>
            </button>

            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center shrink-0">
                <button
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-l-full border-y border-l whitespace-nowrap transition-colors",
                    selectedFolder === folder.id 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-card border-border hover:border-primary"
                  )}
                >
                  <Folder className="w-4 h-4" />
                  <span className="text-sm font-medium">{folder.name} ({folder.recipeCount})</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "px-2 py-2 rounded-r-full border-y border-r transition-colors",
                        selectedFolder === folder.id 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-card border-border hover:border-primary"
                      )}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setEditingFolder(folder);
                      setNewFolderName(folder.name);
                    }}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsored content for non-Pro users */}
        {!isPro && sponsoredContent && savedRecipes.length > 0 && (
          <div className="mb-4">
            <SponsoredCard content={sponsoredContent} variant="banner" />
          </div>
        )}

        {/* Recipes grid/list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        ) : filteredRecipes.length > 0 ? (
          viewMode === "cards" ? (
            <div className="grid gap-4">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="relative">
                  <RecipeCard
                    {...recipe}
                    isSaved={true}
                    onView={() => navigate(`/app/recipe/${recipe.id}`)}
                    onSave={() => handleUnsave(recipe.id)}
                  />
                  {isPro && folders.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="absolute top-3 left-3 p-2 bg-background/80 backdrop-blur-sm rounded-full">
                          <FolderOpen className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {recipe.folderId && (
                          <DropdownMenuItem onClick={() => handleMoveToFolder(recipe.id, null)}>
                            Remover da pasta
                          </DropdownMenuItem>
                        )}
                        {folders.map((folder) => (
                          <DropdownMenuItem 
                            key={folder.id}
                            onClick={() => handleMoveToFolder(recipe.id, folder.id)}
                            disabled={recipe.folderId === folder.id}
                          >
                            <Folder className="w-4 h-4 mr-2" />
                            {folder.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
              {filteredRecipes.map((recipe) => (
                <div 
                  key={recipe.id} 
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/recipe/${recipe.id}`)}
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {recipe.imageUrl ? (
                      <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                      <ChefHat className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{recipe.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTime} min
                      </span>
                      <span>•</span>
                      <span>{recipe.servings} porções</span>
                    </div>
                  </div>
                  {isPro && folders.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 hover:bg-muted rounded-full">
                          <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {recipe.folderId && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMoveToFolder(recipe.id, null); }}>
                            Remover da pasta
                          </DropdownMenuItem>
                        )}
                        {folders.map((folder) => (
                          <DropdownMenuItem 
                            key={folder.id}
                            onClick={(e) => { e.stopPropagation(); handleMoveToFolder(recipe.id, folder.id); }}
                            disabled={recipe.folderId === folder.id}
                          >
                            <Folder className="w-4 h-4 mr-2" />
                            {folder.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUnsave(recipe.id); }}
                    className="p-2 hover:bg-destructive/10 rounded-full"
                  >
                    <Bookmark className="w-4 h-4 fill-primary text-primary" />
                  </button>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg mb-2">
              {selectedFolder ? "Nenhuma receita nesta pasta" : "Nenhuma receita salva"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {selectedFolder 
                ? "Mova receitas para esta pasta para organizá-las."
                : "Salve suas receitas favoritas para encontrá-las facilmente aqui."
              }
            </p>
          </div>
        )}

        {/* Pro Feature Hint - show only if not Pro */}
        {!isPro && (
          <div className="mt-6 p-4 bg-secondary rounded-2xl border border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FolderOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  Organize em pastas
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Crie coleções como "Café da manhã" ou "Jantar" com o Pro
                </p>
                <Button 
                  variant="link" 
                  className="px-0 h-auto text-xs mt-1"
                  onClick={() => navigate('/paywall')}
                >
                  Ver planos →
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
