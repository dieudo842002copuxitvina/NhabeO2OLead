"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Providers } from "../providers";
import AIRulePopup from "@/components/AIRulePopup";
import GA4RouteTracker from "@/components/GA4RouteTracker";
import SiteFooter from "@/components/SiteFooter";
import { Sprout, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/**
 * Mobile Navigation - Simple links without dropdowns
 */
const MOBILE_NAV_ITEMS = [
  { title: "Trang chủ", href: "/" },
  { title: "Phân Bón & Thiết Bị", href: "/danh-muc" },
  { title: "Giá Nông Sản", href: "/gia-nong-san" },
  { title: "Tính Vật Tư", href: "/tinh-toan" },
  { title: "Điểm Bán", href: "/dai-ly" },
  { title: "Tin Tức", href: "/blog" },
];

/* ─────────────────────────────────────────────
 * Sticky Navbar Component
 * ───────────────────────────────────────────── */

function StickyNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-600/20">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-slate-900">AgriHub</span>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Command Center</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link 
              href="/" 
              className="hover:text-green-600 transition-colors"
            >
              Trang chủ
            </Link>
            
            {/* Link trực tiếp vào trang Tổng kho Danh mục */}
            <Link 
              href="/danh-muc" 
              className="font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              Phân Bón & Thiết Bị
            </Link>
            
            <Link 
              href="/gia-nong-san" 
              className="hover:text-green-600 transition-colors"
            >
              Giá Nông Sản
            </Link>
            <Link 
              href="/tinh-toan" 
              className="hover:text-green-600 transition-colors"
            >
              Tính Vật Tư
            </Link>
            <Link 
              href="#map" 
              className="hover:text-green-600 transition-colors"
            >
              Điểm Bán
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Link href="/admin" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                Admin
              </Button>
            </Link>
            <Link href="/dai-ly">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                Đăng nhập Đại lý
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Full screen drawer with sticky CTA */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-5 border-b shrink-0">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 shadow-md">
                    <Sprout className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-slate-900">AgriHub</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-4">
                {MOBILE_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-5 py-3 text-base font-medium text-slate-700 hover:text-green-600 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    {item.title}
                  </Link>
                ))}
                <div className="pt-4 px-5">
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Trang Admin
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Sticky CTA at bottom */}
              <div className="sticky bottom-0 bg-white border-t p-4 z-50 safe-area-inset-bottom">
                <Link 
                  href="/tinh-toan" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full"
                >
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-lg"
                  >
                    <span>🔥</span>
                    Tính toán vật tư
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────
 * Public Layout
 * ───────────────────────────────────────────── */

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Suspense fallback={null}>
        <GA4RouteTracker />
      </Suspense>
      <AIRulePopup />
      <StickyNavbar />
      <main className="bg-[#FFFFFF] text-[#1A1A1A]">{children}</main>
      <SiteFooter />
    </Providers>
  );
}
