import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bell, Send, Construction } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendAnnouncement = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Preencha título e mensagem');
      return;
    }

    setSending(true);
    try {
      // TODO: Implement announcements table and push notification system
      // For now, just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Aviso enviado com sucesso!');
      setTitle('');
      setMessage('');
    } catch (err) {
      console.error('Error sending announcement:', err);
      toast.error('Erro ao enviar aviso');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Avisos Globais</h1>
      </div>

      {/* Info card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex items-start gap-3">
          <Construction className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Funcionalidade em desenvolvimento</p>
            <p className="text-sm text-amber-700">
              O sistema de avisos globais será implementado com notificações push.
              Por enquanto, você pode testar o formulário.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create announcement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Criar Novo Aviso
          </CardTitle>
          <CardDescription>
            Envie uma mensagem para todos os usuários do aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Aviso</Label>
            <Input
              id="title"
              placeholder="Ex: Novidade no app!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite a mensagem que será exibida para todos os usuários..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={sendAnnouncement} disabled={sending} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Enviando...' : 'Enviar Aviso'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent announcements placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Avisos Recentes</CardTitle>
          <CardDescription>
            Histórico de avisos enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum aviso enviado ainda</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
