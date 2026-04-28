import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PRODUCTS_DATA } from "@/data/products";
import ProductCard from "@/app/store/ProductCard";

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

function getFilteredProducts(slug: string) {
  if (slug === "may-bay-nong-nghiep") {
    return PRODUCTS_DATA.filter((product) => product.category === "DRONE");
  }

  if (slug === "humic-fulvic") {
    return PRODUCTS_DATA.filter((product) => product.subCategory === "Humic/Fulvic");
  }

  return PRODUCTS_DATA.filter(
    (product) => slugify(product.subCategory) === slug || slugify(product.category) === slug,
  );
}

function toDisplayTitle(slug: string, products: typeof PRODUCTS_DATA) {
  if (slug === "may-bay-nong-nghiep") return "Máy bay nông nghiệp";
  if (slug === "humic-fulvic") return "Humic/Fulvic";

  const matchedSubCategory = products.find((product) => slugify(product.subCategory) === slug)?.subCategory;
  if (matchedSubCategory) return matchedSubCategory;

  const matchedCategory = products.find((product) => slugify(product.category) === slug)?.category;
  if (matchedCategory) {
    const categoryLabelMap: Record<string, string> = {
      DRONE: "Máy bay nông nghiệp",
      FERTILIZER: "Dinh dưỡng & Phân bón",
      HARDWARE: "Vật tư & Thiết bị",
      SOLAR: "Điện mặt trời",
    };

    return categoryLabelMap[matchedCategory] ?? matchedCategory;
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const slug = normalizeSlug(params.slug);
  const filteredProducts = getFilteredProducts(slug);
  const categoryName = toDisplayTitle(slug, filteredProducts.length ? filteredProducts : PRODUCTS_DATA);

  return {
    title: `Danh mục: ${categoryName} | Nhà Bè Agri`,
    description: `Khám phá danh mục ${categoryName} cùng các sản phẩm chính hãng tại Nhà Bè Agri.`,
    alternates: {
      canonical: `/danh-muc/${slug}`,
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const slug = normalizeSlug(params.slug);
  const filteredProducts = getFilteredProducts(slug);
  const categoryName = toDisplayTitle(slug, filteredProducts.length ? filteredProducts : PRODUCTS_DATA);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            Sản phẩm: {categoryName}
          </h1>
        </header>

        {filteredProducts.length > 0 ? (
          <section className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm">
            <Image
              src="/placeholder.svg"
              alt="Danh mục đang cập nhật"
              width={180}
              height={180}
              className="mb-5 opacity-80"
            />
            <p className="max-w-xl text-base text-gray-600 md:text-lg">
              Danh mục này đang được cập nhật sản phẩm. Vui lòng quay lại sau.
            </p>
            <Link
              href="/danh-muc/tat-ca"
              className="mt-6 inline-flex items-center rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              Quay lại Cửa hàng
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
