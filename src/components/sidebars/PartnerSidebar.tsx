import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Hammer, ToggleRight, History, Sprout } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Bảng điều khiển', url: '/partner/dashboard', icon: LayoutDashboard },
  { title: 'Danh sách công trình', url: '/doi-tho', icon: Hammer },
  { title: 'Trạng thái sẵn sàng', url: '/partner/dashboard', icon: ToggleRight },
  { title: 'Lịch sử thi công', url: '/doi-tho', icon: History },
];

export default function PartnerSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-info/20 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4 text-info" />
          </div>
          {!collapsed && (
            <div className="leading-none">
              <p className="text-sm font-bold text-sidebar-foreground">AgriFlow</p>
              <p className="text-[10px] text-sidebar-foreground/60">Thợ / Đối tác</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Thợ thi công</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end>
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
