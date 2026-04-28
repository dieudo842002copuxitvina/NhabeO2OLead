import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CircleCheck, ShieldCheck } from "lucide-react";
import ProductCard from "../../store/ProductCard";
import DroneRoiCalculator from "../../store/[slug]/_components/DroneRoiCalculator";
import LeadCaptureForm from "../../store/[slug]/_components/LeadCaptureForm";
import ProductDetailTabs from "../../store/[slug]/_components/ProductDetailTabs";
import ProductGallery from "../../store/[slug]/_components/ProductGallery";
import { PRODUCTS_DATA } from "@/data/products";

type PageProps = {
  params: {
    slug: string;
  };
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

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
  const product = findProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts =
    product.relatedSlugs
      .map((slug) => findProductBySlug(slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 4) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    category: product.subCategory,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: `/san-pham/${product.slug}`,
      price: product.price,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Nhà Bè Agri",
      },
      priceValidUntil: "2027-12-31",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "27",
    },
    areaServed: product.geoAvailability.map((area) => ({
      "@type": "AdministrativeArea",
      name: area,
    })),
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/danh-muc/tat-ca" className="hover:text-gray-900">
            Cửa hàng
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{product.subCategory || product.category}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">{product.name}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Thương hiệu: {product.brand}</p>
              <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
              <p className="text-3xl font-black text-[#4CAF50]">{formatVnd(product.price)}</p>
              <p className="text-sm text-gray-500">Đơn vị tính: {product.unit}</p>

              {product.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.badges.map((badge) => (
                    <span
                      key={`${product.slug}-${badge}`}
                      className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-3 pt-4 sm:grid-cols-2">
                <a
                  href="#lead-form"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#2E7D32] px-4 text-sm font-bold text-white transition-colors hover:bg-[#256A29]"
                >
                  Mua ngay
                </a>
                <a
                  href="https://zalo.me/YOUR_ZALO_NUMBER"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0068FF] px-4 text-sm font-bold text-white transition-colors hover:bg-[#005ce6]"
                >
                  Tư vấn Zalo
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <p className="flex items-center gap-2 text-base font-bold text-gray-900">
                <ShieldCheck className="h-5 w-5 text-[#4CAF50]" />
                Lợi ích O2O (Online to Offline)
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4CAF50]" />
                  Kỹ sư địa phương khảo sát thông số vận hành tại vườn.
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4CAF50]" />
                  Hỗ trợ kỹ thuật trọn gói suốt mùa vụ canh tác.
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4CAF50]" />
                  Giao hàng nhanh chóng từ trạm đại lý gần nhất.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {product.category === "DRONE" ? <DroneRoiCalculator dronePrice={product.price} /> : null}

        <ProductDetailTabs description={product.description} specs={product.specs} />

        <section className="space-y-6 pt-8">
          <header>
            <h2 className="text-2xl font-bold text-gray-900">Sản phẩm liên quan</h2>
            <p className="text-sm text-gray-500">Khuyến dùng đi kèm để gia tăng hiệu suất vận hành tối đa.</p>
          </header>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center text-gray-500">
              Đang cập nhật sản phẩm gợi ý.
            </div>
          )}
        </section>

        <LeadCaptureForm productCategory={product.category} />
      </div>
    </main>
  );
}
