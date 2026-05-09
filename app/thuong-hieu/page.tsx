import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Thương hiệu đối tác | Nhà Bè Agri",
  description: "Danh sách các thương hiệu thiết bị tưới, vật tư nông nghiệp chính hãng phân phối bởi Nhà Bè Agri.",
};

export default async function BrandsIndexPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  return (
    <main className="min-h-screen bg-slate-50 pt-16 pb-16">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Thương Hiệu Đối Tác
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Nhà Bè Agri tự hào là nhà phân phối chính thức của các thương hiệu vật tư nông nghiệp, thiết bị tưới tiêu hàng đầu thế giới.
          </p>
        </div>

        {brands.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/thuong-hieu/${brand.slug}`}
                className="group flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all text-center"
              >
                <div className="relative w-full aspect-video mb-4 flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={`Logo ${brand.name}`}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="text-2xl font-black text-slate-300 tracking-wider">
                      {brand.name.substring(0, 3).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{brand.name}</h3>
                {brand.origin_country && (
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                    Xuất xứ: {brand.origin_country}
                  </p>
                )}
                <p className="text-sm font-medium text-emerald-600 mt-auto">
                  {brand._count.products} sản phẩm
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">Đang cập nhật danh sách thương hiệu.</p>
          </div>
        )}
      </div>
    </main>
  );
}
