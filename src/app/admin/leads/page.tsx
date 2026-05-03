/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LEADS PAGE - SERVER COMPONENT                                  ║
 * ║  CRM - Quản lý Khách hàng Tiềm năng                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { getLeads } from "@/app/actions/lead";
import { getDealers } from "@/app/actions/dealer";
import LeadsTable from "@/components/admin/LeadsTable";

export const metadata = {
  title: "Quản lý Leads | Admin",
  description: "Quản lý và phân bổ khách hàng tiềm năng cho đại lý",
};

export default async function LeadsPage() {
  // Fetch leads and dealers on server
  const [leadsResult, dealersResult] = await Promise.all([
    getLeads({ limit: 100 }),
    getDealers({ isActive: true, limit: 100 }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý Leads
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý và phân bổ khách hàng tiềm năng cho đại lý ủy quyền
        </p>
      </div>

      {/* Error State */}
      {!leadsResult.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            <strong>Lỗi:</strong> {leadsResult.error || "Không thể tải danh sách leads"}
          </p>
        </div>
      )}

      {/* Leads Table - Client Component */}
      <LeadsTable
        initialLeads={leadsResult.data || []}
        totalCount={leadsResult.count || 0}
        activeDealers={dealersResult.data || []}
      />
    </div>
  );
}
