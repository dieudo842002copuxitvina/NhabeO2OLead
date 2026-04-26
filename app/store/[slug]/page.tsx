import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CircleCheck, PhoneCall } from "lucide-react";
import ProductCard from "../ProductCard";
import ProductGallery from "./_components/ProductGallery";
import ProductDetailTabs from "./_components/ProductDetailTabs";
import DroneRoiCalculator from "./_components/DroneRoiCalculator";
import LeadCaptureForm from "./_components/LeadCaptureForm";
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
      title: "San pham khong ton tai | Nha Be Agri",
      description: "San pham ban tim kiem khong ton tai hoac da duoc cap nhat.",
    };
  }

  return {
    title: `${product.name} | Cua hang Nha Be Agri`,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: `/store/${product.slug}`,
    },
  };
}

export default function StoreProductDetailPage({ params }: PageProps) {
  const product = findProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts =
    product.relatedSlugs
      .map((slug) => findProductBySlug(slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 4) ||
    [];

  return (
    <main className="min-h-screen bg-white text-[#1A1A1A]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            Trang chu
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/store" className="hover:text-gray-900">
            Cua hang
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

          <div className="space-y-4 lg:col-span-5">
            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{product.brand}</p>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
              <p className="text-3xl font-bold text-[#4CAF50]">{formatVnd(product.price)}</p>
              <p className="text-sm text-gray-500">Don vi tinh: {product.unit}</p>

              {product.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.badges.map((badge) => (
                    <span
                      key={`${product.slug}-${badge}`}
                      className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}

              <a
                href="#lead-form"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2E7D32] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#256A29]"
              >
                <PhoneCall className="h-4 w-4" />
                LIEN HE TU VAN
              </a>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Loi ich O2O</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4CAF50]" />
                  Ky su dia phuong tu van thong so van hanh phu hop vuon.
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4CAF50]" />
                  Ho tro trien khai va huong dan su dung tai vuon.
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#4CAF50]" />
                  Ket noi dai ly gan nhat de giao hang nhanh va bao hanh.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {product.category === "DRONE" ? <DroneRoiCalculator dronePrice={product.price} /> : null}

        <ProductDetailTabs description={product.description} specs={product.specs} />

        <section className="space-y-4">
          <header>
            <h2 className="text-xl font-semibold text-gray-900">San pham di kem</h2>
            <p className="text-sm text-gray-600">Goi y cac san pham bo tro de tang hieu qua van hanh.</p>
          </header>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
              Dang cap nhat san pham goi y.
            </div>
          )}
        </section>

        <LeadCaptureForm productCategory={product.category} />
      </div>
    </main>
  );
}
