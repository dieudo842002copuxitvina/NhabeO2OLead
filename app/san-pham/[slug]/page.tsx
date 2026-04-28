import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, ChevronRight, Info, PackageCheck } from "lucide-react";
import { PRODUCTS_DATA } from "@/data/products";

type PageProps = {
  params: { slug: string };
};

const PAGE_BG = "#FDFBF7";
const PRIMARY = "#064E3B";
const SECONDARY = "#F59E0B";

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function findProduct(slug: string) {
  return PRODUCTS_DATA.find((item) => item.slug === slug);
}

export function generateStaticParams() {
  return PRODUCTS_DATA.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const product = findProduct(params.slug);
  if (!product) {
    return {
      title: "Sản phẩm không tồn tại | Nhà Bè Agri",
      description: "Sản phẩm bạn tìm kiếm không tồn tại hoặc đã được cập nhật.",
    };
  }
  return {
    title: `${product.name} | Nhà Bè Agri`,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      title: `${product.name} | Nhà Bè Agri`,
      description: product.description.slice(0, 160),
      images: product.images?.[0] ? [product.images[0]] : undefined,
      type: "website",
      locale: "vi_VN",
    },
  };
}

export default function ProductDetailPage({ params }: PageProps) {
  const product = findProduct(params.slug);
  if (!product) notFound();

  const related = PRODUCTS_DATA.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 10);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    category: product.subCategory,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: `/san-pham/${product.slug}`,
      price: product.price,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main className="min-h-screen text-gray-900" style={{ backgroundColor: PAGE_BG }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-600">
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

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="relative h-[320px] w-full overflow-hidden rounded-xl bg-gray-100 sm:h-[460px]">
                <Image src={product.images[0] ?? "/placeholder.svg"} alt={product.name} fill className="object-cover" priority sizes="(max-width:1024px) 100vw, 60vw" />
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {product.images.slice(0, 5).map((image, index) => (
                  <div key={`${image}-${index}`} className="relative h-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 sm:h-20">
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" sizes="100px" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="mb-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide" style={{ color: PRIMARY }}>
                {product.subCategory}
              </p>
              <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">{product.name}</h1>
              <p className="mt-4 text-3xl font-extrabold" style={{ color: PRIMARY }}>
                {formatVnd(product.price)}
              </p>

              <div className="mt-5 space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
                <p className="flex items-center gap-2 text-gray-700">
                  <Building2 className="h-4 w-4" style={{ color: SECONDARY }} />
                  <span className="font-medium">Thương hiệu:</span> {product.brand}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <PackageCheck className="h-4 w-4" style={{ color: SECONDARY }} />
                  <span className="font-medium">Đơn vị:</span> {product.unit}
                </p>
              </div>

              <a
                href="https://zalo.me/YOUR_ZALO_NUMBER"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-14 w-full items-center justify-center rounded-xl text-base font-extrabold text-white transition hover:opacity-95"
                style={{ backgroundColor: PRIMARY }}
              >
                LIÊN HỆ TƯ VẤN QUA ZALO
              </a>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <BadgeCheck className="h-4 w-4" style={{ color: PRIMARY }} />
                Cam kết kỹ thuật Nhà Bè Agri
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>Khảo sát thực tế và tư vấn cấu hình đúng nhu cầu canh tác.</li>
                <li>Hướng dẫn vận hành và bàn giao tiêu chuẩn tại vườn.</li>
                <li>Hỗ trợ kỹ thuật theo vùng để đảm bảo hiệu quả dài hạn.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Info className="h-5 w-5" style={{ color: PRIMARY }} />
            Thông số kỹ thuật chuyên sâu
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-gray-200 bg-white">
                {Object.entries(product.specs).map(([key, value]) => (
                  <tr key={key}>
                    <th className="w-[38%] bg-gray-50 px-4 py-3 font-semibold text-gray-700">{key}</th>
                    <td className="px-4 py-3 text-gray-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-7 text-gray-600">{product.description}</p>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-extrabold text-gray-900">Sản phẩm liên quan</h2>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Cùng nhóm {product.category}</span>
          </div>

          {related.length > 0 ? (
            <div className="flex snap-x gap-4 overflow-x-auto pb-2">
              {related.map((item) => (
                <article key={item.id} className="min-w-[250px] snap-start overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:min-w-[280px]">
                  <Link href={`/san-pham/${item.slug}`} className="block">
                    <div className="relative h-44 w-full bg-gray-100">
                      <Image src={item.images[0] ?? "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="280px" />
                    </div>
                  </Link>
                  <div className="space-y-2 p-4">
                    <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{item.name}</h3>
                    <p className="text-base font-extrabold" style={{ color: PRIMARY }}>
                      {formatVnd(item.price)}
                    </p>
                    <Link
                      href={`/san-pham/${item.slug}`}
                      className="inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white"
                      style={{ backgroundColor: SECONDARY }}
                    >
                      Xem sản phẩm
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">
              Đang cập nhật thêm sản phẩm liên quan.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
