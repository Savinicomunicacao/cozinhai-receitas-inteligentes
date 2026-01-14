import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, FolderOpen } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";

// Import recipe images
import frangoCremoso from "@/assets/recipe-frango-cremoso.jpg";
import panquecaBanana from "@/assets/recipe-panqueca-banana.jpg";
import macarrao from "@/assets/recipe-macarrao.jpg";

interface SavedRecipe {
  id: string;
  title: string;
  imageUrl?: string;
  prepTime: number;
  servings: number;
  difficulty: "facil" | "medio" | "dificil";
  tags: string[];
}

// Sample saved recipes for demo
const sampleSavedRecipes: SavedRecipe[] = [
  {
    id: "1",
    title: "Frango Cremoso Rápido",
    imageUrl: frangoCremoso,
    prepTime: 25,
    servings: 4,
    difficulty: "facil",
    tags: ["Rápida", "Proteína"],
  },
  {
    id: "2",
    title: "Macarrão Alho e Óleo",
    imageUrl: macarrao,
    prepTime: 15,
    servings: 2,
    difficulty: "facil",
    tags: ["Rápida", "Econômica"],
  },
  {
    id: "3",
    title: "Panqueca de Banana",
    imageUrl: panquecaBanana,
    prepTime: 20,
    servings: 2,
    difficulty: "facil",
    tags: ["Café da manhã", "Fit"],
  },
];

export default function Saved() {
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState(sampleSavedRecipes);

  const handleUnsave = (id: string) => {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <h1 className="font-display font-semibold text-xl">Receitas Salvas</h1>
        <p className="text-sm text-muted-foreground">
          {savedRecipes.length} receitas
        </p>
      </header>

      <main className="px-4 py-4">
        {savedRecipes.length > 0 ? (
          <div className="grid gap-4">
            {savedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                {...recipe}
                isSaved={true}
                onView={() => navigate(`/app/recipe/${recipe.id}`)}
                onSave={() => handleUnsave(recipe.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg mb-2">
              Nenhuma receita salva
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Salve suas receitas favoritas para encontrá-las facilmente aqui.
            </p>
          </div>
        )}

        {/* Pro Feature Hint */}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
