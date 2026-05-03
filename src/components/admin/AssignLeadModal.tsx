"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  ASSIGN LEAD MODAL COMPONENT                                ║
 * ║  Modal for assigning a lead to a dealer                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserPlus, MapPin, Phone, X, CheckCircle2, AlertCircle, Sprout } from "lucide-react";
import { assignLeadToDealer } from "@/app/actions/lead";
import type { DealerBasic } from "@/types/lead";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface AssignLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  customerName: string;
  customerPhone: string;
  customerProvince?: string | null;
  customerDistrict?: string | null;
  cropType?: string | null;
  dealers: DealerBasic[];
  onSuccess?: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function AssignLeadModal({
  open,
  onOpenChange,
  leadId,
  customerName,
  customerPhone,
  customerProvince,
  customerDistrict,
  cropType,
  dealers,
  onSuccess,
}: AssignLeadModalProps) {
  const { toast } = useToast();
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedDealerId("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin lead",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDealerId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn đại lý để phân bổ",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await assignLeadToDealer(leadId, selectedDealerId);

      if (!result.success) {
        toast({
          title: "Phân bổ thất bại",
          description: result.error || "Không thể phân bổ lead",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Phân bổ thành công",
        description: `Đã phân bổ lead cho đại lý "${result.data?.assignedDealer?.name}"`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });

      setSelectedDealerId("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Assign lead error:", error);
      toast({
        title: "Lỗi hệ thống",
        description: "Đã xảy ra lỗi khi phân bổ lead",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedDealerId("");
      onOpenChange(false);
    }
  };

  // Find selected dealer info
  const selectedDealer = dealers.find((d) => d.id === selectedDealerId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-xl border-0 shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 px-6 py-6 text-white rounded-t-2xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white m-0">
                  Phân bổ Lead
                </h2>
                <p className="text-sm text-emerald-100 mt-0.5">
                  Giao khách hàng cho đại lý phụ trách
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lead Info Card */}
        <div className="px-6 pt-5">
          <div className="bg-gradient-to-r from-slate-50 to-slate-50/50 rounded-xl p-4 border border-slate-200/60">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
                <Sprout className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">Thông tin khách hàng</p>
            </div>

            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30 flex-shrink-0">
                {(customerName || customerPhone).charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="font-semibold text-foreground">
                  {customerName || "Khách hàng"}
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {customerPhone}
                  </span>
                </div>
                {(customerProvince || customerDistrict) && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {[customerDistrict, customerProvince].filter(Boolean).join(", ")}
                  </div>
                )}
                {cropType && (
                  <div className="pt-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      <Sprout className="w-3 h-3" />
                      {cropType}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Dealer Selection */}
          <div className="space-y-2.5">
            <Label htmlFor="dealer" className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              Chọn Đại lý phụ trách <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
              <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-white">
                <SelectValue placeholder="-- Chọn đại lý --" />
              </SelectTrigger>
              <SelectContent>
                {dealers.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <AlertCircle className="w-5 h-5 mx-auto mb-2 text-amber-500" />
                    <p className="font-medium">Chưa có đại lý nào hoạt động</p>
                    <p className="text-xs mt-1">Vui lòng thêm đại lý trước</p>
                  </div>
                ) : (
                  dealers.map((dealer) => (
                    <SelectItem
                      key={dealer.id}
                      value={dealer.id}
                      className="py-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-emerald-700">
                            {dealer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{dealer.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {dealer.province || "Chưa có tỉnh/thành"}
                            {dealer.phone && (
                              <>
                                <span className="mx-1">·</span>
                                <Phone className="w-3 h-3" />
                                {dealer.phone}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Dealer Preview */}
          {selectedDealer && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-800">
                    Đã chọn: {selectedDealer.name}
                  </p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1 flex-wrap">
                    <MapPin className="w-3 h-3" />
                    {selectedDealer.province && `${selectedDealer.district ? selectedDealer.district + ", " : ""}${selectedDealer.province}`}
                    {selectedDealer.phone && (
                      <>
                        <span className="mx-1.5">·</span>
                        <Phone className="w-3 h-3" />
                        {selectedDealer.phone}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 -mx-6 px-6 pb-0 mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-11 px-6 border-slate-200 hover:bg-slate-50"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedDealerId}
              className="h-11 px-6 gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/30 text-white font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang phân bổ...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Phân bổ ngay
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
