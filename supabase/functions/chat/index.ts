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
- TODAS as receitas DEVEM usar TODOS os ingredientes mencionados pelo usuário
- Se precisar de ingredientes adicionais além dos mencionados (temperos, óleo, etc), PERGUNTE ao usuário se ele tem antes de sugerir

FORMATO DE RESPOSTA OBRIGATÓRIO:
Quando o usuário mencionar ingredientes, responda SEMPRE neste formato JSON exato:

{
  "message": "Sua mensagem confirmando os ingredientes (1-2 frases)",
  "recipes": [
    {
      "id": "slug-unico-da-receita",
      "title": "Nome da Receita",
      "description": "Descrição curta de 1-2 frases",
      "prepTime": 25,
      "servings": 4,
      "difficulty": "facil",
      "tags": ["Rápida", "Econômica"],
      "shortReason": "Usa todos os seus ingredientes: X, Y e Z",
      "ingredients": [
        {"name": "Ingrediente 1", "qty": "500", "unit": "g", "fromUser": true},
        {"name": "Sal", "qty": "a gosto", "unit": "", "fromUser": false}
      ],
      "steps": [
        "Passo 1 detalhado...",
        "Passo 2 detalhado...",
        "Passo 3 detalhado..."
      ]
    }
  ],
  "needsConfirmation": ["sal", "óleo", "pimenta"]
}

REGRAS IMPORTANTES:
1. TODAS as receitas DEVEM usar TODOS os ingredientes que o usuário mencionou (marcar fromUser: true)
2. Ingredientes extras básicos (sal, óleo, temperos) devem ir em "needsConfirmation" para perguntar ao usuário
3. difficulty: "facil", "medio" ou "dificil"
4. tags: "Rápida", "Econômica", "Fit", "Saudável", "Comfort Food", "Airfryer", "Vegetariana", "Sem lactose"
5. Gere receitas REAIS e PRÁTICAS, não invente pratos impossíveis
6. prepTime em minutos
7. shortReason DEVE mencionar os ingredientes do usuário
8. steps devem ser detalhados e claros (5-10 passos)
9. ingredients devem ter quantidades realistas

Se o usuário fizer uma pergunta geral (não sobre receitas), responda normalmente sem JSON.

EXEMPLO DE INTERAÇÃO:
Usuário: "tenho frango, creme de leite e tomate"
Resposta: {"message": "Ótimo! Com frango, creme de leite e tomate dá para fazer pratos incríveis. Você tem sal, alho e cebola para temperar?", "needsConfirmation": ["sal", "alho", "cebola"], "recipes": [...]}`;

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

    let enhancedSystemPrompt = SYSTEM_PROMPT;
    if (userPreferences && Object.keys(userPreferences).length > 0) {
      enhancedSystemPrompt += `\n\nPREFERÊNCIAS DO USUÁRIO:
- Velocidade: ${userPreferences.speed?.join(', ') || 'qualquer'}
- Objetivos: ${userPreferences.goals?.join(', ') || 'nenhum específico'}
- Restrições: ${userPreferences.restrictions?.join(', ') || 'nenhuma'}
- Equipamentos: ${userPreferences.equipment?.join(', ') || 'básico'}

Considere estas preferências ao sugerir receitas. Por exemplo, se tem restrição "sem-lactose", não use laticínios.`;
    }

    console.log("Sending request to Lovable AI Gateway...");
    
    // Process messages to handle images
    const processedMessages = messages.map((msg: any) => {
      if (msg.content && msg.content.startsWith('[IMAGEM:')) {
        // Extract base64 image data
        const imageData = msg.content.replace('[IMAGEM:', '').replace(']', '');
        return {
          role: msg.role,
          content: [
            {
              type: "image_url",
              image_url: { url: imageData }
            },
            {
              type: "text",
              text: "Identifique os ingredientes visíveis nesta foto e sugira receitas que eu possa fazer com eles. Liste cada ingrediente que você consegue identificar."
            }
          ]
        };
      }
      return msg;
    });
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...processedMessages,
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
