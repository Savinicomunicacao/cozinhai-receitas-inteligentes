import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Shield, UserPlus, Trash2, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    email: string | null;
    name: string | null;
  };
}

export default function AdminPermissions() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      // Fetch profiles for each admin
      const adminsWithProfiles = await Promise.all(
        (rolesData || []).map(async (role) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, name')
            .eq('id', role.user_id)
            .maybeSingle();

          return {
            ...role,
            profile: profile || { email: null, name: null }
          };
        })
      );

      setAdmins(adminsWithProfiles);
    } catch (err) {
      console.error('Error fetching admins:', err);
      toast.error('Erro ao carregar administradores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error('Digite o email do usuário');
      return;
    }

    setAdding(true);
    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newAdminEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        toast.error('Usuário não encontrado');
        return;
      }

      // Check if already admin
      const existingAdmin = admins.find(a => a.user_id === profile.id);
      if (existingAdmin) {
        toast.error('Este usuário já é admin');
        return;
      }

      // Add admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: profile.id, role: 'admin' });

      if (insertError) throw insertError;

      toast.success('Admin adicionado com sucesso!');
      setNewAdminEmail('');
      fetchAdmins();
    } catch (err) {
      console.error('Error adding admin:', err);
      toast.error('Erro ao adicionar admin');
    } finally {
      setAdding(false);
    }
  };

  const removeAdmin = async (roleId: string, userEmail: string | null) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success(`Admin ${userEmail || 'usuário'} removido`);
      fetchAdmins();
    } catch (err) {
      console.error('Error removing admin:', err);
      toast.error('Erro ao remover admin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciar Permissões</h1>
        <Button variant="outline" onClick={fetchAdmins} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Add new admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Administrador
          </CardTitle>
          <CardDescription>
            Digite o email de um usuário cadastrado para torná-lo administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="email@exemplo.com"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addAdmin()}
            />
            <Button onClick={addAdmin} disabled={adding}>
              {adding ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current admins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administradores Atuais
          </CardTitle>
          <CardDescription>
            {admins.length} administrador(es) com acesso total ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Adicionado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="animate-pulse text-muted-foreground">Carregando...</div>
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="text-muted-foreground">Nenhum administrador encontrado</div>
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{admin.profile?.name || 'Sem nome'}</div>
                          <div className="text-sm text-muted-foreground">{admin.profile?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(admin.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover administrador?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover {admin.profile?.email || 'este usuário'} como administrador?
                              Esta ação pode ser revertida adicionando novamente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeAdmin(admin.id, admin.profile?.email)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
