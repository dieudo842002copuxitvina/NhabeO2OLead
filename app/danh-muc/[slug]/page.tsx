import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, PackageSearch } from "lucide-react";
import { PRODUCTS_DATA } from "@/data/products";
import ProductCard from "../../store/ProductCard";

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSlug(slug: string) {
  try {
    return decodeURIComponent(slug).toLowerCase();
  } catch {
    return slug.toLowerCase();
  }
}

function getCategoryLabel(slug: string) {
  if (slug === "tat-ca") return "Tất cả sản phẩm";
  if (slug === "may-bay-nong-nghiep") return "Máy bay nông nghiệp";
  if (slug === "humic-fulvic") return "Humic/Fulvic";

  const bySub = PRODUCTS_DATA.find((product) => slugify(product.subCategory) === slug);
  if (bySub) return bySub.subCategory;

  const byCategory = PRODUCTS_DATA.find((product) => slugify(product.category) === slug);
  if (byCategory) {
    const map: Record<string, string> = {
      DRONE: "Máy bay nông nghiệp",
      FERTILIZER: "Dinh dưỡng & Phân bón",
      HARDWARE: "Thiết bị & Vật tư tưới",
      SOLAR: "Điện mặt trời",
    };
    return map[byCategory.category] ?? byCategory.category;
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getFilteredProducts(slug: string) {
  if (slug === "tat-ca") return PRODUCTS_DATA;
  if (slug === "may-bay-nong-nghiep") return PRODUCTS_DATA.filter((product) => product.category === "DRONE");
  if (slug === "humic-fulvic") return PRODUCTS_DATA.filter((product) => product.subCategory === "Humic/Fulvic");

  return PRODUCTS_DATA.filter(
    (product) => slugify(product.subCategory) === slug || slugify(product.category) === slug,
  );
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const slug = normalizeSlug(params.slug);
  const categoryLabel = getCategoryLabel(slug);

  return {
    title: `Danh mục: ${categoryLabel} - Vật tư Nông nghiệp | Nhà Bè Agri`,
    description: `Khám phá danh mục ${categoryLabel} tại Nhà Bè Agri với đầy đủ vật tư và thiết bị nông nghiệp chất lượng.`,
    alternates: {
      canonical: `/danh-muc/${slug}`,
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const slug = normalizeSlug(params.slug);
  const categoryLabel = getCategoryLabel(slug);
  const filteredProducts = getFilteredProducts(slug);

  const brands = Array.from(new Set(filteredProducts.map((product) => product.brand))).sort();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/danh-muc/tat-ca" className="hover:text-gray-900">
              Danh mục
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">{categoryLabel}</span>
          </nav>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            {categoryLabel} ({filteredProducts.length} sản phẩm)
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <section className="bg-white rounded-xl shadow-sm p-5 space-y-6">
                <h2 className="text-base font-bold text-gray-900">Bộ lọc sản phẩm</h2>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Thương hiệu</h3>
                  <div className="space-y-2">
                    {(brands.length ? brands : ["DJI", "Haifa", "Rivulis", "AGtek"]).map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Mức giá</h3>
                  <div className="space-y-2">
                    {["Dưới 1 triệu", "1-5 triệu", "Trên 5 triệu"].map((range) => (
                      <label key={range} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <span>{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </aside>

          <section className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <PackageSearch className="h-8 w-8" />
                </div>
                <p className="mt-4 text-base text-gray-600 md:text-lg">
                  Hiện tại danh mục này đang được cập nhật sản phẩm mới. Bà con vui lòng quay lại sau nhé!
                </p>
                <Link
                  href="/danh-muc/tat-ca"
                  className="mt-6 inline-flex items-center rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                >
                  Xem tất cả sản phẩm
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
