import { useEffect } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { LogOut, PanelLeft, ExternalLink } from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">Carregando painel...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-8 w-8" />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Painel Administrativo
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                target="_blank"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                Ver site <ExternalLink className="h-3 w-3" />
              </Link>
              <span className="text-xs text-muted-foreground hidden md:inline">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
