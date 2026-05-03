/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  PRODUCTS PAGE - SERVER COMPONENT                                ║
 * ║  PIM - Product Information Management                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { Package, Plus, Search, ImageIcon, FileText } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { getProducts } from '@/app/actions/product';

/* ═══════════════════════════════════════════════════════════════════════════════
 * PAGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const metadata = {
  title: 'Quản lý Sản phẩm | AGRI-OS Admin',
  description: 'PIM - Quản lý thông tin vật tư nông nghiệp',
};

export default async function ProductsPage() {
  const result = await getProducts({ limit: 100 });
  const products = result.success ? result.data || [] : [];
  const categories = [...new Set(products.map((p) => p.categories.name))];

  return (
    <AdminShell
      title="Quản lý Sản phẩm"
      subtitle="PIM - Thông tin vật tư nông nghiệp & Thiết bị tưới"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SKU..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#256728] text-white text-sm font-semibold shadow-sm transition-colors">
            <Plus className="h-4 w-4" />
            Thêm mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-sm">
            <p className="text-xs font-medium opacity-80">Tổng sản phẩm</p>
            <p className="text-2xl font-bold mt-1">{products.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-sm">
            <p className="text-xs font-medium opacity-80">Đang hoạt động</p>
            <p className="text-2xl font-bold mt-1">{products.filter((p) => p.is_active).length}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-sm">
            <p className="text-xs font-medium opacity-80">Còn hàng</p>
            <p className="text-2xl font-bold mt-1">{products.filter((p) => p.in_stock).length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-sm">
            <p className="text-xs font-medium opacity-80">Danh mục</p>
            <p className="text-2xl font-bold mt-1">{categories.length}</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 w-20">
                    Ảnh
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    Mã SKU
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    Tên thiết bị
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    Danh mục
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    Giá
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Chưa có sản phẩm nào</p>
                      <p className="text-xs mt-1">Nhấn &quot;Thêm mới&quot; để bắt đầu</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Image */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg border border-border bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {product.sku}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                            {product.name}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {product.brand}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {product.pdf_url && (
                              <a
                                href={product.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <FileText className="h-3 w-3" />
                                PDF
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {product.categories.name}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        {product.base_price ? (
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                              maximumFractionDigits: 0,
                            }).format(product.base_price)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.is_active
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.in_stock
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {product.in_stock ? 'Còn hàng' : 'Hết hàng'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {products.length > 0 && (
            <div className="px-4 py-3 border-t border-border bg-slate-50 dark:bg-slate-800/30">
              <p className="text-xs text-muted-foreground">
                Hiển thị <span className="font-medium">{products.length}</span> sản phẩm
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
