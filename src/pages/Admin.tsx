import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Shield, 
  Bell, 
  FileText, 
  Download, 
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Admin sub-pages
import AdminUsers from './admin/Users';
import AdminPermissions from './admin/Permissions';
import AdminAnnouncements from './admin/Announcements';
import AdminLogs from './admin/Logs';
import AdminBackup from './admin/Backup';

type AdminSection = 'users' | 'permissions' | 'announcements' | 'logs' | 'backup';

const menuItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'permissions', label: 'Permissões', icon: Shield },
  { id: 'announcements', label: 'Avisos Globais', icon: Bell },
  { id: 'logs', label: 'Logs do Sistema', icon: FileText },
  { id: 'backup', label: 'Backup', icon: Download },
];

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [activeSection, setActiveSection] = useState<AdminSection>('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/app/chat');
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Verificando permissões...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <AdminUsers />;
      case 'permissions':
        return <AdminPermissions />;
      case 'announcements':
        return <AdminAnnouncements />;
      case 'logs':
        return <AdminLogs />;
      case 'backup':
        return <AdminBackup />;
      default:
        return <AdminUsers />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-0 -translate-x-full md:w-16 md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">Admin</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                activeSection === item.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Back button */}
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => navigate('/app/profile')}
          >
            <ArrowLeft className="h-4 w-4" />
            {sidebarOpen && <span>Voltar ao App</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-background border-b p-4 flex items-center gap-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">
            {menuItems.find(item => item.id === activeSection)?.label}
          </h1>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
