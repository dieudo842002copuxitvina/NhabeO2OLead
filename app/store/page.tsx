"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { PRODUCTS_DATA, type Product, type ProductCategory } from "@/data/products";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS: Array<{ value: ProductCategory; label: string }> = [
  { value: "DRONE", label: "🚁 Máy bay Nông nghiệp" },
  { value: "FERTILIZER", label: "🧪 Dinh dưỡng & Phân bón" },
  { value: "HARDWARE", label: "💧 Vật tư & Thiết bị" },
];

export default function StorePage() {
  // Danh mục đang được chọn ở sidebar.
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("DRONE");

  // Danh sách sản phẩm hiển thị ở cột phải, tự động thay đổi theo danh mục.
  const filteredProducts = useMemo<Product[]>(
    () => PRODUCTS_DATA.filter((product) => product.category === activeCategory),
    [activeCategory],
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Cửa hàng Nông nghiệp</h1>
          <p className="mt-1 text-sm text-gray-500">
            Chọn danh mục để xem nhanh sản phẩm phù hợp cho nhu cầu canh tác.
          </p>
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
                  onClick={() => setActiveCategory(option.value)}
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
                Đang cập nhật sản phẩm cho danh mục này.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
