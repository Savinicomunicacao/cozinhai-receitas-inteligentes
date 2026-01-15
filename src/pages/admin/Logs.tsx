import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, RefreshCw, Users, MessageSquare, Bookmark, ChefHat } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SystemStats {
  totalUsers: number;
  proUsers: number;
  totalRecipes: number;
  totalSavedRecipes: number;
  totalChatThreads: number;
  totalChatMessages: number;
  recentSignups: number;
}

export default function AdminLogs() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all stats in parallel
      const [
        usersResult,
        recipesResult,
        savedRecipesResult,
        threadsResult,
        messagesResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id, is_pro, created_at'),
        supabase.from('recipes').select('id', { count: 'exact', head: true }),
        supabase.from('saved_recipes').select('id', { count: 'exact', head: true }),
        supabase.from('chat_threads').select('id', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
      ]);

      const users = usersResult.data || [];
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      setStats({
        totalUsers: users.length,
        proUsers: users.filter(u => u.is_pro).length,
        totalRecipes: recipesResult.count || 0,
        totalSavedRecipes: savedRecipesResult.count || 0,
        totalChatThreads: threadsResult.count || 0,
        totalChatMessages: messagesResult.count || 0,
        recentSignups: users.filter(u => new Date(u.created_at) > oneWeekAgo).length,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = stats ? [
    { 
      label: 'Total de Usuários', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Usuários Pro', 
      value: stats.proUsers, 
      icon: Users, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-100'
    },
    { 
      label: 'Cadastros (7 dias)', 
      value: stats.recentSignups, 
      icon: Users, 
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Receitas Geradas', 
      value: stats.totalRecipes, 
      icon: ChefHat, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    },
    { 
      label: 'Receitas Salvas', 
      value: stats.totalSavedRecipes, 
      icon: Bookmark, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    { 
      label: 'Conversas no Chat', 
      value: stats.totalChatThreads, 
      icon: MessageSquare, 
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100'
    },
    { 
      label: 'Mensagens Trocadas', 
      value: stats.totalChatMessages, 
      icon: MessageSquare, 
      color: 'text-pink-500',
      bgColor: 'bg-pink-100'
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Logs do Sistema</h1>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Última atualização: {format(lastUpdated, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={fetchStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Activity log placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log de Atividades
          </CardTitle>
          <CardDescription>
            Ações recentes no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {/* Sample log entries - in future, this would come from a logs table */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Badge variant="secondary" className="bg-green-100 text-green-800">INFO</Badge>
                <span className="text-sm">Sistema de admin ativado</span>
                <span className="text-xs text-muted-foreground ml-auto">Agora</span>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Logs detalhados serão implementados em breve</p>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
