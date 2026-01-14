import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface Recipe {
  id: string;
  title: string;
  imageUrl?: string;
  prepTime: number;
  servings: number;
  difficulty: "facil" | "medio" | "dificil";
  tags: string[];
  shortReason?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recipes?: Recipe[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente de cozinha. Me conta o que você tem na geladeira ou o que está com vontade de comer, e eu sugiro receitas deliciosas!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const parseAIResponse = (text: string): { message: string; recipes?: Recipe[] } => {
    try {
      // Try to parse as JSON first
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.message && parsed.recipes) {
          return {
            message: parsed.message,
            recipes: parsed.recipes.map((r: any) => ({
              ...r,
              difficulty: r.difficulty || "facil",
            })),
          };
        }
      }
    } catch (e) {
      console.log("Not a JSON response, treating as plain text");
    }
    
    return { message: text };
  };

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistantMessage = (content: string) => {
      const parsed = parseAIResponse(content);
      
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === "assistant" && lastMsg.id !== "welcome") {
          return prev.map((m, i) =>
            i === prev.length - 1
              ? { ...m, content: parsed.message, recipes: parsed.recipes }
              : m
          );
        }
        return [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant" as const,
            content: parsed.message,
            recipes: parsed.recipes,
          },
        ];
      });
    };

    try {
      // Prepare conversation history for API
      const apiMessages = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.role,
          content: m.content,
        }));
      
      apiMessages.push({ role: "user", content: text });

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          userPreferences: profile?.preferences || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateAssistantMessage(assistantContent);
            }
          } catch {
            // Incomplete JSON, continue
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              updateAssistantMessage(assistantContent);
            }
          } catch { /* ignore */ }
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: error instanceof Error 
            ? `Desculpe, houve um erro: ${error.message}` 
            : "Desculpe, houve um erro. Tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, profile]);

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
