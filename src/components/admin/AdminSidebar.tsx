'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Crosshair,
  Package,
  PlusCircle,
  FolderTree,
  MapPin,
  SlidersHorizontal,
  ChevronRight,
  Cpu,
  User,
  Sparkles,
  Blocks,
  PanelTop,
  Target,
  Handshake,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AGRI_GREEN = '#2E7D32';

type NavItem = {
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { href: '/admin', icon: LayoutDashboard, title: 'Dashboard tổng', exact: true },
  { href: '/admin/leads', icon: Crosshair, title: 'Lead Command Center' },
  { href: '/admin/products', icon: Package, title: 'Sản phẩm', exact: true },
  { href: '/admin/products/new', icon: PlusCircle, title: 'Thêm sản phẩm', exact: true },
  { href: '/admin/categories', icon: FolderTree, title: 'Quản lý Danh mục', exact: true },
  { href: '/admin/products', icon: Blocks, title: 'Quản lý PIM', exact: true },
  { href: '/admin/wiki', icon: BookOpen, title: 'Wiki & Tri thức' },
  { href: '/admin/dealers', icon: MapPin, title: 'Bản đồ Đại lý', exact: true },
  { href: '/admin/partners', icon: Handshake, title: 'B2B Partner Hub' },
  { href: '/admin/algorithm', icon: SlidersHorizontal, title: 'Cấu hình thuật toán', exact: true },
  { href: '/admin/o2o-strategy', icon: Target, title: 'Chiến lược O2O', exact: true },
  { href: '/admin/category-schema', icon: Blocks, title: 'Category Schema', exact: true },
  { href: '/admin/schema-builder', icon: Blocks, title: 'Schema Builder', exact: true },
  { href: '/admin/portal-layout', icon: PanelTop, title: 'Bố cục Portal', exact: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-sidebar-border bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
      <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${AGRI_GREEN}, #43A047)` }}
        >
          <Cpu className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-white">AGRI-OS</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
            Admin Console
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Điều hướng
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    active ? 'text-[#2E7D32]' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                  style={active ? { color: AGRI_GREEN } : undefined}
                />
                <span>{item.title}</span>
              </div>
              {active ? (
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: AGRI_GREEN }} />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-3">
        <div className="rounded-xl border border-white/5 bg-gradient-to-br from-emerald-900/40 to-teal-900/20 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">AI Engine Active</span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-500">
            Geo-matching đang vận hành. 24 leads được phân phối tự động hôm nay.
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800">
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-bold text-white">Admin Nhà Bè</p>
            <p className="truncate text-[10px] text-slate-500">admin@nhabeagri.vn</p>
          </div>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-600" />
        </div>
      </div>
    </aside>
  );
}
