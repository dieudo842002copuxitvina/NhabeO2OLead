import React from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm, { type ProductCategoryOption } from '@/components/admin/ProductForm';

export const metadata = {
  title: 'Thêm sản phẩm mới | AgriOS',
};

const FALLBACK_CATEGORIES: ProductCategoryOption[] = [
  { id: 'fallback-vat-tu-tuoi', name: 'Vật tư tưới', slug: 'vat-tu-tuoi', source: 'fallback' },
  { id: 'fallback-phan-bon', name: 'Phân bón', slug: 'phan-bon', source: 'fallback' },
  { id: 'fallback-may-bom', name: 'Máy bơm', slug: 'may-bom', source: 'fallback' },
  { id: 'fallback-van-tuoi', name: 'Van tưới', slug: 'van-tuoi', source: 'fallback' },
  { id: 'fallback-bec-tuoi', name: 'Béc tưới', slug: 'bec-tuoi', source: 'fallback' },
  { id: 'fallback-ong-tuoi', name: 'Ống tưới', slug: 'ong-tuoi', source: 'fallback' },
];

async function fetchCategories(): Promise<ProductCategoryOption[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return FALLBACK_CATEGORIES;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error) {
      console.error('Failed to fetch categories for ProductForm:', error);
      return FALLBACK_CATEGORIES;
    }

    const normalizedCategories = (data ?? [])
      .filter((row) => row?.id && row?.name && row?.slug)
      .map((row) => ({
        id: String(row.id),
        name: String(row.name),
        slug: String(row.slug),
        source: 'supabase' as const,
      }));

    return normalizedCategories.length > 0 ? normalizedCategories : FALLBACK_CATEGORIES;
  } catch (error) {
    console.error('Unexpected category fetch failure:', error);
    return FALLBACK_CATEGORIES;
  }
}

export default async function NewProductPage() {
  const categories = await fetchCategories();

  return (
    <AdminShell
      title="PIM (Quản lý Thông tin Sản phẩm)"
      subtitle="Thêm sản phẩm mới với metadata bán hàng, tồn kho và thông số động theo danh mục."
    >
      <div className="mx-auto max-w-6xl py-4">
        <ProductForm categories={categories} />
      </div>
    </AdminShell>
  );
}
