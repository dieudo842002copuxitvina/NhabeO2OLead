/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER PRODUCT SHOWCASE - Client Component                       ║
 * ║  Displays products from DealerInventory with 2 tabs:                 ║
 * ║  1. "Hàng có sẵn" — physically in stock at the dealer              ║
 * ║  2. "Sản phẩm đặt trước" — pre-order items (1-3 days)             ║
 * ║  Horizontal scroll on mobile, grid on desktop                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Truck,
  Star,
  ChevronRight,
  Tag,
  Info,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface ProductWithInventory {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image_url: string | null;
  base_price: number | null;
  brand: string | null;
  stock_quantity: number | null;
  is_active: boolean;
  in_stock: boolean;
  dealer_in_stock: boolean;
  category?: string | null;
}

interface DealerProductShowcaseProps {
  dealerId: string;
  dealerName: string;
  inStockProducts: ProductWithInventory[];
  preOrderProducts: ProductWithInventory[];
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TABS
 * ═══════════════════════════════════════════════════════════════════════════════ */

type Tab = "instock" | "preorder";

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function formatPrice(price: number | null): string {
  if (price === null || price === 0) return "Liên hệ báo giá";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function buildQuoteUrl(
  dealerId: string,
  sku: string,
  status: "instock" | "preorder"
): string {
  const params = new URLSearchParams({
    assigned_dealer: dealerId,
    product_interest: sku,
    inventory_status: status,
  });
  return `/tinh-toan?${params.toString()}`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCT CARD
 * ═══════════════════════════════════════════════════════════════════════════════ */

function ProductCard({
  product,
  dealerId,
  variant,
}: {
  product: ProductWithInventory;
  dealerId: string;
  variant: "instock" | "preorder";
}) {
  const [imageError, setImageError] = useState(false);
  const quoteUrl = buildQuoteUrl(dealerId, product.sku, variant);
  const isPreorder = variant === "preorder";

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100">
            <Package className="h-12 w-12 text-slate-300" />
            <span className="text-xs text-slate-400 font-medium">Chưa có ảnh</span>
          </div>
        )}

        {/* Stock / Pre-order Badge */}
        <div className="absolute top-2 left-2">
          {isPreorder ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              <Clock className="h-3 w-3" />
              Đặt trước
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
              <Zap className="h-3 w-3" />
              Có sẵn
            </span>
          )}
        </div>

        {/* SKU Badge */}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono font-medium text-white backdrop-blur-sm">
            <Tag className="h-2.5 w-2.5" />
            {product.sku}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        {product.brand && (
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">
            {product.brand}
          </span>
        )}

