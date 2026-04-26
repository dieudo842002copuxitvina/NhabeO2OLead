import type { Metadata } from "next";
import { PRODUCTS_DATA } from "@/data/products";
import ProductCard from "../../store/ProductCard";
import Link from "next/link";

type Props = {
  params: {
    slug: string;
  };
};

function slugify(text: string) {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryTitle(slug: string): string {
  if (slug === "may-bay-nong-nghiep") return "Máy bay Nông nghiệp";
  if (slug === "humic-fulvic") return "Humic/Fulvic";

  // Find in PRODUCTS_DATA
  const matchedBySub = PRODUCTS_DATA.find((p) => slugify(p.subCategory) === slug);
  if (matchedBySub) return matchedBySub.subCategory;

  const matchedByCat = PRODUCTS_DATA.find((p) => slugify(p.category) === slug);
  if (matchedByCat) {
    switch (matchedByCat.category) {
      case "DRONE":
        return "Máy bay Nông nghiệp";
      case "FERTILIZER":
        return "Dinh dưỡng & Phân bón";
      case "HARDWARE":
        return "Vật tư & Thiết bị";
      case "SOLAR":
        return "Điện mặt trời";
      default:
        return matchedByCat.category;
    }
  }

  // Fallback format slug
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function generateMetadata({ params }: Props): Metadata {
  const title = getCategoryTitle(params.slug);
  return {
    title: `${title} | Nhà Bè Agri`,
    description: `Xem danh sách sản phẩm thuộc danh mục ${title} tại Nhà Bè Agri. Sản phẩm chất lượng cao, giá tốt nhất.`,
  };
}

export default function CategoryPage({ params }: Props) {
  const { slug } = params;

  let filteredProducts = [];
  if (slug === "tat-ca") {
    filteredProducts = PRODUCTS_DATA;
  } else if (slug === "may-bay-nong-nghiep") {
    filteredProducts = PRODUCTS_DATA.filter((p) => p.category === "DRONE");
  } else if (slug === "humic-fulvic") {
    filteredProducts = PRODUCTS_DATA.filter((p) => p.subCategory === "Humic/Fulvic");
  } else {
    filteredProducts = PRODUCTS_DATA.filter(
      (p) => slugify(p.subCategory) === slug || slugify(p.category) === slug
    );
  }

  const displayTitle = slug === "tat-ca" ? "Tất cả sản phẩm" : getCategoryTitle(slug);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Sản phẩm: {displayTitle}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Tổng hợp các sản phẩm chất lượng hàng đầu tối ưu cho nhu cầu canh tác.
          </p>
        </header>

        {filteredProducts.length > 0 ? (
          <section className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Danh mục đang được cập nhật</h2>
            <p className="mt-2 text-base text-gray-500">
              Danh mục này đang được cập nhật sản phẩm. Vui lòng quay lại sau.
            </p>
            <div className="mt-6">
              <Link
                href="/danh-muc/tat-ca"
                className="inline-flex items-center rounded-xl bg-[#4CAF50] px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#43A047] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all"
              >
                Quay lại Cửa hàng
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

