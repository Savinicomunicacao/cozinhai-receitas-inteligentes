import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Mic, Loader2, Check, X, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ParsedRecipe {
  title: string;
  description: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  steps: string[];
  prepTime: number;
  servings: number;
  difficulty: "facil" | "medio" | "dificil";
  tags: string[];
}

export default function ScanRecipe() {
  const navigate = useNavigate();
  const { user, isPro } = useAuth();
  const [mode, setMode] = useState<"photo" | "audio" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const parseIngredientString = (text: string): { name: string; quantity: string; unit: string } => {
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 3) {
      // Tenta extrair: "2 xícaras farinha" ou "1 colher de sopa açúcar"
      const quantity = parts[0];
      const unit = parts[1];
      const name = parts.slice(2).join(" ");
      return { quantity, unit, name };
    } else if (parts.length === 2) {
      return { quantity: parts[0], unit: "", name: parts[1] };
    }
    return { quantity: "", unit: "", name: text.trim() };
  };
  
  const handleAddIngredient = () => {
    if (!parsedRecipe || !newIngredient.trim()) return;
    const parsed = parseIngredientString(newIngredient);
    setParsedRecipe({
      ...parsedRecipe,
      ingredients: [...parsedRecipe.ingredients, parsed]
    });
    setNewIngredient("");
    setShowAddIngredient(false);
  };

  const parseRecipeWithAPI = async (content: string, type: "image" | "text"): Promise<ParsedRecipe | null> => {
    try {
      console.log(`[ScanRecipe] Calling parse-recipe function - type: ${type}`);
      console.log(`[ScanRecipe] Content length: ${content.length}`);
      
      const { data, error } = await supabase.functions.invoke('parse-recipe', {
        body: { content, type }
      });

      console.log('[ScanRecipe] parse-recipe response:', data);

      if (error) {
        console.error('[ScanRecipe] Function error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('[ScanRecipe] API error:', data.error);
        if (data.rawResponse) {
          console.log('[ScanRecipe] Raw response:', data.rawResponse);
        }
        throw new Error(data.error);
      }

      if (data?.recipe) {
        console.log('[ScanRecipe] Recipe parsed successfully:', data.recipe.title);
        return data.recipe;
      }

      return null;
    } catch (error) {
      console.error("[ScanRecipe] Error parsing recipe:", error);
      return null;
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    setIsProcessing(true);
    setMode("photo");
    setProcessingStep("Lendo imagem...");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);

      setProcessingStep("Extraindo texto da imagem (OCR)...");
      toast.info("Analisando receita...");
      
      const recipe = await parseRecipeWithAPI(base64, "image");
      
      if (recipe) {
        setParsedRecipe(recipe);
        toast.success("Receita identificada!");
      } else {
        toast.error("Não foi possível identificar a receita. Tente novamente.");
        setImagePreview(null);
        setMode(null);
      }
      setIsProcessing(false);
      setProcessingStep("");
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        setProcessingStep("Preparando áudio...");
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
        });
        reader.readAsDataURL(audioBlob);
        const base64Audio = await base64Promise;

        setProcessingStep("Transcrevendo áudio...");
        toast.info("Transcrevendo áudio...");
        
        console.log('[ScanRecipe] Calling transcribe function...');
        
        // Transcribe audio
        const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe', {
          body: { audio: base64Audio, mimeType: audioBlob.type }
        });

        console.log('[ScanRecipe] Transcribe response:', transcribeData);

        if (transcribeError || !transcribeData?.transcript) {
          console.error('[ScanRecipe] Transcription error:', transcribeError);
          toast.error("Não foi possível transcrever o áudio.");
          setIsProcessing(false);
          setProcessingStep("");
          setMode(null);
          return;
        }

        console.log('[ScanRecipe] Transcription:', transcribeData.transcript);
        
        setProcessingStep("Estruturando receita...");
        toast.info("Estruturando receita...");
        
        const recipe = await parseRecipeWithAPI(transcribeData.transcript, "text");
        
        if (recipe) {
          setParsedRecipe(recipe);
          toast.success("Receita identificada!");
        } else {
          toast.error("Não foi possível identificar a receita. Tente novamente.");
          setMode(null);
        }
        setIsProcessing(false);
        setProcessingStep("");
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setMode("audio");
      toast.success("Gravando... Fale sua receita");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!parsedRecipe || !user) return;

    setIsProcessing(true);
    try {
      // Save recipe to database
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          title: parsedRecipe.title,
          description: parsedRecipe.description,
          ingredients: parsedRecipe.ingredients,
          steps: parsedRecipe.steps,
          prep_time_minutes: parsedRecipe.prepTime,
          servings: parsedRecipe.servings,
          difficulty: parsedRecipe.difficulty,
          tags: parsedRecipe.tags,
          is_manual: true
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Also save to saved_recipes
      await supabase
        .from('saved_recipes')
        .insert({
          user_id: user.id,
          recipe_id: recipeData.id
        });

      toast.success("Receita salva com sucesso!");
      navigate(`/app/recipe/${recipeData.id}`);
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast.error("Erro ao salvar receita. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setMode(null);
    setParsedRecipe(null);
    setImagePreview(null);
    setIsRecording(false);
    setProcessingStep("");
  };

  if (!isPro) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-semibold text-xl">Escanear Receita</h1>
          </div>
        </header>
        
        <main className="px-4 py-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display font-semibold text-lg mb-2">Função Pro</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Escaneie receitas e salve-as automaticamente com o plano Pro.
          </p>
          <Button onClick={() => navigate('/paywall')}>Ver planos</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-semibold text-xl">Escanear Receita</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoSelect}
        />

        {!mode && !parsedRecipe && (
          <div className="space-y-6">
            <p className="text-muted-foreground text-center">
              Escolha como deseja adicionar sua receita
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-2xl hover:border-primary transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Tirar Foto</p>
                  <p className="text-xs text-muted-foreground">Fotografe uma receita</p>
                </div>
              </button>

              <button
                onClick={startRecording}
                className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-2xl hover:border-primary transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Mic className="w-7 h-7 text-accent" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Gravar Áudio</p>
                  <p className="text-xs text-muted-foreground">Dite sua receita</p>
                </div>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Upload className="w-4 h-4" />
                Ou escolha da galeria
              </button>
            </div>
          </div>
        )}

        {/* Recording mode */}
        {isRecording && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
              <Mic className="w-12 h-12 text-accent" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-lg">Gravando...</p>
              <p className="text-sm text-muted-foreground">Fale sua receita com detalhes</p>
            </div>
            <Button onClick={stopRecording} variant="outline" size="lg">
              <X className="w-4 h-4 mr-2" />
              Parar gravação
            </Button>
          </div>
        )}

        {/* Processing */}
        {isProcessing && !isRecording && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-muted-foreground">Processando receita...</p>
              {processingStep && (
                <p className="text-sm text-primary mt-2">{processingStep}</p>
              )}
            </div>
          </div>
        )}

        {/* Image preview */}
        {imagePreview && !isProcessing && !parsedRecipe && (
          <div className="space-y-4">
            <img 
              src={imagePreview} 
              alt="Receita" 
              className="w-full max-h-64 object-cover rounded-2xl"
            />
          </div>
        )}

        {/* Parsed recipe preview */}
        {parsedRecipe && !isProcessing && (
          <div className="space-y-6">
            {/* Image preview if available */}
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Receita" 
                className="w-full h-40 object-cover rounded-2xl"
              />
            )}
            
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Título</label>
                <Input 
                  value={parsedRecipe.title}
                  onChange={(e) => setParsedRecipe({...parsedRecipe, title: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Descrição</label>
                <Textarea 
                  value={parsedRecipe.description}
                  onChange={(e) => setParsedRecipe({...parsedRecipe, description: e.target.value})}
                  className="mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Tempo (min)</label>
                  <Input 
                    type="number"
                    value={parsedRecipe.prepTime}
                    onChange={(e) => setParsedRecipe({...parsedRecipe, prepTime: parseInt(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Porções</label>
                  <Input 
                    type="number"
                    value={parsedRecipe.servings}
                    onChange={(e) => setParsedRecipe({...parsedRecipe, servings: parseInt(e.target.value) || 0})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Dificuldade</label>
                  <select
                    value={parsedRecipe.difficulty}
                    onChange={(e) => setParsedRecipe({...parsedRecipe, difficulty: e.target.value as any})}
                    className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="facil">Fácil</option>
                    <option value="medio">Médio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Ingredientes ({parsedRecipe.ingredients.length})</label>
                <div className="mt-1 space-y-1 max-h-40 overflow-y-auto">
                  {parsedRecipe.ingredients.map((ing, i) => (
                    <div key={i} className="text-sm py-1 px-2 bg-secondary rounded flex items-center gap-2">
                      <span className="flex-1">{ing.quantity} {ing.unit} {ing.name}</span>
                      <button 
                        onClick={() => {
                          const newIngredients = parsedRecipe.ingredients.filter((_, idx) => idx !== i);
                          setParsedRecipe({...parsedRecipe, ingredients: newIngredients});
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Add ingredient */}
                {showAddIngredient ? (
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Ex: 2 xícaras farinha"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddIngredient();
                        if (e.key === 'Escape') {
                          setShowAddIngredient(false);
                          setNewIngredient("");
                        }
                      }}
                      autoFocus
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddIngredient} disabled={!newIngredient.trim()}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowAddIngredient(false); setNewIngredient(""); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddIngredient(true)}
                    className="mt-2 flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar ingrediente
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Passos ({parsedRecipe.steps.length})</label>
                <div className="mt-1 space-y-1 max-h-48 overflow-y-auto">
                  {parsedRecipe.steps.map((step, i) => (
                    <div key={i} className="text-sm py-2 px-2 bg-secondary rounded">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-medium">{i + 1}.</span>
                        <span className="flex-1">{step}</span>
                        <button 
                          onClick={() => {
                            const newSteps = parsedRecipe.steps.filter((_, idx) => idx !== i);
                            setParsedRecipe({...parsedRecipe, steps: newSteps});
                          }}
                          className="text-muted-foreground hover:text-destructive flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {parsedRecipe.tags.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {parsedRecipe.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveRecipe} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Salvar Receita
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
