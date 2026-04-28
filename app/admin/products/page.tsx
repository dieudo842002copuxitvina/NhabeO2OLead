import React from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminShell from '@/components/admin/AdminShell';
import ProductsTable from '@/components/admin/ProductsTable';

// Tránh sử dụng cookies client trong server component này nếu không bật SSR strict, 
// ta sẽ dùng Supabase Service Role để đọc data nhanh.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const revalidate = 0; // Tắt cache để luôn lấy dữ liệu mới nhất (hoặc cấu hình thời gian cache tùy ý)

export default async function ProductsPage() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Truy vấn bảng products
  // Lấy thêm thông tin category nếu bảng categories có quan hệ (relationships).
  // Vì chưa chắc bảng categories đã được thiết lập ForeignKey, ta tạm dùng JSON / String ID.
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, 
      sku, 
      name, 
      base_price, 
      image_url, 
      category_id
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Lỗi khi fetch products:', error);
  }

  const products = data || [];

  return (
    <AdminShell title="Quản lý Sản phẩm (PIM)" subtitle="Danh sách toàn bộ thiết bị nông nghiệp trong hệ thống">
      <div className="py-2">
        <ProductsTable data={products} />
      </div>
    </AdminShell>
  );
}
