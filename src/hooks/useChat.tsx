import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Ingredient {
  name: string;
  qty: string;
  unit: string;
  fromUser?: boolean;
}

interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  prepTime: number;
  servings: number;
  difficulty: "facil" | "medio" | "dificil";
  tags: string[];
  shortReason?: string;
  ingredients?: Ingredient[];
  steps?: string[];
  calories?: number;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recipes?: Recipe[];
  needsConfirmation?: string[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useChat() {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente de cozinha. Me conta o que você tem na geladeira ou o que está com vontade de comer, e eu sugiro receitas deliciosas!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);

  // Load existing thread on mount
  useEffect(() => {
    if (user) {
      loadLatestThread();
    }
  }, [user]);

  const loadLatestThread = async () => {
    if (!user) return;

    try {
      // Get the latest thread
      const { data: threads } = await supabase
        .from('chat_threads')
        .select('id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (threads && threads.length > 0) {
        const latestThreadId = threads[0].id;
        setThreadId(latestThreadId);

        // Load messages from this thread
        const { data: dbMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('thread_id', latestThreadId)
          .order('created_at', { ascending: true });

        if (dbMessages && dbMessages.length > 0) {
          const loadedMessages: Message[] = [
            {
              id: "welcome",
              role: "assistant",
              content: "Olá! 👋 Sou seu assistente de cozinha. Me conta o que você tem na geladeira ou o que está com vontade de comer, e eu sugiro receitas deliciosas!",
            },
            ...dbMessages.map(m => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              recipes: m.recipes_data as unknown as Recipe[] | undefined,
            })),
          ];
          setMessages(loadedMessages);
        }
      }
    } catch (error) {
      console.error('Error loading thread:', error);
    }
  };

  const createNewThread = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_threads')
        .insert([{ user_id: user.id }])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating thread:', error);
      return null;
    }
  };

  const saveMessage = async (currentThreadId: string, role: 'user' | 'assistant', content: string, recipes?: Recipe[]) => {
    try {
      await supabase.from('chat_messages').insert([{
        thread_id: currentThreadId,
        role,
        content,
        recipes_data: (recipes || null) as any,
      }]);

      // Update thread timestamp
      await supabase
        .from('chat_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentThreadId);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const parseAIResponse = (text: string): { message: string; recipes?: Recipe[]; needsConfirmation?: string[] } => {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.message) {
          return {
            message: parsed.message,
            recipes: parsed.recipes?.map((r: any) => ({
              ...r,
              difficulty: r.difficulty || "facil",
              prepTime: r.prepTime || 30,
              servings: r.servings || 4,
            })),
            needsConfirmation: parsed.needsConfirmation,
          };
        }
      }
    } catch (e) {
      console.log("Not a JSON response, treating as plain text");
    }
    
    return { message: text };
  };

  const saveRecipeToDb = async (recipe: Recipe): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          user_id: user?.id || null,
          title: recipe.title,
          description: recipe.description || '',
          prep_time_minutes: recipe.prepTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          tags: recipe.tags || [],
          ingredients: (recipe.ingredients || []) as any,
          steps: recipe.steps || [],
        }])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error saving recipe:', error);
      return null;
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Ensure we have a thread
    let currentThreadId = threadId;
    if (!currentThreadId && user) {
      currentThreadId = await createNewThread();
      if (currentThreadId) {
        setThreadId(currentThreadId);
      }
    }

    // Save user message
    if (currentThreadId) {
      await saveMessage(currentThreadId, 'user', text);
    }

    let assistantContent = "";
    let finalRecipes: Recipe[] | undefined;

    const updateAssistantMessage = (content: string) => {
      const parsed = parseAIResponse(content);
      finalRecipes = parsed.recipes;
      
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === "assistant" && lastMsg.id !== "welcome") {
          return prev.map((m, i) =>
            i === prev.length - 1
              ? { ...m, content: parsed.message, recipes: parsed.recipes, needsConfirmation: parsed.needsConfirmation }
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
            needsConfirmation: parsed.needsConfirmation,
          },
        ];
      });
    };

    try {
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

      // Save recipes to database and update their IDs
      if (finalRecipes && finalRecipes.length > 0) {
        const recipesWithDbIds = await Promise.all(
          finalRecipes.map(async (recipe) => {
            const dbId = await saveRecipeToDb(recipe);
            return { ...recipe, id: dbId || recipe.id };
          })
        );
        
        // Update messages with database IDs
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, recipes: recipesWithDbIds }
                : m
            );
          }
          return prev;
        });

        finalRecipes = recipesWithDbIds;
      }

      // Save assistant message
      if (currentThreadId) {
        const parsed = parseAIResponse(assistantContent);
        await saveMessage(currentThreadId, 'assistant', parsed.message, finalRecipes);
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
  }, [messages, profile, threadId, user]);

  const startNewConversation = useCallback(async () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Olá! 👋 Sou seu assistente de cozinha. Me conta o que você tem na geladeira ou o que está com vontade de comer, e eu sugiro receitas deliciosas!",
      },
    ]);
    
    if (user) {
      const newThreadId = await createNewThread();
      if (newThreadId) {
        setThreadId(newThreadId);
      }
    }
  }, [user]);

  return {
    messages,
    isLoading,
    sendMessage,
    startNewConversation,
  };
}
