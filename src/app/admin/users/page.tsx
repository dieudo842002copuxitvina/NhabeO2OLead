/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  USERS MANAGEMENT PAGE - SERVER COMPONENT                        ║
 * ║  Fetches users data and renders the table                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { getUsers } from "@/app/actions/user";
import UsersTable from "@/components/admin/UsersTable";
import { Users, Shield, Building2, User } from "lucide-react";

export const metadata = {
  title: "Quản lý Người dùng | Admin",
  description: "Quản lý danh sách người dùng và phân quyền",
};

export default async function UsersPage() {
  // Fetch users on server
  const { success, data: users, error, count } = await getUsers({
    limit: 100,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý Người dùng
        </h1>
        <p className="text-sm text-muted-foreground">
          Quản lý tài khoản và phân quyền người dùng trong hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{count || 0}</p>
              <p className="text-xs text-muted-foreground">Tổng người dùng</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users?.filter(u => u.roles.includes("admin")).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Quản trị viên</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users?.filter(u => u.roles.includes("dealer")).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Đại lý</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {users?.filter(u => u.roles.includes("customer")).length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Khách hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {!success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            <strong>Lỗi:</strong> {error || "Không thể tải danh sách người dùng"}
          </p>
        </div>
      )}

      {/* Users Table - Client Component */}
      <UsersTable
        initialUsers={users || []}
        totalCount={count || 0}
      />
    </div>
  );
}
