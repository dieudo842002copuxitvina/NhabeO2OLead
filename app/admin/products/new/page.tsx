import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';

export const metadata = {
  title: 'Thêm sản phẩm mới | AgriOS',
};

export default function NewProductPage() {
  return (
    <AdminShell title="PIM (Quản lý Thông tin Sản phẩm)" subtitle="Thêm sản phẩm mới vào danh mục kỹ thuật">
      <div className="py-4 max-w-5xl mx-auto">
        <ProductForm />
      </div>
    </AdminShell>
  );
}
