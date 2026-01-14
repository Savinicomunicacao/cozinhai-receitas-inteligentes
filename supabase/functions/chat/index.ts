import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é o chef assistente do Cozinha.ai - um aplicativo de receitas em português brasileiro.

REGRAS DE COMPORTAMENTO:
- Sempre responda em português brasileiro
- Tom: acolhedor, direto, confiante, mas nunca infantilizante
- Seja prático e objetivo
- Priorize receitas simples e rápidas

FORMATO DE RESPOSTA:
Quando o usuário mencionar ingredientes ou pedir sugestões de receitas, responda SEMPRE neste formato JSON exato:

{
  "message": "Sua mensagem amigável aqui (1-2 frases curtas)",
  "recipes": [
    {
      "id": "id-unico",
      "title": "Nome da Receita",
      "prepTime": 25,
      "servings": 4,
      "difficulty": "facil",
      "tags": ["Rápida", "Econômica"],
      "shortReason": "Motivo curto de 1 linha"
    }
  ]
}

REGRAS DAS RECEITAS:
- Sugira 2-4 receitas relevantes
- difficulty pode ser: "facil", "medio", "dificil"
- tags podem incluir: "Rápida", "Econômica", "Fit", "Saudável", "Comfort Food", "Airfryer", "Vegetariana", "Sem lactose"
- prepTime em minutos
- id deve ser único (use slug do título)
- shortReason deve ser uma frase curta explicando por que a receita é boa para os ingredientes mencionados

Se o usuário fizer uma pergunta geral (não sobre receitas), responda normalmente em texto sem JSON.

Se o usuário mencionar ingredientes, confirme brevemente o que entendeu antes de sugerir.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userPreferences } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured");
    }

    // Add preferences to system prompt if available
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    if (userPreferences) {
      enhancedSystemPrompt += `\n\nPREFERÊNCIAS DO USUÁRIO:
- Velocidade: ${userPreferences.speed?.join(', ') || 'qualquer'}
- Objetivos: ${userPreferences.goals?.join(', ') || 'nenhum específico'}
- Restrições: ${userPreferences.restrictions?.join(', ') || 'nenhuma'}
- Equipamentos: ${userPreferences.equipment?.join(', ') || 'básico'}

Considere estas preferências ao sugerir receitas.`;
    }

    console.log("Sending request to Lovable AI Gateway...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    console.log("Streaming response back to client...");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
