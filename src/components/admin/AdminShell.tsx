'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import RealtimeLeadNotifier from '@/components/admin/RealtimeLeadNotifier';

interface AdminShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Full-screen admin shell that overlays the public storefront layout.
 * Contains sidebar, header, and scrollable main content area.
 */
export default function AdminShell({ title, subtitle, children }: AdminShellProps) {
  return (
    <div className="fixed inset-0 z-[100] flex bg-background text-foreground">
      <RealtimeLeadNotifier />
      <AdminSidebar />
      <div className="ml-[260px] flex flex-1 flex-col overflow-hidden">
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
