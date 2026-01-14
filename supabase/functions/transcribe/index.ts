import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Decode base64 audio
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create form data for Whisper API
    const formData = new FormData();
    const blob = new Blob([bytes], { type: mimeType || "audio/webm" });
    formData.append("file", blob, "audio.webm");
    formData.append("model", "whisper-1");
    formData.append("language", "pt");

    // Use Lovable AI Gateway for transcription
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Use OpenAI Whisper through the gateway
    const response = await fetch("https://ai-gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Transcription error:", error);
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ transcript: result.text }),
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
