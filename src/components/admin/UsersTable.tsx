"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  USERS TABLE COMPONENT                                    ║
 * ║  Interactive table with user list and role management             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Card,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreVertical,
  RefreshCw,
  Loader2,
  AlertCircle,
  Shield,
  UserCog,
  User,
  Building2,
  Wrench,
  Eye,
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateUserRole, type UserWithRoles, type AppRole } from "@/app/actions/user";
import { useToast } from "@/components/ui/use-toast";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface UsersTableProps {
  initialUsers: UserWithRoles[];
  totalCount: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ROLE CONFIG
 * ═══════════════════════════════════════════════════════════════════════════════ */

const ROLE_CONFIG: Record<AppRole, { label: string; icon: typeof Shield; color: string }> = {
  admin: { label: "Quản trị viên", icon: Shield, color: "bg-red-100 text-red-700 hover:bg-red-100" },
  dealer: { label: "Đại lý", icon: Building2, color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  supplier: { label: "Nhà cung cấp", icon: Building2, color: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
  technician: { label: "Kỹ thuật viên", icon: Wrench, color: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  customer: { label: "Khách hàng", icon: User, color: "bg-slate-100 text-slate-700 hover:bg-slate-100" },
  bi_viewer: { label: "BI Viewer", icon: Eye, color: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  ai_editor: { label: "AI Editor", icon: Sparkles, color: "bg-pink-100 text-pink-700 hover:bg-pink-100" },
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function UsersTable({ initialUsers, totalCount }: UsersTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State
  const [users, setUsers] = useState<UserWithRoles[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  /* ─────────────────────────────────────────────────────────────────────────
   * FILTER USERS
   * ───────────────────────────────────────────────────────────────────────── */

  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.includes(query);
      if (!matchesSearch) return false;
    }

    // Role filter
    if (roleFilter !== "all") {
      if (!user.roles.includes(roleFilter)) return false;
    }

    return true;
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * ACTIONS
   * ───────────────────────────────────────────────────────────────────────── */

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setUpdatingUserId(userId);

    try {
      const result = await updateUserRole(userId, newRole);

      if (!result.success) {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể cập nhật vai trò",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Thành công",
        description: `Đã cập nhật vai trò người dùng`,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === userId) {
            return { ...user, roles: [newRole] };
          }
          return user;
        })
      );
    } catch (error) {
      console.error("Role update error:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật vai trò",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    router.refresh();
    setTimeout(() => setIsLoading(false), 500);
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * HELPERS
   * ───────────────────────────────────────────────────────────────────────── */

  const getRoleBadge = (role: AppRole) => {
    const config = ROLE_CONFIG[role];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} gap-1 font-medium`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * RENDER
   * ───────────────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tên, email, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value as AppRole | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className="w-4 h-4" />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Làm mới</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold w-[25%]">Người dùng</TableHead>
                <TableHead className="font-semibold w-[30%]">Email</TableHead>
                <TableHead className="font-semibold w-[20%]">Vai trò</TableHead>
                <TableHead className="font-semibold w-[15%]">Ngày tham gia</TableHead>
                <TableHead className="font-semibold text-right w-[10%]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm">
                        {searchQuery || roleFilter !== "all"
                          ? "Không tìm thấy người dùng nào phù hợp"
                          : "Chưa có người dùng nào"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group hover:bg-muted/20 transition-colors"
                  >
                    {/* User Info */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white font-bold text-sm">
                          {user.fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {user.fullName || "Chưa có tên"}
                          </p>
                          {user.phone && (
                            <p className="text-xs text-muted-foreground">
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      {user.email ? (
                        <a
                          href={`mailto:${user.email}`}
                          className="text-sm text-foreground hover:text-emerald-600 transition-colors max-w-[200px] block truncate"
                        >
                          {user.email}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.roles.length > 0 ? (
                          getRoleBadge(user.roles[0])
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                            <User className="w-3 h-3 mr-1" />
                            Không có vai trò
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={updatingUserId === user.id}
                          >
                            {updatingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            Thay đổi vai trò
                          </div>
                          {Object.entries(ROLE_CONFIG).map(([key, config]) => {
                            const isActive = user.roles.includes(key as AppRole);
                            const Icon = config.icon;
                            return (
                              <DropdownMenuItem
                                key={key}
                                onClick={() => handleRoleChange(user.id, key as AppRole)}
                                disabled={isActive || updatingUserId === user.id}
                                className={isActive ? "bg-muted/50" : ""}
                              >
                                <Icon className="mr-2 h-4 w-4" />
                                {config.label}
                                {isActive && (
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    (Hiện tại)
                                  </span>
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="border-t bg-muted/10 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Hiển thị <strong>{filteredUsers.length}</strong> / {totalCount} người dùng
            </span>
            {(searchQuery || roleFilter !== "all") && (
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                }}
                className="h-auto p-0 text-xs text-emerald-600"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
