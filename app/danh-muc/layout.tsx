import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm | Nhà Bè Agri",
  description: "Trang danh mục sản phẩm Nhà Bè Agri.",
};

export default function DanhMucLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
