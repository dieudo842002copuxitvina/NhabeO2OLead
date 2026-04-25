import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, ShieldAlert, Info, FileText, Download, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import NearbyDealersModule from '@/components/product/NearbyDealersModule';
import ProductSchema from '@/components/ProductSchema';
import { Product } from '@/data/types';
import { generateSEOMetadata } from '@/lib/seo';

interface Props {
  params: { slug: string };
}

/**
 * Component hiển thị thông số kỹ thuật (Specs) chuyên sâu
 */
function ProductSpecsTable({ specs }: { specs: Record<string, any> }) {
  if (!specs || Object.keys(specs).length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-200">
        <p className="text-slate-400 italic text-sm">Thông số kỹ thuật đang được cập nhật...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-slate-50">
          {Object.entries(specs).map(([key, value]) => (
            <tr key={key} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4 font-bold text-slate-500 w-1/3 bg-slate-50/30 group-hover:bg-slate-50 transition-colors capitalize">
                {key.replace(/_/g, ' ')}
              </td>
              <td className="px-6 py-4 text-slate-900 font-medium">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * SEO Động: Sử dụng meta_title và meta_desc từ DB
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: product } = await supabase
    .from('products')
    .select('name, slug, description, image, category, attributes')
    .eq('slug', params.slug)
    .single();

  if (!product) return { title: 'Sản phẩm không tìm thấy' };

  const meta = (product.attributes as any) || {};

  return generateSEOMetadata({
    productName: product.name,
    brandName: meta.brand_name || meta.brand || 'Nhà Bè Agri',
    area: meta.area_served || meta.province || meta.region || product.category || 'Việt Nam',
    description: meta.meta_desc || product.description,
    canonicalPath: `/san-pham/${product.slug || params.slug}`,
    image: product.image || meta.og_image,
    keywords: [product.category, ...(Array.isArray(meta.keywords) ? meta.keywords : [])].filter(Boolean),
  });
}

export default async function ProductDetailPage({ params }: Props) {
  // Logic Fetching dữ liệu thực tế từ Supabase
  const { data: dbProduct, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !dbProduct) {
    notFound();
  }

  // Mapping DB data to Product interface
  const product: Product = {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    sku: (dbProduct as any).sku || `NB-${dbProduct.id.slice(0, 5).toUpperCase()}`, // Fallback if missing
    category_id: dbProduct.category,
    brand_id: (dbProduct as any).brand_id || 'nhabe-agri',
    price: dbProduct.price,
    unit: dbProduct.unit,
    description: dbProduct.description || '',
    thumbnail: dbProduct.image || 'https://images.unsplash.com/photo-1592982537447-6f2a6a0a0913?auto=format&fit=crop&q=80&w=800',
    gallery: (dbProduct.media as string[]) || [],
    specs: (dbProduct.attributes as Record<string, any>) || {},
    tags: dbProduct.tags || [],
    meta_title: (dbProduct.attributes as any)?.meta_title,
    meta_description: (dbProduct.attributes as any)?.meta_desc,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-6">
      <ProductSchema product={product} />
      <div className="container">
        {/* Breadcrumb chuyên nghiệp */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-10">
          <Link href="/" className="hover:text-primary transition-colors">AgriFlow</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link href="/san-pham" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* CỘT TRÁI: VISUALS & SPECS (7 cols) */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Gallery Section */}
            <section className="space-y-4">
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 relative group">
                <Image 
                  src={product.thumbnail} 
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute top-6 left-6">
                  <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-0 font-bold px-4 py-2 rounded-xl shadow-lg">
                    SKU: {product.sku}
                  </Badge>
                </div>
              </div>
              
              {product.gallery.length > 0 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {product.gallery.map((img, i) => (
                    <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer shrink-0 bg-white">
                      <Image src={img} alt={`${product.name} gallery ${i}`} width={96} height={96} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Content Section */}
            <section className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-0 font-bold uppercase tracking-wider text-[10px]">
                  CHÍNH HÃNG
                </Badge>
                {product.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="border-slate-200 text-slate-400 font-medium">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] font-display">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-primary">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-lg text-slate-300 font-bold line-through">
                  {(product.price * 1.25).toLocaleString('vi-VN')}₫
                </span>
                <Badge className="bg-orange-100 text-orange-600 border-0 font-bold">-{Math.round(20)}%</Badge>
              </div>

              <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Mô tả giải pháp</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            </section>

            {/* Technical Warning */}
            <div className="p-8 rounded-[2rem] border-2 border-red-100 bg-red-50/30 flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-red-700 text-sm uppercase tracking-wider mb-2">Lưu ý Kỹ thuật AgriFlow</h4>
                <p className="text-red-600/70 text-sm leading-relaxed">
                  Thiết bị này yêu cầu cấu hình áp suất chính xác để đạt hiệu suất tối ưu. Vui lòng tham khảo bảng thông số kỹ thuật bên dưới hoặc liên hệ kỹ sư của chúng tôi.
                </p>
              </div>
            </div>

            {/* BẢNG THÔNG SỐ KỸ THUẬT (Specs) */}
            <section id="technical-specs" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Info className="w-6 h-6 text-primary" /> Thông số kỹ thuật
                </h3>
                <Badge variant="outline" className="border-slate-200 text-slate-400">Standard QC-2024</Badge>
              </div>
              
              <ProductSpecsTable specs={product.specs} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-16 rounded-[1.5rem] border-slate-200 gap-3 hover:bg-slate-50 font-bold transition-all">
                  <FileText className="w-5 h-5 text-slate-400" />
                  Tải Catalogue Kỹ thuật (.PDF)
                </Button>
                <Button variant="outline" className="h-16 rounded-[1.5rem] border-slate-200 gap-3 hover:bg-slate-50 font-bold transition-all">
                  <Download className="w-5 h-5 text-slate-400" />
                  Sơ đồ lắp đặt chi tiết
                </Button>
              </div>
            </section>

          </div>

          {/* CỘT PHẢI: CONVERSION (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-8">
              
              {/* Module Đại lý & Chốt Sale */}
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">Mua hàng & Lắp đặt</h2>
                    <p className="text-sm text-slate-500 font-medium">Nhà Bè Agri kết nối bạn với hệ thống đại lý gần nhất.</p>
                  </div>

                  <NearbyDealersModule productId={product.id} />

                  <div className="pt-8 border-t border-slate-100 space-y-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cam kết từ Nhà Bè Agri</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { icon: BadgeCheck, text: 'Bảo hành chính hãng 12-24 tháng', color: 'text-blue-500' },
                        { icon: BadgeCheck, text: 'Hỗ trợ kỹ thuật 24/7 qua Hotline', color: 'text-green-500' },
                        { icon: BadgeCheck, text: 'Đổi trả linh hoạt trong 7 ngày', color: 'text-orange-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Knowledge Hub */}
              <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <div className="relative z-10 space-y-4">
                  <h4 className="text-lg font-bold">Bạn cần hỗ trợ lắp đặt?</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Đội ngũ kỹ thuật của chúng tôi sẵn sàng hỗ trợ bạn tính toán và thiết kế hệ thống tối ưu nhất.
                  </p>
                  <Button className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 border-0">
                    Nhận tư vấn kỹ thuật ngay
                  </Button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
