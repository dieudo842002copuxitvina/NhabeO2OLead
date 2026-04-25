import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "@/index.css";
import TopNav from "@/components/TopNav";
import SiteFooter from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Providers } from "./providers";
import GA4RouteTracker from "@/components/GA4RouteTracker";
import AIRulePopup from "@/components/AIRulePopup";
import { Suspense } from "react";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://nhabeagri.vn"),
  title: {
    default: "Nhà Bè Agri | Storefront phân bón & thiết bị nông nghiệp",
    template: "%s | Nhà Bè Agri",
  },
  description:
    "Storefront Nhà Bè Agri cung cấp phân bón, thiết bị tưới, máy nông nghiệp và kết nối 25 đại lý hỗ trợ kỹ thuật theo vùng.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nhà Bè Agri | Storefront phân bón & thiết bị nông nghiệp",
    description:
      "Giải pháp nông nghiệp chính hãng, kết nối đại lý gần nhất và hỗ trợ kỹ thuật cho nông hộ Việt Nam.",
    url: "/",
    siteName: "Nhà Bè Agri",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/og-nhabe-agri.jpg",
        width: 1200,
        height: 630,
        alt: "Nhà Bè Agri Storefront",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="bg-[#FFFFFF]">
      <body className={`${beVietnamPro.className} bg-[#FFFFFF] text-[#1A1A1A]`}>
        <Providers>
          <Suspense fallback={null}>
            <GA4RouteTracker />
          </Suspense>
          <AIRulePopup />
          <TopNav />
          <main className="bg-[#FFFFFF] text-[#1A1A1A]">{children}</main>
          <SiteFooter />
          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  );
}
