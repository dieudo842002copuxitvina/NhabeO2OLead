"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sprout,
  Cpu,
  Users,
  Handshake,
  SlidersHorizontal,
  Target,
  BookOpen,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─────────────────────────────────────────────
 * Sidebar Navigation Items
 * ───────────────────────────────────────────── */

const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Quản lý CMS",
    href: "/admin/cms",
    icon: FileText,
    exact: false,
  },
  {
    title: "Danh mục bài viết",
    href: "/admin/categories",
    icon: Layers,
    exact: false,
  },
  {
    title: "Sản phẩm",
    href: "/admin/products",
    icon: Package,
    exact: false,
  },
  {
    title: "Lead Command Center",
    href: "/admin/leads",
    icon: Target,
    exact: false,
  },
  {
    title: "Bản đồ Đại lý",
    href: "/admin/dealers",
    icon: MapPin,
    exact: false,
  },
  {
    title: "Wiki & Tri thức",
    href: "/admin/wiki",
    icon: BookOpen,
    exact: false,
  },
  {
    title: "B2B Partner Hub",
    href: "/admin/partners",
    icon: Handshake,
    exact: false,
  },
  {
    title: "Cấu hình thuật toán",
    href: "/admin/algorithm",
    icon: SlidersHorizontal,
    exact: true,
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
    exact: true,
  },
];

/* ─────────────────────────────────────────────
 * Dark Sidebar Component
 * ───────────────────────────────────────────── */

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        // Dark theme
        "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800",
        "border-slate-700/50"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b px-4",
        collapsed ? "h-16 justify-center" : "h-16 justify-start gap-3",
        "border-slate-700/50"
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
          <Sprout className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-black tracking-tight text-white">AGRI-OS</span>
            <p className="text-[9px] font-medium uppercase tracking-widest text-emerald-400/70">
              Admin Console
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;

            const navLink = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
                {active && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <TooltipProvider key={item.href} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium bg-slate-800 border-slate-700">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return navLink;
          })}
        </nav>
      </ScrollArea>

      {/* AI Status Card */}
      {!collapsed && (
        <div className="mx-3 mb-2">
          <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/40 to-teal-900/20 p-3">
            <div className="mb-1 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-400">AI Engine Active</span>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">
              Geo-matching đang vận hành. 24 leads được phân phối tự động hôm nay.
            </p>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className={cn(
        "border-t px-3 py-3",
        collapsed ? "border-slate-700/50" : "border-slate-700/50"
      )}>
        <div className={cn(
          "flex items-center rounded-xl bg-white/5 p-3",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800">
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold text-white">Admin Nhà Bè</p>
              <p className="truncate text-[10px] text-slate-500">admin@nhabeagri.vn</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-700/50 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full text-slate-400 hover:text-white hover:bg-white/5",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Thu gọn</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────
 * Header Component
 * ───────────────────────────────────────────── */

interface AdminHeaderProps {
  sidebarCollapsed: boolean;
}

function AdminHeader({ sidebarCollapsed }: AdminHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-white/95 px-6 backdrop-blur-xl transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-64",
        "border-slate-200"
      )}
    >
      {/* Left: Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Admin Console</h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="outline" size="sm" className="text-xs">
            Xem Website
          </Button>
        </Link>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/20">
          NB
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────
 * Admin Layout Component
 * ───────────────────────────────────────────── */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dark Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Header */}
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          sidebarCollapsed ? "pl-16" : "pl-64"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
