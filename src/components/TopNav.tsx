"use client";

import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/data/types';
import {
  Sprout, BarChart3, Users, Truck, Package, MapPin, ClipboardList, Menu, X,
  TrendingUp, Lightbulb, Phone, Inbox, Coins, UserPlus, Calculator, Hammer,
  Sparkles, Activity, Briefcase, BookOpen, Award, ChevronDown, LogIn, Info,
  Wrench, Layers, Network, Zap, Home, Newspaper,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useState } from 'react';
import TickerTape from './TickerTape';
import ProductMegaMenu from './ProductMegaMenu';
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList,
  NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem { label: string; path: string; icon: React.ReactNode; desc?: string }
interface NavGroup { label: string; icon: React.ReactNode; items: NavItem[] }

const roleConfig: Record<UserRole, { label: string; color: string; nav: NavItem[] }> = {
  customer: { label: 'Khách hàng', color: 'bg-primary', nav: [] },
  dealer: {
    label: 'Đại lý', color: 'bg-info',
    nav: [
      { label: 'Cổng Đối Tác', path: '/partner/dashboard', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Dashboard', path: '/dealer', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Tồn kho', path: '/dealer/inventory', icon: <Package className="w-4 h-4" /> },
      { label: 'Leads', path: '/dealer/leads', icon: <Inbox className="w-4 h-4" /> },
      { label: 'Đơn hàng', path: '/dealer/orders', icon: <Truck className="w-4 h-4" /> },
      { label: 'Sản phẩm', path: '/dealer/products', icon: <Package className="w-4 h-4" /> },
    ],
  },
  admin: {
    label: 'Admin', color: 'bg-destructive',
    nav: [
      { label: 'Dashboard', path: '/admin', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Leads', path: '/admin/leads', icon: <Inbox className="w-4 h-4" /> },
      { label: 'Heatmap', path: '/admin/heatmap', icon: <MapPin className="w-4 h-4" /> },
      { label: 'Hoa hồng', path: '/admin/commission', icon: <Coins className="w-4 h-4" /> },
      { label: 'Duyệt ĐL', path: '/admin/approvals', icon: <UserPlus className="w-4 h-4" /> },
      { label: 'Duyệt Thợ', path: '/admin/installers', icon: <Hammer className="w-4 h-4" /> },
      { label: 'AI Rules', path: '/admin/ai-rules', icon: <Sparkles className="w-4 h-4" /> },
      { label: 'BI Marketing', path: '/admin/marketing-bi', icon: <Activity className="w-4 h-4" /> },
      { label: 'Đại lý', path: '/admin/dealers', icon: <Users className="w-4 h-4" /> },
      { label: 'Sản phẩm', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
      { label: 'Cấu hình', path: '/admin/config', icon: <Wrench className="w-4 h-4" /> },
    ],
  },
  fieldsales: {
    label: 'Thị trường', color: 'bg-warning',
    nav: [
      { label: 'Dashboard', path: '/fieldsales', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Tạo đơn', path: '/fieldsales/quick-order', icon: <ClipboardList className="w-4 h-4" /> },
      { label: 'Khách hàng', path: '/fieldsales/customers', icon: <Users className="w-4 h-4" /> },
    ],
  },
};

const roles: UserRole[] = ['customer', 'dealer', 'admin', 'fieldsales'];

export default function TopNav() {
  const { role, setRole } = useApp();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const config = roleConfig[role];
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isCustomer = role === 'customer';

  const isActivePath = (path: string) => pathname?.startsWith(path);

  return (
    <>
      <div data-app-header="true" className="sticky top-0 z-50" style={{ paddingTop: 'var(--safe-top, 0px)' }}>
        <TickerTape />
        <header className="backdrop-blur-xl bg-white/80 border-b border-border/60 shadow-sm">
          <div className="container flex items-center justify-between h-16 gap-4">
            
            {/* Logo — Nhà Bè Agri */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-display font-bold text-base block text-slate-900">Nhà Bè Agri</span>
              </div>
            </Link>

            {/* Desktop Navigation — Customer Mode */}
            {isCustomer ? (
              <nav className="hidden lg:flex items-center gap-0.5">
                {/* 1. Trang chủ */}
                <Link
                  href="/"
                  className={cn(
                    'flex items-center gap-1.5 h-10 px-3 text-sm font-medium rounded-md transition-colors',
                    pathname === '/'
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50',
                  )}
                >
                  <Home className="w-4 h-4" />
                  Trang chủ
                </Link>

                {/* 2. Giải pháp */}
                <Link
                  href="/giai-phap"
                  className={cn(
                    'flex items-center gap-1.5 h-10 px-3 text-sm font-medium rounded-md transition-colors',
                    isActivePath('/giai-phap')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50',
                  )}
                >
                  <Lightbulb className="w-4 h-4" />
                  Giải pháp
                </Link>

                {/* 3. Giá Nông Sản */}
                <Link
                  href="/prices"
                  className={cn(
                    'flex items-center gap-1.5 h-10 px-3 text-sm font-medium rounded-md transition-colors',
                    isActivePath('/prices') || isActivePath('/gia-nong-san')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50',
                  )}
                >
                  <TrendingUp className="w-4 h-4" />
                  Giá Nông Sản
                </Link>

                {/* 3. Sản phẩm — Mega Menu Dropdown */}
                <div className="relative">
                  <ProductMegaMenu />
                </div>

                {/* 4. Hệ thống Đại lý */}
                <Link
                  href="/dai-ly"
                  className={cn(
                    'flex items-center gap-1.5 h-10 px-3 text-sm font-medium rounded-md transition-colors',
                    isActivePath('/dai-ly')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50',
                  )}
                >
                  <MapPin className="w-4 h-4" />
                  Hệ thống Đại lý
                </Link>

                {/* 5. Kinh nghiệm & Kỹ thuật */}
                <Link
                  href="/blog"
                  className={cn(
                    'flex items-center gap-1.5 h-10 px-3 text-sm font-medium rounded-md transition-colors',
                    isActivePath('/blog') || isActivePath('/kien-thuc')
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50',
                  )}
                >
                  <Newspaper className="w-4 h-4" />
                  Kinh nghiệm & Kỹ thuật
                </Link>
              </nav>
            ) : (
              /* Role-specific nav (dealer/admin/fieldsales) */
              <nav className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto">
                {config.nav.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                      pathname === item.path
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50',
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Đại lý đăng nhập — Outline/Text style (giảm chú ý) */}
              {isCustomer && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors"
                >
                  <Link href="/auth?role=dealer">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Đăng nhập Đại lý
                  </Link>
                </Button>
              )}

              {/* CTA Cốt lõi — Solid Emerald, nổi bật nhất */}
              {isCustomer && (
                <Button
                  asChild
                  size="sm"
                  className="hidden lg:inline-flex bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                >
                  <Link href="/tinh-toan" className="gap-1.5">
                    <span>🔥</span>
                    Tính Toán Vật Tư
                  </Link>
                </Button>
              )}

              {/* Admin-only BI Dashboard */}
              {isAdmin && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex text-slate-600 hover:text-emerald-600"
                  title="Báo cáo thông minh (BI Dashboard)"
                >
                  <Link href="/admin/marketing-bi">
                    <Activity className="w-4 h-4 mr-1.5" />
                    BI
                  </Link>
                </Button>
              )}

              {/* Role switcher — QA only */}
              <div className="hidden">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium transition-all',
                      role === r
                        ? `${roleConfig[r].color} text-white`
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                    )}
                  >
                    {roleConfig[r].label}
                  </button>
                ))}
              </div>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden h-10 w-10 flex items-center justify-center hover:bg-emerald-50 rounded-lg active:scale-95 transition-transform"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-5 border-b shrink-0">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-slate-900">Nhà Bè Agri</span>
              </Link>
              <button
                className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-emerald-50"
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto py-4">
              {isCustomer && (
                <>
                  {/* Navigation Links */}
                  <nav className="px-4 space-y-1">
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        pathname === '/'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'text-slate-700 hover:bg-emerald-50',
                      )}
                    >
                      <Home className="w-5 h-5" />
                      Trang chủ
                    </Link>
                    
                    <Link
                      href="/giai-phap"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        isActivePath('/giai-phap')
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'text-slate-700 hover:bg-emerald-50',
                      )}
                    >
                      <Lightbulb className="w-5 h-5" />
                      Giải pháp
                    </Link>
                    
                    <Link
                      href="/dai-ly"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        isActivePath('/dai-ly')
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'text-slate-700 hover:bg-emerald-50',
                      )}
                    >
                      <MapPin className="w-5 h-5" />
                      Hệ thống Đại lý
                    </Link>
                    
                    <Link
                      href="/prices"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        isActivePath('/prices') || isActivePath('/gia-nong-san')
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'text-slate-700 hover:bg-emerald-50',
                      )}
                    >
                      <TrendingUp className="w-5 h-5" />
                      Giá Nông Sản
                    </Link>
                    
                    <Link
                      href="/blog"
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        isActivePath('/blog')
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'text-slate-700 hover:bg-emerald-50',
                      )}
                    >
                      <Newspaper className="w-5 h-5" />
                      Kinh nghiệm & Kỹ thuật
                    </Link>
                  </nav>

                  {/* Mega Menu Mobile */}
                  <div className="mt-2 px-4">
                    <ProductMegaMenu isMobile={true} onMobileClose={() => setMobileOpen(false)} />
                  </div>

                  {/* Login Link */}
                  <div className="mt-4 px-4">
                    <Link
                      href="/auth?role=dealer"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      <LogIn className="w-5 h-5" />
                      Đăng nhập Đại lý
                    </Link>
                  </div>
                </>
              )}

              {!isCustomer && (
                <nav className="px-4 space-y-1">
                  {config.nav.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                        pathname === item.path
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'text-slate-700 hover:bg-emerald-50',
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}

              {/* Role Switcher */}
              <div className="mt-6 px-4 border-t pt-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Chuyển vai trò (QA)</p>
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setMobileOpen(false); }}
                      className={cn(
                        'text-sm px-3 py-1.5 rounded-full font-medium transition-all',
                        role === r
                          ? `${roleConfig[r].color} text-white`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      )}
                    >
                      {roleConfig[r].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky CTA */}
            {isCustomer && (
              <div className="border-t bg-white p-4 shrink-0">
                <Link href="/tinh-toan" onClick={() => setMobileOpen(false)}>
                  <Button
                    asChild
                    size="lg"
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-lg"
                  >
                    <span className="gap-2">
                      <span>🔥</span>
                      Tính Toán Vật Tư
                    </span>
                  </Button>
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
