import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InvestmentRoiWidget from "./_components/InvestmentRoiWidget";

type PageProps = {
  params: {
    slug: string;
  };
};

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await prisma.products.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại | Nhà Bè Agri",
      description: "Sản phẩm bạn tìm kiếm không tồn tại hoặc đã được cập nhật.",
    };
  }

  return {
    title: `${product.name} | Nhà Bè Agri`,
    description: product.description?.slice(0, 160) || "",
    alternates: {
      canonical: `/san-pham/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await prisma.products.findUnique({
    where: { slug: params.slug },
    include: {
      categories: true,
      brand: true,
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.products.findMany({
    where: { category_id: product.category_id, NOT: { id: product.id } },
    take: 4,
  });

  // Safe parsing of JSON specifications
  let specs: Record<string, string> = {};
  if (product.specifications) {
    try {
      specs = typeof product.specifications === 'string' 
        ? JSON.parse(product.specifications) 
        : product.specifications as Record<string, string>;
    } catch (e) {
      specs = {};
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/danh-muc/tat-ca" className="hover:text-gray-900">
            Danh mục
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">{product.name}</span>
        </nav>

        <section className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            <div className="relative h-[320px] w-full sm:h-[460px]">
              <Image
                src={product.image_url ?? "/placeholder.svg"}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">{product.brand?.name || ""}</p>

            <h1 className="text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">{product.name}</h1>

            <p className="text-4xl font-black text-[#064E3B]">
              {product.base_price ? formatVnd(product.base_price) : "Liên hệ"}
              <span className="ml-2 text-base font-semibold text-gray-500">/ Sản phẩm</span>
            </p>

            <p className="text-base leading-7 text-gray-600">{product.description}</p>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
              <span className="font-semibold">📍 Tình trạng: </span>
              {product.in_stock ? "Sẵn hàng tại các điểm bán" : "Liên hệ để đặt hàng"}
            </div>

            <a
              href="https://zalo.me/0342322301"
              target="_blank"
              rel="noopener noreferrer"
              data-tracking="last-click"
              className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#0068FF] px-5 text-center text-sm font-extrabold text-white transition hover:bg-[#005ce6] sm:text-base"
            >
              TƯ VẤN THIẾT KẾ & BÁO GIÁ QUA ZALO
            </a>
          </div>
        </section>

        <div className="my-8 h-px w-full bg-gray-200" />

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold text-gray-900">Thông số kỹ thuật</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-gray-200 bg-white">
                {Object.keys(specs).length > 0 ? (
                  Object.entries(specs).map(([specName, specValue]) => (
                    <tr key={specName}>
                      <th className="w-[40%] bg-gray-50 px-4 py-3 font-semibold text-gray-700">{specName}</th>
                      <td className="px-4 py-3 text-gray-900">{String(specValue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 text-gray-500 italic">Chưa có thông số kỹ thuật chi tiết.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {(product.categories?.slug === "drone" || product.categories?.slug === "solar") && (
          <>
            <div className="my-8 h-px w-full bg-gray-200" />
            <InvestmentRoiWidget productPrice={product.base_price || 0} />
          </>
        )}
      </div>
      <div className="fixed bottom-0 z-50 w-full border-t bg-white p-3 lg:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
          <p className="line-clamp-1 flex-1 text-sm font-semibold text-gray-900">{product.name}</p>
          <a
            href="https://zalo.me/0342322301"
            target="_blank"
            rel="noopener noreferrer"
            data-tracking="last-click"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#0068FF] px-5 text-sm font-bold text-white"
          >
            Zalo Tư Vấn
          </a>
        </div>
      </div>
    </main>
  );
}
