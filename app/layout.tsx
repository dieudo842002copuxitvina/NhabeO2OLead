import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "@/index.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

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

/**
 * Root Layout - Chỉ chứa html/body và font configuration
 * KHÔNG chứa TopNav/SiteFooter vì sẽ gây xung đột với Admin routes
 * 
 * Public pages sử dụng app/(public)/layout.tsx
 * Admin pages sử dụng app/admin/layout.tsx
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="bg-[#FFFFFF]">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className={`${beVietnamPro.className} bg-[#FFFFFF] text-[#1A1A1A]`}>
        {children}
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
