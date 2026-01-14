import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Clock, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Thread {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  preview?: string;
}

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadThreads();
    }
  }, [user]);

  const loadThreads = async () => {
    if (!user) return;

    try {
      // Get all threads
      const { data: threadsData, error: threadsError } = await supabase
        .from("chat_threads")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (threadsError) throw threadsError;

      // Get first message of each thread for preview
      const threadsWithPreviews = await Promise.all(
        (threadsData || []).map(async (thread) => {
          const { data: messages } = await supabase
            .from("chat_messages")
            .select("content, role")
            .eq("thread_id", thread.id)
            .eq("role", "user")
            .order("created_at", { ascending: true })
            .limit(1);

          return {
            ...thread,
            preview: messages?.[0]?.content || "Nova conversa",
          };
        })
      );

      setThreads(threadsWithPreviews);
    } catch (error) {
      console.error("Error loading threads:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Delete messages first
      await supabase
        .from("chat_messages")
        .delete()
        .eq("thread_id", threadId);

      // Then delete thread
      await supabase
        .from("chat_threads")
        .delete()
        .eq("id", threadId);

      setThreads((prev) => prev.filter((t) => t.id !== threadId));
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const startNewChat = () => {
    navigate("/app/chat");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background pb-24">
      {/* Header */}
      <header className="bg-secondary px-4 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-semibold text-xl">Histórico</h1>
            <p className="text-sm text-muted-foreground">
              Suas conversas anteriores
            </p>
          </div>
          <Button onClick={startNewChat} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nova conversa
          </Button>
        </div>
      </header>

      <main className="px-4 py-4">
        {threads.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">Nenhuma conversa ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comece uma nova conversa para receber sugestões de receitas
            </p>
            <Button onClick={startNewChat}>Iniciar conversa</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => navigate(`/app/chat?thread=${thread.id}`)}
                className="w-full bg-card border border-border rounded-2xl p-4 text-left hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {thread.preview?.startsWith("[IMAGEM:") 
                        ? "📷 Foto enviada" 
                        : thread.preview?.substring(0, 50) || "Nova conversa"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(thread.updated_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => deleteThread(thread.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
