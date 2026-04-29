import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import WikiEditor from '@/components/admin/WikiEditor';

export const metadata = {
  title: 'Tạo bài wiki mới | Agri-OS',
};

export default function NewWikiPage() {
  return (
    <AdminShell
      title="Tạo Bài Wiki Mới"
      subtitle="Soạn markdown, kiểm tra mạng lưới tri thức và chuẩn bị payload xuất bản cho Agri-OS."
    >
      <div className="mx-auto w-full max-w-[1600px] py-4">
        <WikiEditor />
      </div>
    </AdminShell>
  );
}
