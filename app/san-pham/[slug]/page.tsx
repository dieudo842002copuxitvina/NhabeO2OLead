import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PRODUCTS_DATA } from "@/data/products";
import InvestmentRoiWidget from "./_components/InvestmentRoiWidget";
import ProductCard from "../../store/ProductCard";

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

function findProductBySlug(slug: string) {
  return PRODUCTS_DATA.find((product) => product.slug === slug);
}

export function generateStaticParams() {
  return PRODUCTS_DATA.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const product = findProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại | Nhà Bè Agri",
      description: "Sản phẩm bạn tìm kiếm không tồn tại hoặc đã được cập nhật.",
    };
  }

  return {
    title: `${product.name} | Nhà Bè Agri`,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: `/san-pham/${product.slug}`,
    },
  };
}

export default function ProductDetailPage({ params }: PageProps) {
  const product = findProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = product.relatedSlugs
    .map((slug) => findProductBySlug(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

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
                src={product.images?.[0] ?? "/placeholder.svg"}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">{product.brand}</p>

            <h1 className="text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">{product.name}</h1>

            {product.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.badges.map((badge) => (
                  <span
                    key={`${product.id}-${badge}`}
                    className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}

            <p className="text-4xl font-black text-[#064E3B]">
              {formatVnd(product.price)}
              <span className="ml-2 text-base font-semibold text-gray-500">/ {product.unit}</span>
            </p>

            <p className="text-base leading-7 text-gray-600">{product.description}</p>

            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
              <span className="font-semibold">📍 Sẵn sàng triển khai tại: </span>
              {product.geoAvailability.join(", ")}
            </div>

            <a
              href="https://zalo.me/YOUR_ZALO_NUMBER"
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
                {Object.entries(product.specs).map(([specName, specValue]) => (
                  <tr key={specName}>
                    <th className="w-[40%] bg-gray-50 px-4 py-3 font-semibold text-gray-700">{specName}</th>
                    <td className="px-4 py-3 text-gray-900">{specValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {(product.category === "DRONE" || product.category === "SOLAR") && (
          <>
            <div className="my-8 h-px w-full bg-gray-200" />
            <InvestmentRoiWidget productPrice={product.price} />
          </>
        )}

        <div className="my-8 h-px w-full bg-gray-200" />

        <section>
          <h2 className="text-2xl font-extrabold text-gray-900">Thiết bị & Vật tư thường mua cùng</h2>
          {relatedProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center text-sm text-gray-500">
              Đang cập nhật thêm gợi ý sản phẩm phù hợp.
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-0 z-50 w-full border-t bg-white p-3 lg:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
          <p className="line-clamp-1 flex-1 text-sm font-semibold text-gray-900">{product.name}</p>
          <a
            href="https://zalo.me/YOUR_ZALO_NUMBER"
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
