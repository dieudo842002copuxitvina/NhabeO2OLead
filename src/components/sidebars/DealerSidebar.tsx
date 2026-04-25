import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, Package, Hammer, Truck, Sprout, Briefcase } from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Cổng Đối Tác', url: '/partner/dashboard', icon: Briefcase },
  { title: 'Bảng điều khiển', url: '/dealer', icon: LayoutDashboard },
  { title: 'Lead khách hàng', url: '/dealer/leads', icon: Inbox },
  { title: 'Tồn kho', url: '/dealer/inventory', icon: Package },
  { title: 'Đơn hàng', url: '/dealer/orders', icon: Truck },
  { title: 'Sản phẩm', url: '/dealer/products', icon: Package },
  { title: 'Thợ khu vực', url: '/admin/installers', icon: Hammer },
];

export default function DealerSidebar() {
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
              <p className="text-[10px] text-sidebar-foreground/60">Đại lý</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Đại lý</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
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
