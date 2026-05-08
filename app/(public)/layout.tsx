"use client";

import { Suspense } from "react";
import { Providers } from "../providers";
import AIRulePopup from "@/components/AIRulePopup";
import GA4RouteTracker from "@/components/GA4RouteTracker";
import SiteFooter from "@/components/SiteFooter";
import TopNav from "@/components/TopNav";

/* ─────────────────────────────────────────────
 * Public Layout
 * Sử dụng TopNav đã được cập nhật với:
 * - Logo: Nhà Bè Agri
 * - Menu chuẩn: Trang chủ | Giải pháp | Sản phẩm | Hệ thống Đại lý | Kinh nghiệm
 * - Mega Menu Dropdown cho Sản phẩm
 * - CTA: Tính Toán Vật Tư
 * ───────────────────────────────────────────── */

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Suspense fallback={null}>
        <GA4RouteTracker />
      </Suspense>
      <AIRulePopup />
      <TopNav />
      <main className="bg-white text-slate-900">{children}</main>
      <SiteFooter />
    </Providers>
  );
}
