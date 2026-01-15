import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Mic, Loader2, Check, X, Upload } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(false);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const parseRecipeWithAI = async (content: string, type: "image" | "text"): Promise<ParsedRecipe | null> => {
    try {
      const imagePrompt = `Você é um especialista em OCR (reconhecimento óptico de caracteres) e extração de receitas culinárias.

TAREFA CRÍTICA: Extraia TODO o texto visível desta imagem PRIMEIRO, depois estruture como receita.

ETAPA 1 - EXTRAÇÃO DE TEXTO (OCR):
- Leia CADA palavra, número e símbolo visível na imagem
- Inclua texto impresso, manuscrito, digital ou em qualquer formato
- Não ignore nenhum texto, mesmo se parecer incompleto

ETAPA 2 - IDENTIFICAÇÃO DA RECEITA:
Após extrair o texto, identifique:
- Nome/título da receita (geralmente no topo ou em destaque)
- Lista de ingredientes (procure por quantidades + nomes de alimentos)
- Modo de preparo/passos (procure por instruções sequenciais)
- Tempo de preparo, porções, dificuldade (se mencionados)

TIPOS DE IMAGEM SUPORTADOS:
- Fotos de livros de receitas, revistas, cadernos
- Receitas manuscritas/escritas à mão
- Capturas de tela de sites ou aplicativos
- Fotos de embalagens com receitas
- Qualquer imagem com texto de receita

REGRAS IMPORTANTES:
- Se o texto estiver borrado ou parcial, extraia o que for legível
- Infira ingredientes e passos mesmo se não estiverem bem formatados
- Use valores padrão razoáveis para campos não encontrados
- Se NÃO houver receita na imagem, retorne: {"title": "Receita não identificada", "description": "Não foi possível identificar uma receita nesta imagem", "ingredients": [], "steps": [], "prepTime": 0, "servings": 0, "difficulty": "facil", "tags": []}

FORMATO DE RESPOSTA (JSON puro, sem markdown, sem backticks):
{
  "title": "Nome da receita",
  "description": "Descrição breve em 1-2 frases",
  "ingredients": [{"name": "ingrediente", "quantity": "quantidade numérica", "unit": "unidade de medida"}],
  "steps": ["Passo 1 detalhado", "Passo 2 detalhado"],
  "prepTime": 30,
  "servings": 4,
  "difficulty": "facil",
  "tags": ["Almoço", "Saudável"]
}

RETORNE APENAS O JSON, sem nenhum texto antes ou depois.`;

      const textPrompt = `Analise esta transcrição de uma receita ditada e extraia todas as informações. Se alguma informação não estiver clara, use valores padrão razoáveis.

Retorne no formato JSON com os campos:
- title (string): nome da receita
- description (string curta): descrição em 1-2 frases
- ingredients (array de {name, quantity, unit}): lista de ingredientes
- steps (array de strings): passos do preparo
- prepTime (número): tempo de preparo em minutos
- servings (número): porções
- difficulty ('facil', 'medio' ou 'dificil')
- tags (array de strings: 'Café da manhã', 'Almoço', 'Jantar', 'Lanche', 'Fit', 'Saudável', etc)

RETORNE APENAS O JSON, sem markdown ou texto adicional.

Transcrição: ${content}`;

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [
            {
              role: "user",
              content: type === "image" 
                ? [
                    { type: "text", text: imagePrompt },
                    { type: "image_url", image_url: { url: content } }
                  ]
                : textPrompt
            }
          ]
        }
      });

      if (error) throw error;

      // Parse the AI response to extract JSON
      let responseText = "";
      const reader = data.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse SSE chunks
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.slice(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) responseText += content;
            } catch {}
          }
        }
      }

      // Clean up the response and parse JSON
      let jsonStr = responseText.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      const recipe = JSON.parse(jsonStr);
      return {
        title: recipe.title || "Receita sem nome",
        description: recipe.description || "",
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        prepTime: recipe.prepTime || 30,
        servings: recipe.servings || 2,
        difficulty: recipe.difficulty || "medio",
        tags: recipe.tags || []
      };
    } catch (error) {
      console.error("Error parsing recipe:", error);
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

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);

      toast.info("Analisando receita...");
      const recipe = await parseRecipeWithAI(base64, "image");
      
      if (recipe) {
        setParsedRecipe(recipe);
        toast.success("Receita identificada!");
      } else {
        toast.error("Não foi possível identificar a receita. Tente novamente.");
        setImagePreview(null);
        setMode(null);
      }
      setIsProcessing(false);
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

        toast.info("Transcrevendo áudio...");
        
        // Transcribe audio
        const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe', {
          body: { audio: base64Audio, mimeType: audioBlob.type }
        });

        if (transcribeError || !transcribeData?.transcript) {
          toast.error("Não foi possível transcrever o áudio.");
          setIsProcessing(false);
          setMode(null);
          return;
        }

        toast.info("Analisando receita...");
        const recipe = await parseRecipeWithAI(transcribeData.transcript, "text");
        
        if (recipe) {
          setParsedRecipe(recipe);
          toast.success("Receita identificada!");
        } else {
          toast.error("Não foi possível identificar a receita. Tente novamente.");
          setMode(null);
        }
        setIsProcessing(false);
        
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
            <p className="text-muted-foreground">Processando receita...</p>
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
                <div className="mt-1 space-y-1">
                  {parsedRecipe.ingredients.slice(0, 5).map((ing, i) => (
                    <div key={i} className="text-sm py-1 px-2 bg-secondary rounded">
                      {ing.quantity} {ing.unit} {ing.name}
                    </div>
                  ))}
                  {parsedRecipe.ingredients.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{parsedRecipe.ingredients.length - 5} ingredientes
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Passos ({parsedRecipe.steps.length})</label>
                <div className="mt-1 space-y-1">
                  {parsedRecipe.steps.slice(0, 3).map((step, i) => (
                    <div key={i} className="text-sm py-1 px-2 bg-secondary rounded line-clamp-1">
                      {i + 1}. {step}
                    </div>
                  ))}
                  {parsedRecipe.steps.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{parsedRecipe.steps.length - 3} passos
                    </p>
                  )}
                </div>
              </div>
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
