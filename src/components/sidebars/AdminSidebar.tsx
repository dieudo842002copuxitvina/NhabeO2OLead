import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, Hammer, Sparkles, Activity, Settings,
  Inbox, MapPin, Coins, UserPlus, Layers, Calculator, Webhook, UserCog,
  ScrollText, Sprout, BookOpen, Camera, SlidersHorizontal, Network,
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';

interface NavItem { title: string; url: string; icon: typeof LayoutDashboard }
interface NavGroup { label: string; items: NavItem[] }

const GROUPS: NavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
      { title: 'Command Center', url: '/admin/control', icon: SlidersHorizontal },
      { title: 'BI Marketing', url: '/admin/marketing-bi', icon: Activity },
      { title: 'Looker Studio', url: '/admin/marketing-bi/looker', icon: Activity },
      { title: 'Heatmap', url: '/admin/heatmap', icon: MapPin },
      { title: 'Hệ thần kinh số', url: '/admin/nervous-system', icon: Network },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { title: 'Leads', url: '/admin/leads', icon: Inbox },
      { title: 'Leads Máy tính', url: '/admin/leads/calculator', icon: Calculator },
      { title: 'Đại lý', url: '/admin/dealers', icon: Users },
      { title: 'Duyệt đại lý', url: '/admin/approvals', icon: UserPlus },
      { title: 'Thợ thi công', url: '/admin/installers', icon: Hammer },
      { title: 'Hoa hồng', url: '/admin/commission', icon: Coins },
    ],
  },
  {
    label: 'Sản phẩm & Nội dung',
    items: [
      { title: 'Sản phẩm', url: '/admin/products', icon: Package },
      { title: 'Bài viết (CMS)', url: '/admin/cms', icon: BookOpen },
      { title: 'Case Study', url: '/admin/case-studies', icon: Camera },
      { title: 'Quản lý Trang chủ', url: '/admin/homepage', icon: Layers },
      { title: 'AI Rules', url: '/admin/ai-rules', icon: Sparkles },
      { title: 'Tham số máy tính', url: '/admin/settings/calculator', icon: Calculator },
    ],
  },
  {
    label: 'Cấu hình Hệ thống',
    items: [
      { title: 'Nhân sự (RBAC)', url: '/admin/staff', icon: UserCog },
      { title: 'Cổng kết nối', url: '/admin/integrations', icon: Webhook },
      { title: 'Tracking Logs', url: '/admin/tracking-logs', icon: ScrollText },
      { title: 'Cấu hình chung', url: '/admin/config', icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-sidebar-primary/20 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <div className="leading-none">
              <p className="text-sm font-bold text-sidebar-foreground">AgriFlow</p>
              <p className="text-[10px] text-sidebar-foreground/60">Admin Console</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
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
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
