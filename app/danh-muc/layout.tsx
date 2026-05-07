import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm | Nhà Bè Agri",
  description: "Trang danh mục sản phẩm Nhà Bè Agri.",
};

export default function DanhMucLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {children}
      <div className="flex-shrink-0 mt-auto">
        <SiteFooter />
      </div>
    </div>
  );
}
