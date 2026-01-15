import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é um assistente especialista em supermercados brasileiros que extrai itens de uma lista de compras a partir de mensagens em linguagem natural.

TAREFA:
Extraia TODOS os itens mencionados pelo usuário e retorne em formato JSON, incluindo a categoria de cada item.

FORMATO DE RESPOSTA OBRIGATÓRIO (apenas JSON, sem texto adicional):
{
  "items": [
    {"name": "Nome do Item", "quantity": "quantidade ou null", "category": "Categoria"},
    {"name": "Outro Item", "quantity": null, "category": "Categoria"}
  ]
}

CATEGORIAS DISPONÍVEIS (use exatamente estes nomes):
- Bebidas (refrigerantes, sucos, água, cerveja, vinho, energéticos, chás prontos, café pronto, isotônicos, etc.)
- Frutas (banana, maçã, laranja, uva, morango, abacaxi, manga, melancia, limão, etc.)
- Verduras e Legumes (alface, rúcula, espinafre, couve, repolho, brócolis, couve-flor, tomate, cenoura, batata, abóbora, abobrinha, pepino, pimentão, berinjela, beterraba, mandioca, inhame, chuchu, quiabo, jiló, maxixe - APENAS vegetais usados como alimento principal, NÃO inclui ervas aromáticas)
- Carnes (frango, carne bovina, peixe, linguiça, bacon, salsicha, carne suína, cordeiro, pato, etc.)
- Laticínios (leite, queijo, iogurte, manteiga, requeijão, creme de leite, leite condensado, nata, etc.)
- Grãos e Cereais (arroz, feijão, macarrão, aveia, lentilha, grão-de-bico, farinha, fubá, cuscuz, quinoa, etc.)
- Limpeza (detergente, sabão, desinfetante, água sanitária, amaciante, esponja, saco de lixo, etc.)
- Higiene Pessoal (shampoo, sabonete, pasta de dente, papel higiênico, absorvente, desodorante, etc.)
- Padaria (pão, bolo, biscoito, bolacha, torrada, pão de queijo, croissant, etc.)
- Frios (presunto, mortadela, peito de peru, salame, queijo fatiado, apresuntado, etc.)
- Congelados (pizza, lasanha, sorvete, hambúrguer congelado, legumes congelados, etc.)
- Temperos e Ervas (TODAS as ervas aromáticas frescas ou secas: manjericão, orégano, alecrim, salsinha, cebolinha, coentro, tomilho, louro, hortelã, endro, estragão, erva-doce, sálvia, manjerona; E TODOS os temperos: sal, açúcar, pimenta, alho, cebola em pó, canela, noz-moscada, cominho, colorau, páprica, curry, açafrão, gengibre, cravo, cardamomo, mostarda em pó, pimenta-do-reino, pimenta calabresa, chimichurri, ervas finas, tempero pronto, caldo de galinha, etc.)
- Outros (itens que não se encaixam em nenhuma categoria acima)

REGRAS IMPORTANTES DE CATEGORIZAÇÃO:
1. ERVAS AROMÁTICAS (manjericão, orégano, alecrim, salsinha, cebolinha, coentro, tomilho, louro, hortelã, etc.) SEMPRE vão em "Temperos e Ervas", NUNCA em "Verduras e Legumes"
2. Alho e cebola quando mencionados sozinhos são "Temperos e Ervas" (usados como tempero)
3. Qualquer item usado principalmente para dar sabor/aroma à comida vai em "Temperos e Ervas"
4. Pimentas (calabresa, do reino, dedo-de-moça seca) vão em "Temperos e Ervas"
5. Verduras são apenas vegetais consumidos como alimento principal (alface, rúcula, couve, brócolis, etc.)

REGRAS:
1. Capitalize a primeira letra de cada item
2. Se tiver quantidade, extraia (ex: "2 litros de leite" -> {"name": "Leite", "quantity": "2 litros", "category": "Laticínios"})
3. Se não tiver quantidade, use null
4. Remova palavras como "comprar", "adicionar", "preciso de", "quero"
5. Separe itens compostos (ex: "arroz e feijão" -> 2 itens separados)
6. Normalize nomes (ex: "bananas" -> "Banana", "ovos" -> "Ovos")
7. Agrupe quantidades com unidades: kg, g, litros, ml, unidades, pacotes, latas, etc.
8. SEMPRE inclua a categoria mais apropriada para cada item

EXEMPLOS:
- "coca-cola, guaraná e sprite" -> [{"name": "Coca-Cola", "quantity": null, "category": "Bebidas"}, {"name": "Guaraná", "quantity": null, "category": "Bebidas"}, {"name": "Sprite", "quantity": null, "category": "Bebidas"}]
- "2kg de arroz, 1 litro de óleo" -> [{"name": "Arroz", "quantity": "2kg", "category": "Grãos e Cereais"}, {"name": "Óleo", "quantity": "1 litro", "category": "Temperos e Ervas"}]
- "preciso comprar ovos, queijo e presunto fatiado" -> [{"name": "Ovos", "quantity": null, "category": "Laticínios"}, {"name": "Queijo", "quantity": null, "category": "Laticínios"}, {"name": "Presunto fatiado", "quantity": null, "category": "Frios"}]
- "manjericão e orégano" -> [{"name": "Manjericão", "quantity": null, "category": "Temperos e Ervas"}, {"name": "Orégano", "quantity": null, "category": "Temperos e Ervas"}]
- "salsinha, cebolinha e coentro" -> [{"name": "Salsinha", "quantity": null, "category": "Temperos e Ervas"}, {"name": "Cebolinha", "quantity": null, "category": "Temperos e Ervas"}, {"name": "Coentro", "quantity": null, "category": "Temperos e Ervas"}]
- "alface, rúcula e tomate" -> [{"name": "Alface", "quantity": null, "category": "Verduras e Legumes"}, {"name": "Rúcula", "quantity": null, "category": "Verduras e Legumes"}, {"name": "Tomate", "quantity": null, "category": "Verduras e Legumes"}]`;

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
      category: string | null;
    }
    
    let parsedItems: { items: ParsedItem[] } = { items: [] };
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedItems = JSON.parse(jsonMatch[0]);
        // Ensure each item has a category
        parsedItems.items = parsedItems.items.map(item => ({
          ...item,
          category: item.category || "Outros"
        }));
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: treat the message as a single item
      parsedItems = { items: [{ name: message.trim(), quantity: null, category: "Outros" }] };
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
