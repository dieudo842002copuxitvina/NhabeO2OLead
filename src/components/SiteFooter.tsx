"use client";

import Link from "next/link";
import { Facebook, Mail, MapPin, Phone, Sprout, Youtube } from "lucide-react";
import { trackEvent } from "@/lib/tracking";

const footerGroups = [
  {
    title: "Danh mục SEO",
    links: [
      { label: "Phân bón lá", href: "/danh-muc/phan-bon-la" },
      { label: "Thiết bị châm phân", href: "/danh-muc/thiet-bi-cham-phan" },
      { label: "Máy bơm nước", href: "/danh-muc/may-bom-nuoc" },
      { label: "Ống tưới nhỏ giọt", href: "/danh-muc/ong-tuoi-nho-giot" },
    ],
  },
  {
    title: "Giải pháp",
    links: [
      { label: "Giải pháp theo cây trồng", href: "/giai-phap" },
      { label: "Dự toán tưới", href: "/cong-cu/du-toan-tuoi" },
      { label: "Châm phân tự động", href: "/cong-cu/cham-phan" },
      { label: "Tính ROI nông nghiệp", href: "/cong-cu/roi" },
    ],
  },
  {
    title: "Mạng lưới",
    links: [
      { label: "25 đại lý toàn quốc", href: "/dai-ly" },
      { label: "Giá nông sản", href: "/gia-nong-san" },
      { label: "Blog nông nghiệp", href: "/blog" },
      { label: "Liên hệ tư vấn", href: "/lien-he" },
    ],
  },
];

const socials = [
  { label: "Facebook Nhà Bè Agri", href: "https://www.facebook.com/nhabeagri", icon: Facebook },
  { label: "YouTube Nhà Bè Agri", href: "https://www.youtube.com/@nhabeagri", icon: Youtube },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3" aria-label="Nhà Bè Agri">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sprout className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-lg font-extrabold leading-tight">Nhà Bè Agri</span>
                <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Storefront nông nghiệp O2O
                </span>
              </span>
            </Link>

            <p className="max-w-md text-sm leading-6 text-slate-600">
              Phân bón, thiết bị tưới, máy nông nghiệp và hệ thống đại lý địa phương cho nông hộ,
              trang trại và đội thi công trên toàn quốc.
            </p>

            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <a
                  href="tel:0983230879"
                  className="flex items-center gap-2 hover:text-primary"
                  onClick={() => trackEvent("call_click", { source: "footer" })}
                >
                  <Phone className="h-4 w-4" /> 0983 230 879
                </a>
              </li>
              <li>
                <a href="mailto:hello@nhabeagri.vn" className="flex items-center gap-2 hover:text-primary">
                  <Mail className="h-4 w-4" /> hello@nhabeagri.vn
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4" />
                <span>Nhà Bè, TP. Hồ Chí Minh, Việt Nam</span>
              </li>
            </ul>
          </div>

          <nav className="grid gap-6 sm:grid-cols-3" aria-label="Liên kết nội bộ">
            {footerGroups.map((group) => (
              <section key={group.title}>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">{group.title}</h2>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-slate-600 transition-colors hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Nhà Bè Agri. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
