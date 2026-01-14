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

    console.log("Processing audio transcription, mimeType:", mimeType);

    // Decode base64 audio
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log("Audio size:", bytes.length, "bytes");

    // Use Lovable AI Gateway for transcription via chat completions with audio
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Convert audio to base64 data URL format for the API
    const audioDataUrl = `data:${mimeType || "audio/webm"};base64,${audio}`;

    // Use Gemini model to transcribe audio
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
            role: "system",
            content: "Você é um assistente de transcrição de áudio. Transcreva o áudio fornecido para texto em português brasileiro. Retorne APENAS a transcrição, sem comentários adicionais."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Por favor, transcreva este áudio para texto:"
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audio,
                  format: mimeType?.includes("mp4") ? "mp4" : "webm"
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Transcription error:", error);
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    const transcript = result.choices?.[0]?.message?.content || "";

    console.log("Transcription result:", transcript);

    return new Response(
      JSON.stringify({ transcript }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
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
