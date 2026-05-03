/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER LIST PAGE - SERVER COMPONENT                             ║
 * ║  Fetches dealers data and renders the table                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { getDealers } from "@/app/actions/dealer";
import DealersTable from "@/components/admin/DealersTable";

export const metadata = {
  title: "Quản lý Đại lý | Admin",
  description: "Danh sách và quản lý đại lý ủy quyền",
};

export default async function DealersPage() {
  // Fetch dealers on server
  const { success, data: dealers, error, count } = await getDealers({
    limit: 100,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý Đại lý
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý danh sách đại lý ủy quyền và điểm bán hàng
        </p>
      </div>

      {/* Error State */}
      {!success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            <strong>Lỗi:</strong> {error || "Không thể tải danh sách đại lý"}
          </p>
        </div>
      )}

      {/* Dealers Table - Client Component */}
      <DealersTable
        initialDealers={dealers || []}
        totalCount={count || 0}
      />
    </div>
  );
}
