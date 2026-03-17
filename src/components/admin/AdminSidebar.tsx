import {
  Home, Image, FileText, Shield, Package, Newspaper,
  LayoutDashboard, ChevronLeft, Settings, Mail
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import optiStratIcon from '@/assets/optistrat-logo-icon.png';
import { Separator } from '@/components/ui/separator';

const contentItems = [
  { title: 'Carrossel', url: '/admin/carousel', icon: Image },
  { title: 'Conteúdo do Site', url: '/admin/content', icon: FileText },
  { title: 'Notícias / Blog', url: '/admin/news', icon: Newspaper },
  { title: 'Produtos', url: '/admin/products', icon: Package },
];

const systemItems = [
  { title: 'Contatos', url: '/admin/contacts', icon: Mail },
  { title: 'Segurança', url: '/admin/security', icon: Shield },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`;

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <img src={optiStratIcon} alt="OptiStrat" className="h-8 w-8 flex-shrink-0" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">OptiStrat</span>
            <span className="text-[10px] text-muted-foreground leading-tight">Painel Admin</span>
          </div>
        )}
      </div>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin" end className={getNavClass}>
                    <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>Painel Geral</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3">
            Conteúdo
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup defaultOpen>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-3">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
