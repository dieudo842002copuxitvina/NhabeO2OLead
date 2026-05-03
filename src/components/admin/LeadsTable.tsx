"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LEADS TABLE COMPONENT                                      ║
 * ║  Interactive table with search, filters, and assign actions        ║
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
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AssignLeadModal from "./AssignLeadModal";
import {
  Search,
  RefreshCw,
  AlertCircle,
  UserPlus,
  Phone,
  MapPin,
  Sprout,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import type { LeadNormalized, DealerBasic } from "@/types/lead";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface LeadsTableProps {
  initialLeads: LeadNormalized[];
  totalCount: number;
  activeDealers: DealerBasic[];
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Status Badge
 * ═══════════════════════════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "new":
      return (
        <Badge className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
          <Clock className="w-3 h-3" />
          Mới
        </Badge>
      );
    case "progress":
      return (
        <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
          <Clock className="w-3 h-3" />
          Đang xử lý
        </Badge>
      );
    case "won":
      return (
        <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Thành công
        </Badge>
      );
    case "lost":
      return (
        <Badge className="gap-1 bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200">
          <XCircle className="w-3 h-3" />
          Mất
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function LeadsTable({ initialLeads, totalCount, activeDealers }: LeadsTableProps) {
  const router = useRouter();

  // State
  const [leads, setLeads] = useState<LeadNormalized[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadNormalized | null>(null);

  /* ─────────────────────────────────────────────────────────────────────────
   * FILTER LEADS
   * ───────────────────────────────────────────────────────────────────────── */

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.customerName?.toLowerCase().includes(query) ||
      lead.customerPhone.toLowerCase().includes(query) ||
      lead.province?.toLowerCase().includes(query) ||
      lead.district?.toLowerCase().includes(query) ||
      lead.cropType?.toLowerCase().includes(query)
    );
  });

  /* ─────────────────────────────────────────────────────────────────────────
   * ACTIONS
   * ───────────────────────────────────────────────────────────────────────── */

  const handleAssign = (lead: LeadNormalized) => {
    setSelectedLead(lead);
    setAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    router.refresh();
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    router.refresh();
    setTimeout(() => setIsLoading(false), 500);
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * RENDER
   * ───────────────────────────────────────────────────────────────────────── */

  // Count stats
  const newCount = leads.filter((l) => l.status === "new").length;
  const assignedCount = leads.filter((l) => l.status === "progress").length;
  const wonCount = leads.filter((l) => l.status === "won").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng số</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lead mới</p>
                <p className="text-2xl font-bold text-blue-600">{newCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã phân bổ</p>
                <p className="text-2xl font-bold text-amber-600">{assignedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Thành công</p>
                <p className="text-2xl font-bold text-emerald-600">{wonCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold w-[25%]">Khách hàng</TableHead>
                <TableHead className="font-semibold">Liên hệ</TableHead>
                <TableHead className="font-semibold">Địa chỉ</TableHead>
                <TableHead className="font-semibold">Cây trồng</TableHead>
                <TableHead className="font-semibold text-center">Trạng thái</TableHead>
                <TableHead className="font-semibold">Đại lý phụ trách</TableHead>
                <TableHead className="font-semibold text-right w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm">
                        {searchQuery
                          ? "Không tìm thấy lead nào phù hợp"
                          : "Chưa có lead nào"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="group hover:bg-muted/20 transition-colors"
                  >
                    {/* Khách hàng */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm">
                          {(lead.customerName || lead.customerPhone).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">
                            {lead.customerName || "Khách hàng"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(lead.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Liên hệ */}
                    <TableCell>
                      {lead.customerPhone ? (
                        <a
                          href={`tel:${lead.customerPhone}`}
                          className="flex items-center gap-1.5 text-sm text-foreground hover:text-blue-600 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {lead.customerPhone}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Địa chỉ */}
                    <TableCell>
                      {lead.province || lead.district ? (
                        <div className="space-y-0.5">
                          <p className="text-sm text-foreground flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            {[lead.district, lead.province].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Cây trồng */}
                    <TableCell>
                      {lead.cropType ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                          {lead.cropType}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell className="text-center">
                      <StatusBadge status={lead.status} />
                    </TableCell>

                    {/* Đại lý phụ trách */}
                    <TableCell>
                      {lead.assignedDealer ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-700">
                              {lead.assignedDealer.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">
                              {lead.assignedDealer.name}
                            </p>
                            {lead.assignedDealer.province && (
                              <p className="text-xs text-muted-foreground">
                                {lead.assignedDealer.province}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Chưa phân bổ
                        </span>
                      )}
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="text-right">
                      {lead.status === "new" && !lead.assignedDealerId && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => handleAssign(lead)}
                                className="gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                                Phân bổ
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Phân bổ lead cho đại lý
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {lead.status === "progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                          Xem
                        </Button>
                      )}
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
              Hiển thị <strong>{filteredLeads.length}</strong> / {totalCount} leads
            </span>
            {searchQuery && filteredLeads.length > 0 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-auto p-0 text-xs text-blue-600"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Assign Modal */}
      <AssignLeadModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        leadId={selectedLead?.id || ""}
        customerName={selectedLead?.customerName || ""}
        customerPhone={selectedLead?.customerPhone || ""}
        customerProvince={selectedLead?.province}
        customerDistrict={selectedLead?.district}
        cropType={selectedLead?.cropType}
        dealers={activeDealers}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}
