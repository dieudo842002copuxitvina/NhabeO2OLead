import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Agri-OS',
  description: 'Bảng điều khiển quản trị hệ thống Nhà Bè Agri.',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 
        The admin layout is rendered inside the root layout which includes TopNav + SiteFooter.
        We use a fixed full-screen shell to overlay those elements so the admin has its own chrome.
      */}
      {children}
    </>
  );
}
