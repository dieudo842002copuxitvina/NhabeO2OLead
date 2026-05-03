"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALERS TABLE COMPONENT                                    ║
 * ║  Interactive table with search, filters, and CRUD actions        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useCallback } from "react";
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
  CardContent,
} from "@/components/ui/card";
import DealerForm from "./DealerForm";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Building2,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteDealer, type Dealer } from "@/app/actions/dealer";
import { useToast } from "@/components/ui/use-toast";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface DealersTableProps {
  initialDealers: Dealer[];
  totalCount: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function DealersTable({ initialDealers, totalCount }: DealersTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [dealers, setDealers] = useState<Dealer[]>(initialDealers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  /* ─────────────────────────────────────────────────────────────────────────
   * FILTER DEALERS
   * ───────────────────────────────────────────────────────────────────────── */
  
  const filteredDealers = dealers.filter((dealer) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      dealer.name.toLowerCase().includes(query) ||
      dealer.phone?.toLowerCase().includes(query) ||
      dealer.province?.toLowerCase().includes(query) ||
      dealer.district?.toLowerCase().includes(query) ||
      dealer.address?.toLowerCase().includes(query)
    );
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * ACTIONS
   * ───────────────────────────────────────────────────────────────────────── */

  const handleAddNew = () => {
    setSelectedDealer(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const handleEdit = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleDelete = async (dealer: Dealer) => {
    if (!confirm(`Bạn có chắc muốn xóa đại lý "${dealer.name}"?\n\nHành động này không thể hoàn tác.`)) {
      return;
    }

    setIsDeleting(dealer.id);

    try {
      const result = await deleteDealer(dealer.id);

      if (!result.success) {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể xóa đại lý",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Đã xóa",
        description: `Đã xóa đại lý "${dealer.name}"`,
      });

      // Refresh the list
      router.refresh();
      setDealers((prev) => prev.filter((d) => d.id !== dealer.id));
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa đại lý",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFormSuccess = () => {
    router.refresh();
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    router.refresh();
    // Re-fetch would happen via server component re-render
    setTimeout(() => setIsLoading(false), 500);
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
            placeholder="Tìm kiếm tên, SĐT, địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
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

          <Button
            onClick={handleAddNew}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm Đại lý mới</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold w-[35%]">Tên đại lý</TableHead>
                <TableHead className="font-semibold">Liên hệ</TableHead>
                <TableHead className="font-semibold">Địa chỉ</TableHead>
                <TableHead className="font-semibold text-center">Trạng thái</TableHead>
                <TableHead className="font-semibold text-right w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDealers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm">
                        {searchQuery
                          ? "Không tìm thấy đại lý nào phù hợp"
                          : "Chưa có đại lý nào"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="link"
                          onClick={handleAddNew}
                          className="text-emerald-600"
                        >
                          Thêm đại lý đầu tiên
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDealers.map((dealer) => (
                  <TableRow
                    key={dealer.id}
                    className="group hover:bg-muted/20 transition-colors"
                  >
                    {/* Tên đại lý */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm">
                          {dealer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {dealer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {dealer.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Liên hệ */}
                    <TableCell>
                      <div className="space-y-1">
                        {dealer.phone ? (
                          <a
                            href={`tel:${dealer.phone}`}
                            className="flex items-center gap-1.5 text-sm text-foreground hover:text-emerald-600 transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {dealer.phone}
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Địa chỉ */}
                    <TableCell>
                      {dealer.province || dealer.district || dealer.address ? (
                        <div className="space-y-0.5">
                          <p className="text-sm text-foreground line-clamp-1">
                            {dealer.address && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                {dealer.address}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[dealer.district, dealer.province].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="text-center">
                      <Badge
                        variant={dealer.isActive ? "default" : "secondary"}
                        className={
                          dealer.isActive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                        }
                      >
                        {dealer.isActive ? "Hoạt động" : "Ngừng"}
                      </Badge>
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleEdit(dealer)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(dealer)}
                            disabled={isDeleting === dealer.id}
                            className="text-red-600 focus:text-red-600"
                          >
                            {isDeleting === dealer.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Xóa
                          </DropdownMenuItem>
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
              Hiển thị <strong>{filteredDealers.length}</strong> / {totalCount} đại lý
            </span>
            {searchQuery && filteredDealers.length > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-auto p-0 text-xs text-emerald-600"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Form Modal */}
      <DealerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={handleFormSuccess}
        dealer={selectedDealer}
        mode={formMode}
      />
    </div>
  );
}
