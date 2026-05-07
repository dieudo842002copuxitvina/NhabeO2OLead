"use client";

import Link from "next/link";
import { Facebook, Mail, MapPin, Phone, Sprout, ShieldCheck, FileText, RefreshCw, Youtube, Building2, Calendar, MapPinned, CreditCard, Undo2 } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

/**
 * Global Footer - Vietnamese E-commerce Legal Compliance
 * 
 * Features:
 * - 4-column layout on Desktop (Brand | Policies | Company | Certification)
 * - Fully stacked on Mobile
 * - Bộ Công Thương notification badge
 * - Complete company registration information
 * - SEO-friendly internal links
 */
export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="container py-10">
        {/* ─────────────────────────────────────────────
            Main Footer Grid: 4 columns on Desktop
            ───────────────────────────────────────────── */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* ── Column 1: Brand & Contact ── */}
          <div className="space-y-4">
            {/* Logo & Company Name */}
            <Link href="/" className="flex items-center gap-3" aria-label="Nhà Bè Agri - Trang chủ">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                <Sprout className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-lg font-bold leading-tight text-white">
                  Nhà Bè Agri
                </span>
                <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                  Storefront Nông Nghiệp O2O
                </span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed">
              Hệ thống cung cấp phân bón, thiết bị tưới và kết nối mạng lưới đại lý 
              toàn quốc cho nông hộ Việt Nam.
            </p>

            {/* Contact */}
            <div className="space-y-2 text-sm">
              <ul className="space-y-2">
                <li>
                  <a
                    href="tel:0983230879"
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
                    onClick={() => trackEvent("call_click", { source: "footer" })}
                  >
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>Hotline CSKH: 0983 230 879</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:contact@nhabeagri.vn" 
                    className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span>contact@nhabeagri.vn</span>
                  </a>
                </li>
                <li className="flex items-start gap-2 text-slate-400">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>Nhà Bè, TP. Hồ Chí Minh</span>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://www.facebook.com/nhabeagri"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Nhà Bè Agri"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:border-emerald-500 hover:text-emerald-400"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@nhabeagri"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Nhà Bè Agri"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:border-emerald-500 hover:text-emerald-400"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* ── Column 2: Policies (Chính sách) ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              Chính sách
            </h3>
            <nav aria-label="Liên kết chính sách">
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/chinh-sach-bao-mat" 
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                    <span>Chính sách bảo mật</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dieu-khoan-su-dung" 
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span>Điều khoản sử dụng</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/chinh-sach-bao-hanh" 
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 flex-shrink-0" />
                    <span>Chính sách bảo hành</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/chinh-sach-bao-hanh#doi-tra" 
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <Undo2 className="h-4 w-4 flex-shrink-0" />
                    <span>Đổi trả & Hoàn tiền</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* ── Column 3: Company Info (Thông tin doanh nghiệp) ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              Thông tin doanh nghiệp
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-slate-400">Tên công ty</p>
                  <p className="font-medium text-white">Công Ty Cổ Phần Nhà Bè Agri</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-slate-400">Mã số thuế (MST)</p>
                  <p className="font-medium text-white">0318xxx123</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-slate-400">Ngày cấp ĐKKD</p>
                  <p className="font-medium text-white">01/01/2024</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPinned className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-slate-400">Nơi cấp</p>
                  <p className="font-medium text-white">Sở KH&ĐT TP. HCM</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-slate-400">Địa chỉ trụ sở</p>
                  <p className="font-medium text-white">Ấp 3, Xã Nhà Bè, Huyện Nhà Bè, TP. Hồ Chí Minh</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Column 4: Certification (Bộ Công Thương) ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">
              Giấy phép & Chứng nhận
            </h3>
            
            {/* Bộ Công Thương Badge */}
            <div className="rounded-lg border border-emerald-600/50 bg-emerald-900/30 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    Đã thông báo Bộ Công Thương
                  </p>
                  <p className="text-xs text-slate-400">
                    Theo Nghị định 52/2013/NĐ-CP
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Website thương mại điện tử này đã được đăng ký và thông báo với 
                Bộ Công Thương theo quy định pháp luật hiện hành.
              </p>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phương thức thanh toán
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
                  <CreditCard className="h-3.5 w-3.5" />
                  Chuyển khoản
                </span>
                <span className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
                  💵 COD
                </span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-400">
                🔒
              </span>
              <span>Dữ liệu được mã hóa SSL 256-bit</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            Bottom Bar: Copyright & Legal
            ───────────────────────────────────────────── */}
        <div className="mt-10 border-t border-slate-800 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} Công Ty Cổ Phần Nhà Bè Agri. 
                <span className="hidden sm:inline"> Tất cả quyền được bảo lưu.</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end text-xs text-slate-500">
              <span>Tuân thủ Nghị định 52/2013/NĐ-CP về TMĐT</span>
              <span className="hidden sm:inline">•</span>
              <span>Giấy CNĐKDN số: MOCK_REG_123456789</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
