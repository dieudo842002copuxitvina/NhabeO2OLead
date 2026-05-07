import type { Metadata } from "next";
import TinhToanClient from "./TinhToanClient";

/* ─────────────────────────────────────────────────────────────────────────────
 * SEO METADATA - For Zalo/Facebook sharing
 * ───────────────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Máy Tính Thủy Lực | Dự toán hệ thống tưới - Nhà Bè Agri",
  description: "Tính toán BOM hệ thống tưới tiêu tự động. Xem công suất bơm, chi phí vật tư và nhận báo giá từ đại lý gần nhất. Miễn phí 100%.",
  keywords: ["máy tính thủy lực", "tính toán tưới", "dự toán vật tư", "bom tưới", "Nhà Bè Agri"],
  openGraph: {
    title: "Máy Tính Thủy Lực | Nhà Bè Agri",
    description: "Tính toán BOM hệ thống tưới tự động. Nhận báo giá chi tiết từ đại lý gần nhất.",
    url: "https://nhabeagri.vn/tinh-toan",
    siteName: "Nhà Bè Agri",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/og-calculator.jpg",
        width: 1200,
        height: 630,
        alt: "Máy Tính Thủy Lực - Nhà Bè Agri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Máy Tính Thủy Lực | Nhà Bè Agri",
    description: "Tính toán BOM hệ thống tưới tự động. Nhận báo giá chi tiết từ đại lý gần nhất.",
    images: ["/og-calculator.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TinhToanPage() {
  return <TinhToanClient />;
}
