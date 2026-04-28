"use client";

import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/data/types';
import {
  Sprout, BarChart3, Users, Truck, Package, MapPin, ClipboardList, Menu, X,
  TrendingUp, Lightbulb, Phone, Inbox, Coins, UserPlus, Calculator, Hammer,
  Sparkles, Activity, Briefcase, BookOpen, Award, ChevronDown, LogIn, Info,
  Wrench, Layers, Network,
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

const ECOSYSTEM: NavGroup = {
  label: 'Hệ sinh thái',
  icon: <Layers className="w-4 h-4" />,
  items: [
    { label: 'Giải pháp', path: '/giai-phap', icon: <Lightbulb className="w-4 h-4" />, desc: 'Trọn gói theo cây trồng & địa hình' },
    { label: 'Công cụ', path: '/cong-cu', icon: <Calculator className="w-4 h-4" />, desc: 'Tính nhanh công suất bơm và hệ tưới' },
    { label: 'Blog Nông nghiệp', path: '/blog', icon: <BookOpen className="w-4 h-4" />, desc: 'Toàn bộ bài viết, hướng dẫn & thị trường' },
  ],
};

const NETWORK: NavGroup = {
  label: 'Mạng lưới',
  icon: <Network className="w-4 h-4" />,
  items: [
    { label: 'Danh sách đại lý', path: '/dai-ly', icon: <MapPin className="w-4 h-4" />, desc: 'Tìm đại lý gần bạn nhất' },
    { label: 'Bằng chứng thành công', path: '/case-studies', icon: <Award className="w-4 h-4" />, desc: 'Case study thi công thực tế' },
    { label: 'Giá nông sản', path: '/gia-nong-san', icon: <TrendingUp className="w-4 h-4" />, desc: 'Giá cập nhật theo vùng' },
  ],
};

const STANDALONE: NavItem[] = [
  { label: 'Về chúng tôi', path: '/gioi-thieu', icon: <Info className="w-4 h-4" /> },
  { label: 'Liên hệ', path: '/lien-he', icon: <Phone className="w-4 h-4" /> },
];

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

  // Sửa lỗi location.pathname thành pathname
  const isActiveGroup = (g: NavGroup) => g.items.some((i) => pathname?.startsWith(i.path));

  return (
    <>
      <div data-app-header="true" className="sticky top-0 z-50" style={{ paddingTop: 'var(--safe-top, 0px)' }}>
        <TickerTape />
        <header className="backdrop-blur-xl bg-background/70 border-b border-border/60 shadow-sm">
          <div className="container flex items-center justify-between h-16 gap-4">
            {/* Logo — prominent but compact */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Sprout className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="leading-tight">
                <span className="font-display font-bold text-base block">AgriFlow</span>
                <span className="text-[10px] text-muted-foreground tracking-wide uppercase">Nhà Bè Agri</span>
              </div>
            </Link>

            {/* Desktop nav — grouped dropdowns for customers */}
            {isCustomer ? (
              <div className="hidden lg:flex items-center gap-2">
                <ProductMegaMenu />
                <NavigationMenu>
                  <NavigationMenuList className="gap-1">
                    {[ECOSYSTEM, NETWORK].map((group) => (
                      <NavigationMenuItem key={group.label}>
                        <NavigationMenuTrigger
                          className={cn(
                            'h-9 px-3 text-sm font-medium bg-transparent',
                            isActiveGroup(group) && 'text-primary',
                          )}
                        >
                          <span className="flex items-center gap-1.5">{group.icon}{group.label}</span>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[420px] gap-1 p-3 sm:grid-cols-2">
                            {group.items.map((item) => (
                              <li key={item.path}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={item.path}
                                    className={cn(
                                      'flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted',
                                      pathname === item.path && 'bg-primary/5',
                                    )}
                                  >
                                    <span className="mt-0.5 text-primary">{item.icon}</span>
                                    <span className="flex-1 min-w-0">
                                      <span className="block text-sm font-semibold">{item.label}</span>
                                      {item.desc && (
                                        <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.desc}</span>
                                      )}
                                    </span>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    ))}

                    {STANDALONE.map((item) => (
                      <NavigationMenuItem key={item.path}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.path}
                            className={cn(
                              navigationMenuTriggerStyle(),
                              'h-9 px-3 text-sm font-medium bg-transparent',
                              pathname === item.path && 'text-primary',
                            )}
                          >
                            {item.label}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            ) : (
              // Role-specific nav (dealer/admin/fieldsales) — keep simple flat list
              <nav className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto">
                {config.nav.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                      pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Right cluster */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Admin-only BI Dashboard quick link */}
              {isAdmin && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex text-muted-foreground hover:text-primary hover:bg-primary/5"
                  title="Báo cáo thông minh (BI Dashboard)"
                >
                  <Link href="/admin/marketing-bi">
                    <Activity className="w-4 h-4 mr-1.5" />
                    BI
                  </Link>
                </Button>
              )}

              {/* Dealer login — distinct outline CTA */}
              {isCustomer && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Link href="/auth?role=dealer">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Đại lý đăng nhập
                  </Link>
                </Button>
              )}

              {/* Role switcher — kept for internal QA */}
              <div className="hidden xl:flex items-center gap-1">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium transition-all',
                      role === r
                        ? `${roleConfig[r].color} text-primary-foreground`
                        : 'bg-muted text-muted-foreground hover:bg-muted/80',
                    )}
                  >
                    {roleConfig[r].label}
                  </button>
                ))}
              </div>

              {/* Mobile hamburger — 48px tap target */}
              <button
                className="lg:hidden h-12 w-12 flex items-center justify-center hover:bg-muted rounded-lg active:scale-95 transition-transform"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile full-screen slide-out menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden animate-fade-in">
          <div
            className="absolute inset-0 bg-background"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute inset-0 bg-background flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-5 border-b shrink-0">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="leading-tight">
                  <span className="font-display font-bold text-base block">AgriFlow</span>
                  <span className="text-[10px] text-muted-foreground tracking-wide uppercase">Nhà Bè Agri</span>
                </div>
              </Link>
              <button
                className="h-12 w-12 flex items-center justify-center rounded-lg hover:bg-muted"
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-7">
              {isCustomer ? (
                <>
                  <ProductMegaMenu isMobile={true} onMobileClose={() => setMobileOpen(false)} />
                  {[ECOSYSTEM, NETWORK].map((group) => (
                    <section key={group.label}>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3 flex items-center gap-1.5">
                        {group.icon}{group.label}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {group.items.map((item) => {
                          const active = pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                'flex flex-col items-start gap-2 rounded-xl border p-4 min-h-[96px] transition-colors',
                                active
                                  ? 'bg-primary/10 border-primary/40 text-primary'
                                  : 'bg-card border-border hover:bg-muted',
                              )}
                            >
                              <span
                                className={cn(
                                  'w-10 h-10 rounded-lg flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5',
                                  active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
                                )}
                              >
                                {item.icon}
                              </span>
                              <span className="text-sm font-semibold leading-tight">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  ))}

                  <section>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Khác</p>
                    <nav className="space-y-1">
                      {STANDALONE.map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 min-h-[48px] rounded-lg text-base font-medium hover:bg-muted [&_svg]:w-5 [&_svg]:h-5"
                        >
                          {item.icon}{item.label}
                        </Link>
                      ))}
                    </nav>
                  </section>
                </>
              ) : (
                <nav className="space-y-1.5">
                  {config.nav.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 min-h-[52px] rounded-lg text-base font-medium transition-colors [&_svg]:w-5 [&_svg]:h-5',
                        pathname === item.path
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      {item.icon}{item.label}
                    </Link>
                  ))}
                </nav>
              )}

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">Chuyển vai trò (QA)</p>
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRole(r); setMobileOpen(false); }}
                      className={cn(
                        'text-sm px-4 min-h-[40px] rounded-full font-medium transition-all',
                        role === r
                          ? `${roleConfig[r].color} text-primary-foreground`
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {roleConfig[r].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky bottom CTAs */}
            {isCustomer && (
              <div className="border-t bg-background p-4 space-y-2 shrink-0">
                <Button
                  asChild
                  size="lg"
                  className="w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  <a href="tel:1900000000">
                    <Phone className="w-5 h-5 mr-2" /> Gọi tư vấn miễn phí
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full border-primary/40 text-primary"
                >
                  <Link href="/auth?role=dealer" onClick={() => setMobileOpen(false)}>
                    <LogIn className="w-5 h-5 mr-2" /> Đại lý đăng nhập
                  </Link>
                </Button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
