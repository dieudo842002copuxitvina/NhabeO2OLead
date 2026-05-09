import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChevronRight, MapPin, Globe } from "lucide-react";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
  });

  if (!brand) return { title: "Không tìm thấy thương hiệu" };

  return {
    title: `${brand.name} - Thiết bị tưới chính hãng | Nhà Bè Agri`,
    description: brand.description?.slice(0, 160) || `Xem danh sách sản phẩm chính hãng ${brand.name} phân phối bởi Nhà Bè Agri.`,
  };
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function BrandDetailPage({ params }: Props) {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        include: { categories: true },
      },
    },
  });

  if (!brand) {
    notFound();
  }

  const products = brand.products || [];

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-16 pb-16">
        <div className="container max-w-6xl mx-auto px-4">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/thuong-hieu" className="hover:text-white transition-colors">
              Thương hiệu
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-white">{brand.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-48 h-48 shrink-0 bg-white rounded-2xl flex items-center justify-center p-6 shadow-xl">
              {brand.logo_url ? (
                <div className="relative w-full h-full">
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="text-4xl font-black text-slate-300 tracking-wider">
                  {brand.name.substring(0, 3).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold">{brand.name}</h1>
              {brand.origin_country && (
                <p className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
                  <Globe className="w-4 h-4" />
                  Xuất xứ: {brand.origin_country}
                </p>
              )}
              {brand.description && (
                <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
                  {brand.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container max-w-6xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Sản phẩm {brand.name} ({products.length})
          </h2>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/san-pham/${product.slug}`}
                className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-emerald-300 transition-all"
              >
                <div className="relative aspect-square bg-slate-100">
                  <Image
                    src={product.image_url || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-medium">
                    {product.categories?.name || "Sản phẩm"}
                  </span>
                  <h3 className="font-semibold text-slate-900 line-clamp-2 mb-3 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <p className="font-bold text-emerald-600">
                      {product.base_price ? formatVnd(Number(product.base_price)) : "Liên hệ"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">Chưa có sản phẩm nào thuộc thương hiệu này.</p>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="container max-w-4xl mx-auto px-4 mt-16">
        <div className="bg-emerald-50 rounded-3xl p-8 md:p-12 text-center border border-emerald-100">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-950 mb-4">
            Đại lý phân phối {brand.name} chính hãng
          </h2>
          <p className="text-emerald-800 mb-8 max-w-2xl mx-auto">
            Nhà Bè Agri cam kết cung cấp sản phẩm {brand.name} 100% chính hãng với chính sách bảo hành trực tiếp. Tìm đại lý gần bạn nhất để được hỗ trợ.
          </p>
          <Link
            href={`/dai-ly?brand=${brand.slug}`}
            className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <MapPin className="w-5 h-5" />
            Tìm đại lý gần nhất
          </Link>
        </div>
      </section>
    </main>
  );
}
