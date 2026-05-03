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
import { Loader2, UserPlus, MapPin, Phone, X, CheckCircle2, AlertCircle } from "lucide-react";
import { assignLeadToDealer, type Lead } from "@/app/actions/lead";
import type { Dealer } from "@/app/actions/dealer";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface AssignLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  dealers: Dealer[];
  onSuccess?: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function AssignLeadModal({
  open,
  onOpenChange,
  lead,
  dealers,
  onSuccess,
}: AssignLeadModalProps) {
  const { toast } = useToast();
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes or lead changes
  useEffect(() => {
    if (!open) {
      setSelectedDealerId("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lead) {
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
      const result = await assignLeadToDealer(lead.id, selectedDealerId);

      if (!result.success) {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể phân bổ lead",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Thành công",
        description: `Đã phân bổ lead cho đại lý "${result.data?.assignedDealer?.name}"`,
        className: "bg-emerald-50 border-emerald-200",
      });

      setSelectedDealerId("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Assign lead error:", error);
      toast({
        title: "Lỗi",
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
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 px-6 py-6 text-white rounded-t-lg overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white m-0">
                  Phân bổ Lead
                </h2>
                <p className="text-sm text-blue-100 mt-0.5">
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
        {lead && (
          <div className="px-6 pt-4">
            <div className="bg-gradient-to-r from-muted/50 to-muted/20 rounded-xl p-4 border border-border/40">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Thông tin khách hàng</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">
                      {(lead.customerName || lead.customerPhone).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {lead.customerName || "Khách hàng"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {lead.customerPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {lead.province || "Chưa có địa chỉ"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lead.district || "—"}
                    </p>
                  </div>
                </div>
              </div>
              {lead.cropType && (
                <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Loại cây trồng:</span>
                  <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    {lead.cropType}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
          {/* Dealer Selection */}
          <div className="space-y-2">
            <Label htmlFor="dealer" className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              Chọn Đại lý phụ trách <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
              <SelectTrigger className="h-11 border-border/60 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="-- Chọn đại lý --" />
              </SelectTrigger>
              <SelectContent>
                {dealers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mx-auto mb-2" />
                    Chưa có đại lý nào hoạt động
                  </div>
                ) : (
                  dealers.map((dealer) => (
                    <SelectItem
                      key={dealer.id}
                      value={dealer.id}
                      className="py-3"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-emerald-700">
                            {dealer.name.charAt(0)}
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
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-800">
                    Đã chọn: {selectedDealer.name}
                  </p>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedDealer.province && `${selectedDealer.district ? selectedDealer.district + ", " : ""}${selectedDealer.province}`}
                    {selectedDealer.phone && (
                      <>
                        <span className="mx-1">·</span>
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
          <div className="flex items-center justify-end gap-3 pt-4 border-t bg-muted/20 -mx-6 px-6 pb-0 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-11 px-6"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedDealerId}
              className="h-11 px-6 gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25"
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
