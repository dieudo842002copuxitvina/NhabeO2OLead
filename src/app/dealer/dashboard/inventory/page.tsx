/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER INVENTORY MANAGEMENT PAGE                                  ║
 * ║  Allows dealers to manage their product inventory (in-stock vs pre-order)  ║
 * ║  Route: /dealer/dashboard/inventory                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sprout, Package, Save, Loader2 } from "lucide-react";
import { getServerClient } from "@/utils/supabase/server";
import { PrismaClient } from "@prisma/client";
import { getActiveProducts, getDealerInventory } from "@/lib/dealers";
import InventoryManager from "./_components/InventoryManager";

/* ═══════════════════════════════════════════════════════════════════════════════
 * METADATA
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "Quản lý tồn kho | Dealer Dashboard",
  description: "Cập nhật danh mục sản phẩm có sẵn và đặt trước tại cửa hàng",
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Get dealer info
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getDealerInfo(supabaseUserId: string) {
  try {
    const profile = await prisma.profile.findFirst({
      where: { id: supabaseUserId },
      select: { dealer_id: true },
    });

    if (!profile?.dealer_id) return null;

    return await prisma.dealer.findUnique({
      where: { id: profile.dealer_id },
      select: { id: true, name: true },
    });
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default async function InventoryPage() {
  // Auth check
  const supabase = await getServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Đăng nhập để tiếp tục</h2>
          <p className="text-slate-500 text-sm mb-4">Vui lòng đăng nhập để quản lý tồn kho.</p>
          <Link href="/login" className="text-emerald-600 hover:underline font-medium">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Get dealer
  const dealer = await getDealerInfo(user.id);

  if (!dealer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border shadow-sm p-6 max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Không tìm thấy đại lý</h2>
          <p className="text-slate-500 text-sm">Tài khoản của bạn chưa được liên kết với đại lý nào.</p>
        </div>
      </div>
    );
  }

  // Fetch data in parallel
  const [products, inventoryMap] = await Promise.all([
    getActiveProducts(),
    getDealerInventory(dealer.id),
  ]);

  // Build initial state: for each product, determine its in_stock status
  // Priority: DealerInventory > products.in_stock (fallback)
  const initialProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    image_url: product.image_url,
    brand: product.brand,
    base_price: product.base_price,
    category: product.categories?.name || null,
    // Use dealer's specific setting if exists, otherwise fallback to product's global setting
    in_stock:
      inventoryMap[product.id] !== undefined
        ? inventoryMap[product.id]
        : product.in_stock,
  }));

  const inStockCount = initialProducts.filter((p) => p.in_stock).length;
  const preOrderCount = initialProducts.filter((p) => !p.in_stock).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dealer/dashboard"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-900">Quản lý tồn kho</h1>
                  <p className="text-xs text-slate-500">{dealer.name}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600">
                  <strong className="text-slate-900">{inStockCount}</strong> có sẵn
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-slate-600">
                  <strong className="text-slate-900">{preOrderCount}</strong> đặt trước
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Cập nhật trạng thái:</strong> Nhấn 🟢 để đánh dấu{" "}
            <strong>Hàng có sẵn</strong> (giao ngay), nhấn 🟠 để đánh dấu{" "}
            <strong>Đặt trước</strong> (giao 1-3 ngày). Nhấn{" "}
            <strong>Lưu thay đổi</strong> khi hoàn tất.
          </p>
        </div>

        {/* Inventory Manager */}
        <InventoryManager
          dealerId={dealer.id}
          dealerName={dealer.name}
          initialProducts={initialProducts}
        />
      </main>
    </div>
  );
}
