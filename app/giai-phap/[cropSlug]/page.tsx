import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SOLUTIONS_DATA } from "@/data/solutions";
import { PRODUCTS_DATA } from "@/data/products";
import ProductCard from "../../store/ProductCard";
import { CheckCircle2 } from "lucide-react";

type Props = {
  params: {
    cropSlug: string;
  };
};

// 2. CẤU TRÚC LÕI SEO & SSG
export function generateStaticParams() {
  return SOLUTIONS_DATA.map((solution) => ({
    cropSlug: solution.cropSlug,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const solution = SOLUTIONS_DATA.find((s) => s.cropSlug === params.cropSlug);
  if (!solution) {
    return {
      title: "Không tìm thấy giải pháp | Nhà Bè Agri",
    };
  }

  return {
    title: `${solution.title} | Nhà Bè Agri`,
    description: solution.description,
    openGraph: {
      title: solution.title,
      description: solution.description,
      images: [
        {
          url: solution.coverImage,
          width: 1200,
          height: 630,
          alt: solution.title,
        },
      ],
    },
  };
}

export default function SolutionDetailPage({ params }: Props) {
  const solution = SOLUTIONS_DATA.find((s) => s.cropSlug === params.cropSlug);

  if (!solution) {
    notFound();
  }

  // Lọc sản phẩm được khuyên dùng
  const recommendedProducts = PRODUCTS_DATA.filter((product) =>
    solution.recommendedProductSlugs.includes(product.slug)
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        
        {/* Section A: Hero Panel (Tổng quan) */}
        <section className="grid grid-cols-1 items-center gap-8 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 lg:p-10">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md">
            <Image
              src={solution.coverImage}
              alt={solution.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {solution.title}
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {solution.description}
            </p>
            
            <ul className="mt-6 space-y-3">
              {solution.advantages.map((advantage, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-base text-gray-700">{advantage}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section B: Combo Thiết bị chuẩn (Cross-selling Grid) */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-6">
            Danh mục thiết bị chuẩn khuyên dùng
          </h2>
          {recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Đang cập nhật danh sách thiết bị...</p>
          )}
        </section>

        {/* Section C: Trạm Chốt Sale O2O (Bottom Lead Magnet) */}
        <section className="mt-16 rounded-3xl border border-green-200 bg-green-50 p-8 text-center shadow-sm md:p-12">
          <h3 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
            Bạn cần dự toán chi tiết cho rẫy của mình?
          </h3>
          <p className="mt-3 mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
            Để lại thông tin hoặc liên hệ kỹ thuật viên của chúng tôi để nhận ngay bản thiết kế và bảng báo giá trọn gói tối ưu nhất cho vườn của bạn.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="https://zalo.me/YOUR_ZALO_NUMBER" 
              target="_blank"
              rel="noopener noreferrer"
              data-tracking="last-click"
              className="inline-flex items-center justify-center rounded-xl bg-[#0068FF] px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-[#005ce6] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#0068FF] focus:ring-offset-2 transition-all duration-200"
            >
              [NHẬN BÁO GIÁ THIẾT KẾ RIÊNG QUA ZALO]
            </a>
          </div>
        </section>

      </div>
    </main>
  );
}
