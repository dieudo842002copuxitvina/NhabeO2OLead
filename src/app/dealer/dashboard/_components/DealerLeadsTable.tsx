"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER LEADS TABLE - Client Component                                ║
 * ║  Interactive data table with BOM viewer modal                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Phone, 
  MapPin, 
  Sprout, 
  Calendar,
  Eye,
  ChevronRight,
  X,
  Loader2,
  Package,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateCalculatorLeadStatus } from "@/app/actions/lead";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface DealerLeadsWithBOM {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  province: string | null;
  district: string | null;
  crop_type: string | null;
  area_ha: number | null;
  calculator_data: any;
  status: string;
  created_at: Date;
}

interface BOMItem {
  item: string;
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  new: { label: "Mới", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Sprout },
  assigned: { label: "Đã phân", color: "bg-amber-100 text-amber-700 border-amber-200", icon: MapPin },
  contacted: { label: "Đã gọi", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Phone },
  won: { label: "Chốt Sale", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  lost: { label: "Mất Lead", color: "bg-slate-100 text-slate-600 border-slate-200", icon: X },
};

const CROP_EMOJI: Record<string, string> = {
  "Sầu riêng": "🌳",
  "Cà phê": "☕",
  "Bưởi": "🍊",
  "Hồ tiêu": "🌶️",
  "Thanh long": "🐉",
  "Bơ": "🥑",
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function DealerLeadsTable({ leads }: { leads: DealerLeadsWithBOM[] }) {
  const [selectedLead, setSelectedLead] = useState<DealerLeadsWithBOM | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center">
        <Sprout className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có khách hàng nào</h3>
        <p className="text-slate-500">
          Khách hàng tiềm năng sẽ xuất hiện ở đây khi có người tính toán dự toán tại khu vực của bạn.
        </p>
      </div>
    );
  }

  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    setUpdatingStatus(leadId);
    try {
      const result = await updateCalculatorLeadStatus(leadId, newStatus);
      if (result.success) {
        toast.success(`Đã cập nhật trạng thái thành "${STATUS_CONFIG[newStatus]?.label || newStatus}"`);
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        toast.error(result.error || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ngày
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Khách hàng
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Liên hệ
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Khu vực
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cây trồng
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Diện tích
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr 
                key={lead.id} 
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: vi })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">
                    {lead.customer_name || "Khách vãng lai"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a 
                    href={`tel:${lead.customer_phone}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    {lead.customer_phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {[
                      lead.district,
                      lead.province,
                    ].filter(Boolean).join(", ") || "Chưa rõ"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    <span className="mr-1">{CROP_EMOJI[lead.crop_type || ""] || "🌱"}</span>
                    {lead.crop_type || "N/A"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {lead.area_ha ? `${lead.area_ha.toFixed(2)} ha` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLead(lead)}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Xem BOM
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {leads.map((lead) => (
          <div key={lead.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: vi })}
              </div>
              <StatusBadge status={lead.status} />
            </div>
            <div className="font-medium text-slate-900">
              {lead.customer_name || "Khách vãng lai"}
            </div>
            <a 
              href={`tel:${lead.customer_phone}`}
              className="flex items-center gap-2 text-sm text-blue-600"
            >
              <Phone className="w-4 h-4" />
              {lead.customer_phone}
            </a>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>{[lead.district, lead.province].filter(Boolean).join(", ")}</span>
              <Badge variant="outline" className="bg-green-50">
                {CROP_EMOJI[lead.crop_type || ""] || "🌱"} {lead.crop_type}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLead(lead)}
              className="w-full gap-2"
            >
              <Eye className="w-4 h-4" />
              Xem dự toán BOM
            </Button>
          </div>
        ))}
      </div>

      {/* BOM Dialog */}
      <BOMDialog 
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusUpdate={handleStatusUpdate}
        isUpdating={updatingStatus === selectedLead?.id}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * STATUS BADGE COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const Icon = config.icon;
  
  return (
    <Badge className={`${config.color} border gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * BOM DIALOG COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

function BOMDialog({ 
  lead, 
  onClose, 
  onStatusUpdate,
  isUpdating 
}: { 
  lead: DealerLeadsWithBOM | null;
  onClose: () => void;
  onStatusUpdate: (leadId: string, status: string) => void;
  isUpdating: boolean;
}) {
  if (!lead) return null;

  const bomData = lead.calculator_data || {};
  const bomItems: BOMItem[] = bomData.bomItems || [];
  const totalCost: number = bomData.totalCost || 0;

  const formatVND = (n: number) => 
    new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "đ";

  return (
    <Dialog open={!!lead} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Dự toán vật tư BOM
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info Summary */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Khách hàng</p>
                  <p className="font-semibold">{lead.customer_name || "Khách vãng lai"}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Điện thoại</p>
                  <a href={`tel:${lead.customer_phone}`} className="font-semibold text-blue-600 hover:underline">
                    {lead.customer_phone}
                  </a>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Khu vực</p>
                  <p className="font-semibold">
                    {[lead.district, lead.province].filter(Boolean).join(", ") || "Chưa rõ"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Cây trồng</p>
                  <p className="font-semibold">
                    {CROP_EMOJI[lead.crop_type || ""]} {lead.crop_type || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Diện tích</p>
                  <p className="font-semibold">
                    {lead.area_ha ? `${lead.area_ha.toFixed(2)} ha` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Ngày tạo</p>
                  <p className="font-semibold">
                    {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BOM Items Table */}
          {bomItems.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Vật tư</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Số lượng</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Đơn giá</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bomItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm">{item.item}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {item.qty.toLocaleString("vi-VN")} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">{formatVND(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {formatVND(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                    <td colSpan={3} className="px-4 py-3 text-sm font-bold text-emerald-800">
                      TỔNG DỰ TOÁN
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-800 text-lg">
                      {formatVND(totalCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <Card className="border-dashed border-2 border-slate-300">
              <CardContent className="p-8 text-center text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>Chưa có dữ liệu dự toán chi tiết</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Thao tác nhanh</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${lead.customer_phone}`)}
                className="gap-2"
              >
                <Phone className="w-4 h-4" />
                Gọi ngay
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://zalo.me/${lead.customer_phone}`)}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Nhắn Zalo
              </Button>
              
              {/* Status Updates */}
              {lead.status !== "contacted" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusUpdate(lead.id, "contacted")}
                  disabled={isUpdating}
                  className="gap-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                  Đánh dấu đã gọi
                </Button>
              )}
              {lead.status !== "won" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onStatusUpdate(lead.id, "won")}
                  disabled={isUpdating}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Chốt Sale
                </Button>
              )}
              {lead.status !== "lost" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusUpdate(lead.id, "lost")}
                  disabled={isUpdating}
                  className="gap-2 text-slate-500"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Mất Lead
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
