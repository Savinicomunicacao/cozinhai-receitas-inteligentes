import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronLeft, 
  Clock, 
  Users, 
  Bookmark,
  BookmarkCheck,
  Play,
  ShoppingCart,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import recipe image
import frangoCremoso from "@/assets/recipe-frango-cremoso.jpg";

// Sample recipe data
const sampleRecipe = {
  id: "1",
  title: "Frango Cremoso Rápido",
  imageUrl: frangoCremoso,
  description: "Uma receita deliciosa e prática para o dia a dia. Perfeita para quando você quer algo saboroso sem muito trabalho.",
  prepTime: 25,
  servings: 4,
  difficulty: "facil" as const,
  tags: ["Rápida", "Proteína", "Sem glúten"],
  ingredients: [
    { name: "Peito de frango", qty: "500", unit: "g", have: true },
    { name: "Creme de leite", qty: "200", unit: "ml", have: true },
    { name: "Cebola", qty: "1", unit: "un", have: true },
    { name: "Alho", qty: "3", unit: "dentes", have: true },
    { name: "Tomate pelado", qty: "200", unit: "g", have: false },
    { name: "Manjericão fresco", qty: "a gosto", have: false },
    { name: "Sal e pimenta", qty: "a gosto", have: true },
  ],
  steps: [
    "Corte o frango em cubos médios e tempere com sal e pimenta.",
    "Em uma frigideira grande, aqueça um fio de azeite e doure o frango. Reserve.",
    "Na mesma frigideira, refogue a cebola e o alho picados até dourar.",
    "Adicione o tomate pelado e deixe cozinhar por 5 minutos.",
    "Junte o frango, o creme de leite e misture bem.",
    "Deixe cozinhar em fogo baixo por mais 5 minutos.",
    "Finalize com manjericão fresco e sirva com arroz.",
  ],
};

const difficultyLabels = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

export default function Recipe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">("ingredients");

  const missingItems = sampleRecipe.ingredients.filter(i => !i.have);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Image */}
      <div className="relative aspect-[4/3] bg-muted">
        {sampleRecipe.imageUrl ? (
          <img 
            src={sampleRecipe.imageUrl} 
            alt={sampleRecipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="w-20 h-20 text-muted-foreground/20" />
          </div>
        )}
        
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-soft"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-soft"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-primary" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 -mt-6 relative z-10">
        <div className="bg-card rounded-t-3xl shadow-elevated pt-6">
          {/* Title & Meta */}
          <div className="px-4 pb-4 border-b border-border">
            <h1 className="font-display font-bold text-2xl mb-2">
              {sampleRecipe.title}
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              {sampleRecipe.description}
            </p>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {sampleRecipe.prepTime} min
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                {sampleRecipe.servings} porções
              </span>
              <span className="chip chip-primary">
                {difficultyLabels[sampleRecipe.difficulty]}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {sampleRecipe.tags.map((tag) => (
                <span key={tag} className="chip chip-muted text-xs">
                  {tag}
                </span>
              ))}
            </div>
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
              Ingredientes
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
              Modo de preparo
              {activeTab === "steps" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-4">
            {activeTab === "ingredients" ? (
              <div className="space-y-3">
                {sampleRecipe.ingredients.map((ingredient, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl",
                      ingredient.have ? "bg-muted/50" : "bg-accent/10"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                      ingredient.have 
                        ? "bg-success/20 text-success" 
                        : "bg-accent/20 text-accent"
                    )}>
                      {ingredient.have ? <Check className="w-3 h-3" /> : "!"}
                    </div>
                    <span className="flex-1 text-sm">
                      {ingredient.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {ingredient.qty} {ingredient.unit}
                    </span>
                  </div>
                ))}

                {/* Missing items alert */}
                {missingItems.length > 0 && (
                  <div className="mt-4 p-4 bg-accent/10 rounded-2xl">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Você precisa de {missingItems.length} itens
                    </p>
                    <Button 
                      variant="accent" 
                      size="sm"
                      className="w-full"
                      onClick={() => {}}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Gerar lista de compras (Pro)
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <ol className="space-y-4">
                {sampleRecipe.steps.map((step, i) => (
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

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border safe-area-bottom">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setIsSaved(!isSaved)}
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
