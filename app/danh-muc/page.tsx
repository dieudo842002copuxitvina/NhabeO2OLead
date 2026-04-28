"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Filter, SearchX } from "lucide-react";
import { PRODUCTS_DATA } from "@/data/products";
import ProductCard from "../store/ProductCard";

type SortMode = "newest" | "price-asc" | "price-desc";
type PriceRange = "under-1m" | "1m-5m" | "over-5m";

const PRICE_FILTERS: Array<{ key: PriceRange; label: string }> = [
  { key: "under-1m", label: "Dưới 1 triệu" },
  { key: "1m-5m", label: "1-5 triệu" },
  { key: "over-5m", label: "Trên 5 triệu" },
];

function SidebarFilter({
  categories,
  brands,
  activeCategory,
  activeBrands,
  activePriceRanges,
  onCategoryChange,
  onToggleBrand,
  onTogglePriceRange,
  onClearFilters,
}: {
  categories: string[];
  brands: string[];
  activeCategory: string;
  activeBrands: string[];
  activePriceRanges: PriceRange[];
  onCategoryChange: (value: string) => void;
  onToggleBrand: (value: string) => void;
  onTogglePriceRange: (value: PriceRange) => void;
  onClearFilters: () => void;
}) {
  return (
    <div className="sticky top-24 rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Bộ lọc</h2>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-medium text-red-500 hover:text-red-600"
        >
          Xóa bộ lọc
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Danh mục sản phẩm</h3>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onCategoryChange("all")}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                activeCategory === "all"
                  ? "bg-green-50 font-semibold text-green-700"
                  : "text-gray-700 hover:text-green-700"
              }`}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(category)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  activeCategory === category
                    ? "bg-green-50 font-semibold text-green-700"
                    : "text-gray-700 hover:text-green-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Thương hiệu</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={activeBrands.includes(brand)}
                  onChange={() => onToggleBrand(brand)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Khoảng giá</h3>
          <div className="space-y-2">
            {PRICE_FILTERS.map((range) => (
              <label key={range.key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={activePriceRanges.includes(range.key)}
                  onChange={() => onTogglePriceRange(range.key)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProductGrid({ products, onClearFilters }: { products: typeof PRODUCTS_DATA; onClearFilters: () => void }) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <SearchX className="h-7 w-7" />
        </div>
        <p className="text-base text-gray-600">Không tìm thấy thiết bị phù hợp với bộ lọc.</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-5 inline-flex items-center rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
        >
          Xóa bộ lọc
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function DanhMucTongPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [activePriceRanges, setActivePriceRanges] = useState<PriceRange[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = useMemo(() => Array.from(new Set(PRODUCTS_DATA.map((item) => item.subCategory))), []);
  const brands = useMemo(() => Array.from(new Set(PRODUCTS_DATA.map((item) => item.brand))).sort(), []);

  const filteredProducts = useMemo(() => {
    const byCategory = PRODUCTS_DATA.filter((product) =>
      activeCategory === "all" ? true : product.subCategory === activeCategory || product.category === activeCategory,
    );

    const byBrand = byCategory.filter((product) =>
      activeBrands.length ? activeBrands.includes(product.brand) : true,
    );

    const byPrice = byBrand.filter((product) => {
      if (!activePriceRanges.length) return true;
      return activePriceRanges.some((range) => {
        if (range === "under-1m") return product.price < 1_000_000;
        if (range === "1m-5m") return product.price >= 1_000_000 && product.price <= 5_000_000;
        return product.price > 5_000_000;
      });
    });

    const sorted = [...byPrice];
    if (sortMode === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sortMode === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sortMode === "newest") sorted.sort((a, b) => b.id.localeCompare(a.id));
    return sorted;
  }, [activeCategory, activeBrands, activePriceRanges, sortMode]);

  const clearFilters = () => {
    setActiveCategory("all");
    setActiveBrands([]);
    setActivePriceRanges([]);
  };

  const toggleBrand = (brand: string) => {
    setActiveBrands((prev) => (prev.includes(brand) ? prev.filter((item) => item !== brand) : [...prev, brand]));
  };

  const togglePriceRange = (range: PriceRange) => {
    setActivePriceRanges((prev) => (prev.includes(range) ? prev.filter((item) => item !== range) : [...prev, range]));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-900">Tất cả vật tư & thiết bị</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">Tổng kho Vật tư Nông nghiệp</h1>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-green-600"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao xuống thấp</option>
          </select>
        </div>

        <div className="mt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm"
          >
            <Filter className="h-4 w-4 text-green-600" />
            {showMobileFilters ? "Ẩn bộ lọc" : "Lọc sản phẩm"}
          </button>
          {showMobileFilters && (
            <div className="mt-4">
              <SidebarFilter
                categories={categories}
                brands={brands}
                activeCategory={activeCategory}
                activeBrands={activeBrands}
                activePriceRanges={activePriceRanges}
                onCategoryChange={setActiveCategory}
                onToggleBrand={toggleBrand}
                onTogglePriceRange={togglePriceRange}
                onClearFilters={clearFilters}
              />
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="hidden lg:block lg:col-span-3">
            <SidebarFilter
              categories={categories}
              brands={brands}
              activeCategory={activeCategory}
              activeBrands={activeBrands}
              activePriceRanges={activePriceRanges}
              onCategoryChange={setActiveCategory}
              onToggleBrand={toggleBrand}
              onTogglePriceRange={togglePriceRange}
              onClearFilters={clearFilters}
            />
          </aside>

          <section className="lg:col-span-9">
            <div className="mb-4 text-sm text-gray-500">
              Tìm thấy <span className="font-semibold text-gray-900">{filteredProducts.length}</span> sản phẩm
            </div>
            <ProductGrid products={filteredProducts} onClearFilters={clearFilters} />
          </section>
        </div>
      </div>
    </main>
  );
}
