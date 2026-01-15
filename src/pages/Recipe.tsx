import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, 
  Clock, 
  Users, 
  Bookmark,
  BookmarkCheck,
  Play,
  Check,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SponsoredCard } from "@/components/SponsoredCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSponsoredContent } from "@/hooks/useSponsoredContent";
import { toast } from "sonner";

interface Ingredient {
  name: string;
  qty: string;
  unit: string;
  fromUser?: boolean;
}

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prep_time_minutes: number;
  servings: number;
  difficulty: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  image_url: string | null;
}

const difficultyLabels: Record<string, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

export default function Recipe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">("ingredients");
  const { content: sponsoredContent } = useSponsoredContent("recipe");
  const isPro = profile?.is_pro ?? false;

  useEffect(() => {
    if (id) {
      loadRecipe();
      checkIfSaved();
    }
  }, [id]);

  const loadRecipe = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Parse ingredients
      let ingredients: Ingredient[] = [];
      if (data.ingredients) {
        if (typeof data.ingredients === 'string') {
          ingredients = JSON.parse(data.ingredients);
        } else if (Array.isArray(data.ingredients)) {
          ingredients = data.ingredients as unknown as Ingredient[];
        }
      }
      
      setRecipe({
        id: data.id,
        title: data.title,
        description: data.description,
        prep_time_minutes: data.prep_time_minutes,
        servings: data.servings,
        difficulty: data.difficulty,
        tags: data.tags || [],
        ingredients: ingredients,
        steps: data.steps || [],
        image_url: data.image_url,
      });
    } catch (error) {
      console.error('Error loading recipe:', error);
      toast.error('Receita não encontrada');
      navigate('/app/chat');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfSaved = async () => {
    if (!id || !user) return;

    try {
      const { data } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('recipe_id', id)
        .eq('user_id', user.id)
        .single();

      setIsSaved(!!data);
    } catch {
      setIsSaved(false);
    }
  };

  const toggleSave = async () => {
    if (!id || !user) {
      toast.error('Faça login para salvar receitas');
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from('saved_recipes')
          .delete()
          .eq('recipe_id', id)
          .eq('user_id', user.id);
        setIsSaved(false);
        toast.success('Receita removida dos favoritos');
      } else {
        await supabase
          .from('saved_recipes')
          .insert([{ recipe_id: id, user_id: user.id }]);
        setIsSaved(true);
        toast.success('Receita salva!');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Erro ao salvar receita');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Receita não encontrada</p>
      </div>
    );
  }

  const userIngredients = recipe.ingredients.filter(i => i.fromUser);
  const extraIngredients = recipe.ingredients.filter(i => !i.fromUser);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 pt-12 pb-20">
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between safe-area-top">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-soft"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={toggleSave}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-soft"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Title preview */}
        <div className="px-4 pt-8">
          <h1 className="font-display font-bold text-2xl text-center">
            {recipe.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 -mt-12 relative z-10">
        <div className="bg-card rounded-3xl shadow-elevated pt-6">
          {/* Meta */}
          <div className="px-4 pb-4 border-b border-border">
            {recipe.description && (
              <p className="text-muted-foreground text-sm mb-4">
                {recipe.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {recipe.prep_time_minutes} min
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                {recipe.servings} porções
              </span>
              <span className="chip chip-primary">
                {difficultyLabels[recipe.difficulty] || recipe.difficulty}
              </span>
            </div>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {recipe.tags.map((tag) => (
                  <span key={tag} className="chip chip-muted text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("ingredients")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors relative",
                activeTab === "ingredients" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              Ingredientes ({recipe.ingredients.length})
              {activeTab === "ingredients" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("steps")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors relative",
                activeTab === "steps" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              Modo de preparo ({recipe.steps.length})
              {activeTab === "steps" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-4">
            {activeTab === "ingredients" ? (
              <div className="space-y-4">
                {/* User ingredients */}
                {userIngredients.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">
                      Seus ingredientes
                    </p>
                    <div className="space-y-2">
                      {userIngredients.map((ingredient, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl bg-success/10"
                        >
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-success/20 text-success">
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="flex-1 text-sm">
                            {ingredient.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {ingredient.qty} {ingredient.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra ingredients */}
                {extraIngredients.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">
                      Ingredientes extras
                    </p>
                    <div className="space-y-2">
                      {extraIngredients.map((ingredient, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                        >
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                            +
                          </div>
                          <span className="flex-1 text-sm">
                            {ingredient.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {ingredient.qty} {ingredient.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* If no separation, show all */}
                {userIngredients.length === 0 && extraIngredients.length === 0 && recipe.ingredients.length > 0 && (
                  <div className="space-y-2">
                    {recipe.ingredients.map((ingredient, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/20 text-primary text-xs">
                          {i + 1}
                        </div>
                        <span className="flex-1 text-sm">
                          {ingredient.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ingredient.qty} {ingredient.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <ol className="space-y-4">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground pt-1 leading-relaxed">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </main>

      {/* Sponsored content for non-Pro users */}
      {!isPro && sponsoredContent && (
        <div className="px-4 mb-4">
          <SponsoredCard content={sponsoredContent} variant="banner" />
        </div>
      )}

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border safe-area-bottom">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={toggleSave}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-5 h-5 mr-2" />
                Salva
              </>
            ) : (
              <>
                <Bookmark className="w-5 h-5 mr-2" />
                Salvar
              </>
            )}
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="flex-1"
            onClick={() => navigate(`/app/cook/${id}`)}
          >
            <Play className="w-5 h-5 mr-2" />
            Cozinhar
          </Button>
        </div>
      </div>
    </div>
  );
}
