import { Home, Image, FileText, Shield, Package, Newspaper } from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import optiStratIcon from '@/assets/optistrat-logo-icon.png';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: Home },
  { title: 'Carrossel', url: '/admin/carousel', icon: Image },
  { title: 'Conteúdo', url: '/admin/content', icon: FileText },
  { title: 'Produtos', url: '/admin/products', icon: Package },
  { title: 'Notícias', url: '/admin/news', icon: Newspaper },
  { title: 'Segurança', url: '/admin/security', icon: Shield },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'bg-primary text-primary-foreground font-medium'
      : 'hover:bg-muted/50';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <div className="p-4 border-b flex items-center gap-2">
        <img src={optiStratIcon} alt="OptiStrat" className="h-8 w-8" />
        {!collapsed && (
          <span className="font-semibold text-lg">Admin Panel</span>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestão do Site</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="h-4 w-4" />
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