        <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug mb-2 flex-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <span className="text-[10px] text-slate-400">SKU:</span>
          <span className="text-[10px] font-mono text-slate-500">{product.sku}</span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] text-slate-400">Giá tham khảo</p>
              <p className={`text-sm font-bold ${product.base_price ? "text-emerald-700" : "text-amber-600"}`}>
                {formatPrice(product.base_price)}
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href={quoteUrl}
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${
              isPreorder
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isPreorder ? (
              <>
                <Truck className="h-3.5 w-3.5" />
                Nhận báo giá &amp; Đặt hàng
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Giữ hàng cho tôi
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCT GRID (reusable per tab)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function ProductGrid({
  products,
  dealerId,
  variant,
  emptyMessage,
}: {
  products: ProductWithInventory[];
  dealerId: string;
  variant: "instock" | "preorder";
  emptyMessage: string;
}) {
  if (products.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 scrollbar-hide">
      {products.map((product) => (
        <div key={product.id} className="flex-shrink-0 w-[260px] sm:w-auto">
          <ProductCard product={product} dealerId={dealerId} variant={variant} />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EMPTY STATE
 * ═══════════════════════════════════════════════════════════════════════════════ */

function EmptyState({ dealerName, variant }: { dealerName: string; variant: Tab }) {
  const isPreorder = variant === "preorder";
  const quoteUrl = buildQuoteUrl("__dealer__", "", variant).replace("assigned_dealer=__dealer__&", "");

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full mb-3 ${isPreorder ? "bg-amber-100" : "bg-emerald-100"}`}>
        {isPreorder ? (
          <Truck className="h-7 w-7 text-amber-500" />
        ) : (
          <Package className="h-7 w-7 text-emerald-500" />
        )}
      </div>
      <h3 className="text-sm font-semibold text-slate-700 mb-1">
        {isPreorder ? "Chưa có sản phẩm đặt trước" : "Chưa có hàng có sẵn"}
      </h3>
      <p className="text-xs text-slate-500 max-w-xs mb-3">
        {isPreorder
          ? `${dealerName} sẽ bổ sung thêm các sản phẩm đặt trước sớm nhất.`
          : `${dealerName} hiện chưa cập nhật danh mục hàng có sẵn.`}
      </p>
      <Link
        href={quoteUrl}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
      >
        Liên hệ nhận báo giá
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function DealerProductShowcase({
  dealerId,
  dealerName,
  inStockProducts,
  preOrderProducts,
}: DealerProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState<Tab>(
    inStockProducts.length > 0 ? "instock" : "preorder"
  );

  const totalProducts = inStockProducts.length + preOrderProducts.length;
  const currentProducts = activeTab === "instock" ? inStockProducts : preOrderProducts;
  const isPreorder = activeTab === "preorder";

  // Switch tab automatically if current tab becomes empty
  const handleTabChange = (tab: Tab) => {
    if (tab === "instock" && inStockProducts.length === 0) return;
    if (tab === "preorder" && preOrderProducts.length === 0) return;
    setActiveTab(tab);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Sản phẩm tại cửa hàng
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            tại <span className="font-medium text-emerald-700">{dealerName}</span>
          </p>
        </div>
        {totalProducts > 0 && (
          <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {totalProducts} sản phẩm
          </span>
        )}
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-3">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 leading-relaxed space-y-0.5">
          <p>
            <strong>Hàng có sẵn:</strong> Giao ngay hoặc giữ hàng tại cửa hàng.
          </p>
          <p>
            <strong>Đặt trước:</strong> Thời gian giao 1-3 ngày, báo giá trước khi đặt.
          </p>
        </div>
      </div>

      {/* Tabs */}
      {totalProducts > 0 && (
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {/* In-Stock Tab */}
          <button
            onClick={() => handleTabChange("instock")}
            disabled={inStockProducts.length === 0}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "instock"
                ? "bg-white text-emerald-700 shadow-sm"
                : inStockProducts.length === 0
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Zap className="h-4 w-4" />
            Hàng có sẵn
            {inStockProducts.length > 0 && (
              <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                activeTab === "instock" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
              }`}>
                {inStockProducts.length}
              </span>
            )}
          </button>

          {/* Pre-order Tab */}
          <button
            onClick={() => handleTabChange("preorder")}
            disabled={preOrderProducts.length === 0}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "preorder"
                ? "bg-white text-amber-700 shadow-sm"
                : preOrderProducts.length === 0
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="h-4 w-4" />
            Đặt trước
            {preOrderProducts.length > 0 && (
              <span className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                activeTab === "preorder" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"
              }`}>
                {preOrderProducts.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Products */}
      {totalProducts === 0 ? (
        <EmptyState dealerName={dealerName} variant={activeTab} />
      ) : (
        <>
          <ProductGrid
            products={currentProducts}
            dealerId={dealerId}
            variant={activeTab}
            emptyMessage={
              isPreorder
                ? "Không có sản phẩm đặt trước nào."
                : "Không có hàng có sẵn nào."
            }
          />

          {/* Mobile scroll hint */}
          {currentProducts.length > 3 && (
            <p className="sm:hidden text-center text-xs text-muted-foreground">
              ← Trượt để xem thêm →
            </p>
          )}
        </>
      )}
    </div>
  );
}
