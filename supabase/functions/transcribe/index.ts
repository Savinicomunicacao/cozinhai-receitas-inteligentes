import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, mimeType } = await req.json();

    if (!audio) {
      throw new Error("No audio data provided");
    }

    const actualMimeType = mimeType || "audio/webm";
    console.log("Processing audio transcription, mimeType:", actualMimeType);
    console.log("Audio base64 length:", audio.length);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Use Gemini model with correct inline_data format for audio
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Você é um transcritor de áudio preciso e literal.

TAREFA: Transcreva EXATAMENTE o que foi dito no áudio em português brasileiro.

REGRAS IMPORTANTES:
- Transcreva palavra por palavra o que a pessoa disse
- NÃO invente conteúdo que não foi dito
- NÃO adicione comentários, explicações ou interpretações
- NÃO gere frases motivacionais ou filosóficas
- Retorne APENAS a transcrição literal do áudio
- Se não conseguir entender claramente alguma palavra, escreva [inaudível]
- Se o áudio estiver vazio ou silencioso, responda: "[ÁUDIO SILENCIOSO]"

Transcreva o áudio agora:`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${actualMimeType};base64,${audio}`
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Transcription API error:", response.status, error);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    const transcript = result.choices?.[0]?.message?.content || "";

    console.log("Transcription result:", transcript);

    // Check for failure cases
    if (transcript.includes("[ÁUDIO SILENCIOSO]") || transcript.includes("[ÁUDIO INAUDÍVEL]")) {
      return new Response(
        JSON.stringify({ error: "Não foi possível identificar o áudio. Tente gravar novamente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ transcript: transcript.trim() }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Transcription error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
