import AdminShell from '@/components/admin/AdminShell';
import ProductsTable from '@/components/admin/ProductsTable';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const revalidate = 0;

async function getProducts() {
  try {
    const supabase = createSupabaseAdminClient();

    const [{ data: productsData, error: productsError }, { data: categoriesData, error: categoriesError }] =
      await Promise.all([
        supabase
          .from('products')
          .select('id, name, slug, category_id, image_url, description, created_at, is_active')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('id, name'),
      ]);

    if (productsError) {
      console.error('Failed to fetch real products:', productsError);
      return [];
    }

    if (categoriesError) {
      console.error('Failed to fetch categories for product list:', categoriesError);
    }

    const categoryMap = new Map(
      (categoriesData || []).map((category) => [String(category.id), category.name])
    );

    return (productsData || []).map((product) => ({
      id: String(product.id),
      name: product.name || 'Chưa đặt tên',
      slug: product.slug || '',
      categoryId: product.category_id ? String(product.category_id) : null,
      categoryName: product.category_id ? categoryMap.get(String(product.category_id)) || null : null,
      imageUrl: product.image_url || null,
      description: product.description || null,
      createdAt: product.created_at || null,
      isActive: typeof product.is_active === 'boolean' ? product.is_active : null,
    }));
  } catch (error) {
    console.error('Unexpected error while loading product list:', error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <AdminShell
      title="Quản lý Sản phẩm (PIM)"
      subtitle="Danh sách sản phẩm thật đang tồn tại trong hệ thống Supabase"
    >
      <div className="py-2">
        <ProductsTable data={products} />
      </div>
    </AdminShell>
  );
}
