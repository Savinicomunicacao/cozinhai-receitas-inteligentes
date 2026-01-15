import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é um assistente que extrai itens de uma lista de compras a partir de mensagens em linguagem natural.

TAREFA:
Extraia TODOS os itens mencionados pelo usuário e retorne em formato JSON.

FORMATO DE RESPOSTA OBRIGATÓRIO (apenas JSON, sem texto adicional):
{
  "items": [
    {"name": "Nome do Item", "quantity": "quantidade ou null"},
    {"name": "Outro Item", "quantity": null}
  ]
}

REGRAS:
1. Capitalize a primeira letra de cada item
2. Se tiver quantidade, extraia (ex: "2 litros de leite" -> {"name": "Leite", "quantity": "2 litros"})
3. Se não tiver quantidade, use null
4. Remova palavras como "comprar", "adicionar", "preciso de", "quero"
5. Separe itens compostos (ex: "arroz e feijão" -> 2 itens separados)
6. Normalize nomes (ex: "bananas" -> "Banana", "ovos" -> "Ovos")
7. Agrupe quantidades com unidades: kg, g, litros, ml, unidades, pacotes, latas, etc.

EXEMPLOS:
- "banana, leite e pão" -> [{"name": "Banana", "quantity": null}, {"name": "Leite", "quantity": null}, {"name": "Pão", "quantity": null}]
- "2kg de arroz, 1 litro de óleo" -> [{"name": "Arroz", "quantity": "2kg"}, {"name": "Óleo", "quantity": "1 litro"}]
- "preciso comprar ovos, queijo e presunto fatiado" -> [{"name": "Ovos", "quantity": null}, {"name": "Queijo", "quantity": null}, {"name": "Presunto fatiado", "quantity": null}]`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ items: [], error: "Mensagem inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured");
    }

    console.log("Parsing shopping items from message:", message);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", content);

    // Parse JSON from response
    interface ParsedItem {
      name: string;
      quantity: string | null;
    }
    
    let parsedItems: { items: ParsedItem[] } = { items: [] };
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedItems = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: treat the message as a single item
      parsedItems = { items: [{ name: message.trim(), quantity: null }] };
    }

    console.log("Parsed items:", parsedItems);

    return new Response(
      JSON.stringify(parsedItems),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Parse shopping items error:", error);
    return new Response(
      JSON.stringify({ items: [], error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
