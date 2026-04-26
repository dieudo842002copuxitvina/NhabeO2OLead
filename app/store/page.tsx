"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { PRODUCTS_DATA, type Product, type ProductCategory } from "@/data/products";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS: Array<{ value: ProductCategory; label: string }> = [
  { value: "DRONE", label: "🚁 Máy bay Nông nghiệp" },
  { value: "FERTILIZER", label: "🧪 Dinh dưỡng & Phân bón" },
  { value: "HARDWARE", label: "💧 Vật tư & Thiết bị" },
  { value: "SOLAR", label: "☀️ Điện mặt trời" },
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toSlug(value: string) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function inferCategoryFromSlug(slug: string | null): ProductCategory | null {
  if (!slug) return null;
  const normalized = normalizeText(slug);
  if (normalized.includes("dien-mat-troi")) return "SOLAR";
  if (normalized.includes("may-bay") || normalized.includes("drone")) return "DRONE";
  if (
    normalized.includes("humic") ||
    normalized.includes("fulvic") ||
    normalized.includes("phan-bon") ||
    normalized.includes("dinh-duong")
  ) {
    return "FERTILIZER";
  }
  if (normalized.includes("tuoi") || normalized.includes("ong") || normalized.includes("loc") || normalized.includes("bom")) {
    return "HARDWARE";
  }
  return null;
}

function inferSubCategoryFromSlug(slug: string | null): string | null {
  if (!slug) return null;
  const normalized = normalizeText(slug);
  if (normalized.includes("humic") || normalized.includes("fulvic")) return "Humic/Fulvic";
  if (normalized.includes("dien-mat-troi")) return "Điện mặt trời";
  return null;
}

function inferCategoryFromSubCategory(subCategory: string | null): ProductCategory | null {
  if (!subCategory) return null;
  const normalized = normalizeText(subCategory);
  if (normalized.includes("humic") || normalized.includes("fulvic")) return "FERTILIZER";
  if (normalized.includes("dien mat troi")) return "SOLAR";
  return null;
}

function matchSubCategory(productSubCategory: string, expected: string) {
  return (
    normalizeText(productSubCategory) === normalizeText(expected) ||
    toSlug(productSubCategory) === toSlug(expected)
  );
}

function StorePageContent() {
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category");
  const querySubCategory = searchParams.get("subCategory");
  const querySlug = searchParams.get("slug");

  const initialCategory = useMemo<ProductCategory>(() => {
    if (
      queryCategory === "DRONE" ||
      queryCategory === "FERTILIZER" ||
      queryCategory === "HARDWARE" ||
      queryCategory === "SOLAR"
    ) {
      return queryCategory;
    }
    const bySubCategory = inferCategoryFromSubCategory(querySubCategory);
    if (bySubCategory) return bySubCategory;
    return inferCategoryFromSlug(querySlug) ?? "DRONE";
  }, [queryCategory, querySlug, querySubCategory]);

  const inferredSubCategory = useMemo(() => {
    return querySubCategory ?? inferSubCategoryFromSlug(querySlug);
  }, [querySlug, querySubCategory]);

  const [activeCategory, setActiveCategory] = useState<ProductCategory>(initialCategory);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(inferredSubCategory);

  useEffect(() => {
    setActiveCategory(initialCategory);
    setActiveSubCategory(inferredSubCategory);
  }, [inferredSubCategory, initialCategory]);

  const filteredProducts = useMemo<Product[]>(() => {
    const byCategory = PRODUCTS_DATA.filter((product) => product.category === activeCategory);
    if (!activeSubCategory) return byCategory;
    return byCategory.filter((product) => matchSubCategory(product.subCategory, activeSubCategory));
  }, [activeCategory, activeSubCategory]);

  const currentFilterLabel = activeSubCategory
    ? `${activeCategory} • ${activeSubCategory}`
    : activeCategory;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Cửa hàng Nông nghiệp</h1>
          <p className="mt-1 text-sm text-gray-500">
            Chọn danh mục để xem nhanh sản phẩm phù hợp cho nhu cầu canh tác.
          </p>
          <p className="mt-2 text-xs font-medium text-gray-600">Bộ lọc hiện tại: {currentFilterLabel}</p>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full rounded-xl border border-gray-100 bg-white p-4 lg:w-[250px] lg:shrink-0">
            <h2 className="text-base font-bold text-gray-900">Danh mục sản phẩm</h2>

            <div className="mt-4 space-y-2" role="radiogroup" aria-label="Lọc theo danh mục">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={activeCategory === option.value}
                  onClick={() => {
                    setActiveCategory(option.value);
                    setActiveSubCategory(null);
                  }}
                  className={cn(
                    "flex w-full items-center rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all",
                    activeCategory === option.value
                      ? "border-[#4CAF50] bg-green-50 text-[#2e7d32]"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center text-sm text-gray-500">
                Chưa có sản phẩm khớp bộ lọc hiện tại. Hãy chọn danh mục khác.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function StorePageFallback() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-12 text-center text-sm text-gray-500">
          Đang tải danh sách sản phẩm...
        </div>
      </div>
    </main>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<StorePageFallback />}>
      <StorePageContent />
    </Suspense>
  );
}
