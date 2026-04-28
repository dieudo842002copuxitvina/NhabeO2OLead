import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Filter, SlidersHorizontal } from "lucide-react";
import { PRODUCTS_DATA } from "@/data/products";

type CategoryPageProps = {
  params: { slug: string };
  searchParams?: {
    price?: string;
    brand?: string;
    power?: string;
  };
};

const PAGE_BG = "#FDFBF7";
const PRIMARY = "#064E3B";
const SECONDARY = "#F59E0B";

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

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPowerTag(specs: Record<string, string>) {
  const values = Object.values(specs);
  for (const value of values) {
    if (/\b\d+(\.\d+)?\s?(kw|hp|w|l\/h)\b/i.test(value)) return value;
  }
  return "Tiêu chuẩn";
}

function getCategoryTitle(slug: string) {
  if (slug === "may-bay-nong-nghiep") return "Máy bay nông nghiệp";
  if (slug === "humic-fulvic") return "Humic/Fulvic";
  const bySub = PRODUCTS_DATA.find((p) => slugify(p.subCategory) === slug);
  if (bySub) return bySub.subCategory;
  const byCat = PRODUCTS_DATA.find((p) => slugify(p.category) === slug);
  if (byCat) {
    const map: Record<string, string> = {
      DRONE: "Máy bay nông nghiệp",
      FERTILIZER: "Dinh dưỡng & Phân bón",
      HARDWARE: "Thiết bị & Vật tư tưới",
      SOLAR: "Điện mặt trời",
    };
    return map[byCat.category] ?? byCat.category;
  }
  return "Danh mục sản phẩm";
}

function inCategory(slug: string) {
  if (slug === "may-bay-nong-nghiep") return PRODUCTS_DATA.filter((p) => p.category === "DRONE");
  if (slug === "humic-fulvic") return PRODUCTS_DATA.filter((p) => p.subCategory === "Humic/Fulvic");
  return PRODUCTS_DATA.filter((p) => slugify(p.subCategory) === slug || slugify(p.category) === slug);
}

function passesPrice(price: number, token?: string) {
  if (!token) return true;
  if (token === "under-1m") return price < 1_000_000;
  if (token === "1m-10m") return price >= 1_000_000 && price <= 10_000_000;
  if (token === "10m-50m") return price > 10_000_000 && price <= 50_000_000;
  if (token === "over-50m") return price > 50_000_000;
  return true;
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const slug = normalizeSlug(params.slug);
  const category = getCategoryTitle(slug);
  return {
    title: `Danh mục ${category} | Nhà Bè Agri`,
    description: `Danh sách sản phẩm ${category} tại Nhà Bè Agri. Lọc theo giá, thương hiệu và công suất nhanh chóng.`,
    alternates: { canonical: `/danh-muc/${slug}` },
  };
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const slug = normalizeSlug(params.slug);
  const title = getCategoryTitle(slug);
  const categoryProducts = inCategory(slug);

  const brand = searchParams?.brand;
  const price = searchParams?.price;
  const power = searchParams?.power;

  const brandOptions = Array.from(new Set(categoryProducts.map((p) => p.brand))).sort();
  const powerOptions = Array.from(new Set(categoryProducts.map((p) => getPowerTag(p.specs)))).sort();

  const filtered = categoryProducts.filter(
    (p) => passesPrice(p.price, price) && (!brand || p.brand === brand) && (!power || getPowerTag(p.specs) === power),
  );

  const makeFilterHref = (key: "price" | "brand" | "power", value: string) => {
    const query = new URLSearchParams();
    if (price) query.set("price", price);
    if (brand) query.set("brand", brand);
    if (power) query.set("power", power);
    if ((key === "price" && price === value) || (key === "brand" && brand === value) || (key === "power" && power === value)) {
      query.delete(key);
    } else {
      query.set(key, value);
    }
    const qs = query.toString();
    return qs ? `/danh-muc/${slug}?${qs}` : `/danh-muc/${slug}`;
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: PAGE_BG }}>
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
          <span className="font-medium text-gray-900">{title}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">Danh mục: {title}</h1>
          <p className="mt-2 text-sm text-gray-600">Tinh chỉnh nhanh theo giá, thương hiệu và công suất để tìm sản phẩm phù hợp.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <Filter className="h-4 w-4" />
                Bộ lọc sản phẩm
              </h2>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-800">Giá</p>
                  <div className="space-y-2 text-sm">
                    {[
                      ["under-1m", "Dưới 1 triệu"],
                      ["1m-10m", "1 - 10 triệu"],
                      ["10m-50m", "10 - 50 triệu"],
                      ["over-50m", "Trên 50 triệu"],
                    ].map(([value, label]) => (
                      <Link
                        key={value}
                        href={makeFilterHref("price", value)}
                        className={`block rounded-lg px-3 py-2 transition ${
                          price === value ? "bg-emerald-50 font-semibold text-emerald-900" : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-800">Thương hiệu</p>
                  <div className="space-y-2 text-sm">
                    {brandOptions.map((value) => (
                      <Link
                        key={value}
                        href={makeFilterHref("brand", value)}
                        className={`block rounded-lg px-3 py-2 transition ${
                          brand === value ? "bg-emerald-50 font-semibold text-emerald-900" : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {value}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-800">
                    <SlidersHorizontal className="h-4 w-4" />
                    Công suất
                  </p>
                  <div className="space-y-2 text-sm">
                    {powerOptions.map((value) => (
                      <Link
                        key={value}
                        href={makeFilterHref("power", value)}
                        className={`block rounded-lg px-3 py-2 transition ${
                          power === value ? "bg-emerald-50 font-semibold text-emerald-900" : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {value}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <section className="lg:col-span-9">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {filtered.map((product) => (
                  <article key={product.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                    <Link href={`/san-pham/${product.slug}`} className="block">
                      <div className="relative h-48 w-full bg-gray-100">
                        <Image src={product.images[0] ?? "/placeholder.svg"} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" />
                      </div>
                    </Link>
                    <div className="space-y-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: PRIMARY }}>
                        {product.brand}
                      </p>
                      <h3 className="line-clamp-2 min-h-[48px] text-sm font-bold text-gray-900">{product.name}</h3>
                      <p className="text-lg font-extrabold" style={{ color: PRIMARY }}>
                        {formatVnd(product.price)}
                      </p>
                      <Link
                        href={`/san-pham/${product.slug}`}
                        className="mt-1 inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white transition hover:opacity-95"
                        style={{ backgroundColor: PRIMARY }}
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <Image src="/placeholder.svg" alt="Không có sản phẩm" width={120} height={120} className="mx-auto opacity-70" />
                <p className="mt-4 text-gray-600">Không tìm thấy sản phẩm phù hợp bộ lọc hiện tại.</p>
                <Link href={`/danh-muc/${slug}`} className="mt-5 inline-flex rounded-xl px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: SECONDARY }}>
                  Xóa bộ lọc
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
