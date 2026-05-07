"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  INVENTORY MANAGER - Client Component                             ║
 * ║  Toggle in-stock / pre-order status per product with batch save         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { batchUpdateDealerInventory } from "@/lib/dealers";
import {
  Search,
  Zap,
  Clock,
  Save,
  Loader2,
  Package,
  X,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  image_url: string | null;
  brand: string | null;
  base_price: number | null;
  category: string | null;
  in_stock: boolean;
}

interface InventoryManagerProps {
  dealerId: string;
  dealerName: string;
  initialProducts: InventoryProduct[];
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCT ROW
 * ═══════════════════════════════════════════════════════════════════════════════ */

function ProductRow({
  product,
  currentStatus,
  onToggle,
}: {
  product: InventoryProduct;
  currentStatus: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
      {/* Image */}
      <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-6 w-6 text-slate-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {product.brand && (
          <span className="text-[10px] font-semibold text-emerald-600 uppercase">
            {product.brand}
          </span>
        )}
        <p className="text-sm font-medium text-slate-900 line-clamp-1 leading-snug">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono text-slate-400">{product.sku}</span>
          {product.base_price && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] font-medium text-slate-500">
                {formatPrice(product.base_price)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Category */}
      {product.category && (
        <div className="hidden md:flex items-center">
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
            {product.category}
          </span>
        </div>
      )}

      {/* Toggle Buttons */}
      <div className="flex gap-1 shrink-0">
        {/* In-stock button */}
        <button
          onClick={() => currentStatus !== true && onToggle(product.id)}
          title="Hàng có sẵn"
          className={`flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all ${
            currentStatus === true
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "bg-white border-slate-200 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50"
          }`}
        >
          <Zap className="h-4 w-4" />
        </button>

        {/* Pre-order button */}
        <button
          onClick={() => currentStatus !== false && onToggle(product.id)}
          title="Đặt trước"
          className={`flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all ${
            currentStatus === false
              ? "bg-amber-500 border-amber-500 text-white"
              : "bg-white border-slate-200 text-slate-400 hover:border-amber-300 hover:bg-amber-50"
          }`}
        >
          <Clock className="h-4 w-4" />
        </button>
      </div>

      {/* Status label */}
      <div className="hidden sm:flex flex-col items-center w-20 shrink-0">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
            currentStatus === true
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {currentStatus === true ? (
            <>
              <Zap className="h-3 w-3" /> Có sẵn
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" /> Đặt trước
            </>
          )}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function InventoryManager({
  dealerId,
  dealerName,
  initialProducts,
}: InventoryManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // State
  const [search, setSearch] = useState("");
  const [stockStatuses, setStockStatuses] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialProducts.map((p) => [p.id, p.in_stock]))
  );
  const [changedIds, setChangedIds] = useState<Set<string>>(new Set());

  // Derive which products are in-stock vs pre-order
  const inStockCount = Object.values(stockStatuses).filter(Boolean).length;
  const preOrderCount = Object.values(stockStatuses).filter((v) => !v).length;

  // Toggle a product's status
  const handleToggle = (productId: string) => {
    setStockStatuses((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
    setChangedIds((prev) => new Set(prev).add(productId));
  };

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return initialProducts;
    const q = search.toLowerCase();
    return initialProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [initialProducts, search]);

  // Save all changes
  const handleSave = () => {
    if (changedIds.size === 0) {
      toast({ description: "Không có thay đổi nào để lưu." });
      return;
    }

    startTransition(async () => {
      const updates = Array.from(changedIds).map((id) => ({
        productId: id,
        inStock: stockStatuses[id],
      }));

      const result = await batchUpdateDealerInventory(dealerId, updates);

      if (!result.success) {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể lưu thay đổi",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Thành công",
        description: `Đã lưu ${updates.length} thay đổi vào danh mục của ${dealerName}.`,
      });

      setChangedIds(new Set());
      router.refresh();
    });
  };

  // Clear search
  const handleClearSearch = () => setSearch("");

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, SKU, thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <strong className="text-emerald-700">{inStockCount}</strong> có sẵn
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <strong className="text-amber-700">{preOrderCount}</strong> đặt trước
          </span>
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={changedIds.size === 0 || isPending}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Lưu thay đổi {changedIds.size > 0 && `(${changedIds.size})`}
            </>
          )}
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center">
            <Zap className="h-2.5 w-2.5 text-white" />
          </span>
          🟢 Hàng có sẵn — Giao ngay / giữ tại cửa hàng
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded border-2 border-amber-500 bg-amber-500 flex items-center justify-center">
            <Clock className="h-2.5 w-2.5 text-white" />
          </span>
          🟠 Đặt trước — Giao trong 1-3 ngày
        </span>
      </div>

      {/* Product list */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Không tìm thấy sản phẩm</p>
              <p className="text-xs text-slate-400 mt-1">
                Thử thay đổi từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                currentStatus={stockStatuses[product.id]}
                onToggle={handleToggle}
              />
            ))
          )}
        </div>
      </Card>

      {/* Result summary */}
      {changedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm text-emerald-800">
            <strong>{changedIds.size}</strong> thay đổi đang chờ được lưu
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStockStatuses(
                Object.fromEntries(initialProducts.map((p) => [p.id, p.in_stock]))
              );
              setChangedIds(new Set());
            }}
            className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
          >
            Hủy bỏ
          </Button>
        </div>
      )}
    </div>
  );
}
