import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { ChevronRight, Filter, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CategoryMenu from '@/components/CategoryMenu';

interface Props {
  params: { slug: string };
}

interface CategoryProductRow {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  category: string;
  brand_id?: string | null;
  price: number;
  unit: string;
  description?: string | null;
  image?: string | null;
  media?: string[] | null;
  attributes?: Record<string, unknown> | null;
  tags?: string[] | null;
}

/**
 * SEO Metadata: Tự động đổi Title theo tên danh mục hiện tại
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Vì chúng ta fetch theo slug, tên danh mục thường có thể suy ra từ slug hoặc fetch từ DB
  // Ở đây ta fetch thử 1 sản phẩm để lấy tên category nếu cần, hoặc giả định slug là đẹp
  const categoryName = params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${categoryName} | Nhà Bè Agri`,
    description: `Danh sách giải pháp ${categoryName.toLowerCase()} chính hãng tại Nhà Bè Agri.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  // Logic Fetching (Server Component)
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', params.slug);

  if (error) {
    console.error('Error fetching products:', error);
  }

  const categoryName = params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Breadcrumb & Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container py-6 md:py-10">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">{categoryName}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                {categoryName}
              </h1>
              <p className="text-slate-500 mt-2 max-w-2xl">
                Khám phá các giải pháp {categoryName.toLowerCase()} chất lượng cao, hỗ trợ kỹ thuật tận nơi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase text-[10px] tracking-widest">
                <Filter className="w-3.5 h-3.5 mr-2" /> Lọc
              </Button>
              <div className="flex items-center bg-slate-100 rounded-xl p-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white shadow-sm text-primary">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container grid grid-cols-1 gap-8 py-8 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <CategoryMenu className="lg:sticky lg:top-24" />
        </div>

        <div className="lg:col-span-9">
        {!products || products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-slate-900">Chưa có sản phẩm trong danh mục này</h3>
            <p className="text-slate-500 mt-2">Vui lòng quay lại sau hoặc liên hệ hỗ trợ để được tư vấn.</p>
            <Button className="mt-6 rounded-2xl" asChild>
              <Link href="/san-pham">Xem tất cả sản phẩm</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const item = product as CategoryProductRow;

              return (
                <ProductCard
                  key={item.id}
                  product={{
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    sku: item.sku || '',
                    category_id: item.category,
                    brand_id: item.brand_id || '',
                    price: item.price,
                    unit: item.unit,
                    description: item.description || '',
                    thumbnail: item.image || '',
                    gallery: item.media || [],
                    specs: item.attributes || {},
                    tags: item.tags || [],
                  }}
                />
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
