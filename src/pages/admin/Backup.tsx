import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Database, FileJson, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BackupOption {
  id: string;
  label: string;
  table: string;
  description: string;
}

const backupOptions: BackupOption[] = [
  { id: 'profiles', label: 'Perfis de Usuários', table: 'profiles', description: 'Dados de todos os usuários' },
  { id: 'recipes', label: 'Receitas', table: 'recipes', description: 'Todas as receitas geradas' },
  { id: 'saved_recipes', label: 'Receitas Salvas', table: 'saved_recipes', description: 'Relação de receitas salvas' },
  { id: 'chat_threads', label: 'Conversas do Chat', table: 'chat_threads', description: 'Threads de conversas' },
  { id: 'chat_messages', label: 'Mensagens do Chat', table: 'chat_messages', description: 'Todas as mensagens' },
  { id: 'recipe_folders', label: 'Pastas de Receitas', table: 'recipe_folders', description: 'Organização de receitas' },
  { id: 'user_roles', label: 'Permissões', table: 'user_roles', description: 'Roles de usuários' },
];

export default function AdminBackup() {
  const [selectedTables, setSelectedTables] = useState<string[]>(['profiles', 'recipes']);
  const [exporting, setExporting] = useState(false);

  const toggleTable = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(t => t !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAll = () => {
    setSelectedTables(backupOptions.map(o => o.id));
  };

  const selectNone = () => {
    setSelectedTables([]);
  };

  const exportData = async () => {
    if (selectedTables.length === 0) {
      toast.error('Selecione pelo menos uma tabela');
      return;
    }

    setExporting(true);
    try {
      const backup: Record<string, unknown[]> = {
        exported_at: [{ timestamp: new Date().toISOString() }],
        version: [{ version: '1.0' }],
      };

      // Fetch data from each selected table
      for (const tableId of selectedTables) {
        const option = backupOptions.find(o => o.id === tableId);
        if (!option) continue;

        try {
          const { data, error } = await supabase
            .from(option.table as 'profiles' | 'recipes' | 'saved_recipes' | 'chat_threads' | 'chat_messages' | 'recipe_folders' | 'user_roles')
            .select('*');

          if (error) {
            console.error(`Error fetching ${option.table}:`, error);
            toast.error(`Erro ao exportar ${option.label}`);
            continue;
          }

          backup[option.table] = data || [];
        } catch (err) {
          console.error(`Error fetching ${option.table}:`, err);
        }
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-cozinhai-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Backup exportado com sucesso!');
    } catch (err) {
      console.error('Error exporting backup:', err);
      toast.error('Erro ao exportar backup');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backup de Dados</h1>
      </div>

      {/* Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Informação Importante</p>
            <p className="text-sm text-amber-700">
              O backup é exportado em formato JSON. Arquivos muito grandes podem demorar para serem gerados.
              Recomendamos fazer backups regulares dos dados importantes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Table selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Selecionar Tabelas
              </CardTitle>
              <CardDescription>
                Escolha quais dados você deseja exportar
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Selecionar Tudo
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {backupOptions.map((option) => (
              <div 
                key={option.id}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTables.includes(option.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleTable(option.id)}
              >
                <Checkbox
                  id={option.id}
                  checked={selectedTables.includes(option.id)}
                  onCheckedChange={() => toggleTable(option.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={option.id} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <FileJson className="h-16 w-16 text-primary/30" />
            <div className="text-center">
              <h3 className="font-semibold">Exportar Backup</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTables.length} tabela(s) selecionada(s)
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={exportData} 
              disabled={exporting || selectedTables.length === 0}
              className="w-full max-w-xs"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exportando...' : 'Baixar Backup JSON'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
