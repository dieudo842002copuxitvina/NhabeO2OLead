import { Outlet } from 'react-router-dom';
import TopNav from '@/components/TopNav';
import AppShell from '@/components/AppShell';
import SiteFooter from '@/components/SiteFooter';
import ZaloFAB from '@/components/ZaloFAB';
import BottomNav from '@/components/BottomNav';

export default function PublicLayout() {
  return (
    <>
      <TopNav />
      <AppShell>
        <div className="pb-16 md:pb-0">
          <Outlet />
        </div>
      </AppShell>
      <SiteFooter />
      <ZaloFAB href="#" label="Chat Zalo · Tư vấn miễn phí" />
      <BottomNav />
    </>
  );
}

