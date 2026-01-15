import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

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
    console.log("Processing audio transcription with OpenAI Whisper");
    console.log("Audio mimeType:", actualMimeType);
    console.log("Audio base64 length:", audio.length);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Process audio in chunks to prevent memory issues
    const binaryAudio = processBase64Chunks(audio);
    console.log("Binary audio size:", binaryAudio.length, "bytes");

    // Determine file extension based on mimeType
    let fileExtension = "webm";
    if (actualMimeType.includes("mp4") || actualMimeType.includes("m4a")) {
      fileExtension = "m4a";
    } else if (actualMimeType.includes("mp3") || actualMimeType.includes("mpeg")) {
      fileExtension = "mp3";
    } else if (actualMimeType.includes("wav")) {
      fileExtension = "wav";
    } else if (actualMimeType.includes("ogg")) {
      fileExtension = "ogg";
    }

    // Prepare form data for OpenAI Whisper API
    const formData = new FormData();
    const blob = new Blob([binaryAudio.buffer as ArrayBuffer], { type: actualMimeType });
    formData.append("file", blob, `audio.${fileExtension}`);
    formData.append("model", "whisper-1");
    formData.append("language", "pt"); // Portuguese

    // Send to OpenAI Whisper API
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI Whisper API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid OpenAI API key." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 400) {
        // Check if it's a billing/quota issue
        if (errorText.includes("quota") || errorText.includes("billing")) {
          return new Response(
            JSON.stringify({ error: "OpenAI quota exceeded. Please check your billing." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      throw new Error(`Transcription failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const transcript = result.text || "";

    console.log("Transcription result:", transcript);

    // Check for empty transcription
    if (!transcript.trim()) {
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
