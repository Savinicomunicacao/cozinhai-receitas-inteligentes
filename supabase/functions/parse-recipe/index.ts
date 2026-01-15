import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é um especialista em extração e estruturação de receitas culinárias.

TAREFA: Extrair e organizar informações de receitas a partir de:
1. IMAGENS (OCR): Ler todo texto visível e estruturar como receita
2. TEXTO (transcrição de áudio): Organizar texto falado em formato de receita

PARA IMAGENS:
- Faça OCR completo, lendo CADA palavra, número e símbolo
- Identifique título, ingredientes, passos, tempo, porções
- Aceite fotos de livros, revistas, cadernos, telas, embalagens
- Se texto estiver borrado, extraia o que for legível

PARA TEXTO/TRANSCRIÇÃO:
- Organize informações ditadas em formato estruturado
- Separe ingredientes de passos de preparo
- Infira quantidades se não forem explícitas

FORMATO DE RESPOSTA (JSON puro, sem markdown):
{
  "title": "Nome da receita",
  "description": "Descrição breve em 1-2 frases",
  "ingredients": [
    {"name": "ingrediente", "quantity": "quantidade", "unit": "unidade"}
  ],
  "steps": ["Passo 1 detalhado", "Passo 2 detalhado"],
  "prepTime": 30,
  "servings": 4,
  "difficulty": "facil",
  "tags": ["Almoço", "Saudável"]
}

REGRAS:
- difficulty deve ser: "facil", "medio" ou "dificil"
- tags podem ser: "Café da manhã", "Almoço", "Jantar", "Lanche", "Sobremesa", "Fit", "Saudável", "Rápido", "Vegano", "Vegetariano"
- Se não conseguir identificar receita, retorne title: "Receita não identificada" e arrays vazios
- RETORNE APENAS JSON, sem texto adicional`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, type } = await req.json();
    
    console.log(`[parse-recipe] Received request - type: ${type}`);
    console.log(`[parse-recipe] Content length: ${content?.length || 0}`);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[parse-recipe] LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build message based on type
    let userMessage: any;
    
    if (type === 'image') {
      console.log('[parse-recipe] Processing image (OCR mode)');
      userMessage = {
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Extraia TODA a informação desta imagem de receita. Faça OCR completo e estruture como receita no formato JSON especificado." 
          },
          { 
            type: "image_url", 
            image_url: { url: content } 
          }
        ]
      };
    } else {
      console.log('[parse-recipe] Processing text (transcription mode)');
      console.log(`[parse-recipe] Transcription: ${content.substring(0, 200)}...`);
      userMessage = {
        role: "user",
        content: `Organize esta transcrição de receita ditada no formato JSON especificado:\n\n${content}`
      };
    }

    console.log('[parse-recipe] Calling AI Gateway with gemini-2.5-pro...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          userMessage
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[parse-recipe] AI Gateway error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[parse-recipe] AI Response received');
    
    const responseText = data.choices?.[0]?.message?.content || '';
    console.log(`[parse-recipe] Raw response (first 500 chars): ${responseText.substring(0, 500)}`);
    
    // Clean and parse JSON
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

    console.log(`[parse-recipe] Cleaned JSON: ${jsonStr.substring(0, 300)}`);

    try {
      const recipe = JSON.parse(jsonStr);
      console.log(`[parse-recipe] Successfully parsed recipe: ${recipe.title}`);
      
      return new Response(JSON.stringify({
        recipe: {
          title: recipe.title || "Receita sem nome",
          description: recipe.description || "",
          ingredients: recipe.ingredients || [],
          steps: recipe.steps || [],
          prepTime: recipe.prepTime || 30,
          servings: recipe.servings || 2,
          difficulty: recipe.difficulty || "medio",
          tags: recipe.tags || []
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('[parse-recipe] JSON parse error:', parseError);
      console.error('[parse-recipe] Failed JSON string:', jsonStr);
      
      return new Response(JSON.stringify({ 
        error: "Could not parse recipe",
        rawResponse: responseText.substring(0, 1000)
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('[parse-recipe] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
