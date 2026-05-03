"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER FORM COMPONENT                                             ║
 * ║  Create/Edit dealer form with validation                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, MapPin, Phone, Building2, X } from "lucide-react";
import { createDealer, updateDealer, type Dealer } from "@/app/actions/dealer";

/* ═══════════════════════════════════════════════════════════════════════════════
 * ZOD SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════════ */

const dealerFormSchema = z.object({
  name: z.string().min(1, "Tên đại lý không được để trống").max(255),
  phone: z.string().max(20).optional().default(""),
  address: z.string().max(500).optional().default(""),
  province: z.string().max(100).optional().default(""),
  district: z.string().max(100).optional().default(""),
  latitude: z.coerce.number().min(-90).max(90).optional().default(undefined),
  longitude: z.coerce.number().min(-180).max(180).optional().default(undefined),
  isActive: z.boolean().default(true),
});

type DealerFormValues = z.infer<typeof dealerFormSchema>;

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface DealerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  dealer?: Dealer | null;
  mode?: "create" | "edit";
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function DealerForm({
  open,
  onOpenChange,
  onSuccess,
  dealer,
  mode = "create",
}: DealerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEdit = mode === "edit" && dealer;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DealerFormValues>({
    resolver: zodResolver(dealerFormSchema),
    defaultValues: {
      name: dealer?.name || "",
      phone: dealer?.phone || "",
      address: dealer?.address || "",
      province: dealer?.province || "",
      district: dealer?.district || "",
      latitude: dealer?.latitude,
      longitude: dealer?.longitude,
      isActive: dealer?.isActive ?? true,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: DealerFormValues) => {
    setIsSubmitting(true);

    try {
      const input = {
        name: data.name,
        phone: data.phone || undefined,
        address: data.address || undefined,
        province: data.province || undefined,
        district: data.district || undefined,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      const result = isEdit
        ? await updateDealer(dealer.id, { ...input, isActive: data.isActive })
        : await createDealer(input);

      if (!result.success) {
        toast({
          title: "Lỗi",
          description: result.error || "Đã xảy ra lỗi không xác định",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Thành công",
        description: isEdit
          ? `Đã cập nhật đại lý "${data.name}"`
          : `Đã thêm đại lý "${data.name}"`,
      });

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header với gradient background */}
        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 px-6 py-6 text-white rounded-t-lg overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/20 translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                {isEdit ? (
                  <Building2 className="w-6 h-6" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white m-0">
                  {isEdit ? "Chỉnh sửa Đại lý" : "Thêm Đại lý mới"}
                </DialogTitle>
                <p className="text-sm text-emerald-100 mt-0.5">
                  {isEdit
                    ? "Cập nhật thông tin đại lý"
                    : "Điền thông tin để thêm đại lý mới vào hệ thống"}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          {/* Tên đại lý */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Tên đại lý <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="VD: Đại lý Nông Phát"
              className="h-11 border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              Số điện thoại
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="VD: 0901234567"
              className="h-11 border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.phone.message}
              </p>
            )}
          </div>

          {/* Tỉnh/Thành phố & Quận/Huyện */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Tỉnh/Thành phố
              </Label>
              <Input
                id="province"
                placeholder="VD: TP.HCM"
                className="h-11 border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20"
                {...register("province")}
              />
              {errors.province && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.province.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="district" className="text-sm font-medium">
                Quận/Huyện
              </Label>
              <Input
                id="district"
                placeholder="VD: Quận 1"
                className="h-11 border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20"
                {...register("district")}
              />
              {errors.district && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.district.message}
                </p>
              )}
            </div>
          </div>

          {/* Địa chỉ chi tiết */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Địa chỉ chi tiết
            </Label>
            <Input
              id="address"
              placeholder="VD: 123 Nguyễn Trãi, P.5"
              className="h-11 border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.address.message}
              </p>
            )}
          </div>

          {/* Tọa độ GPS */}
          <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-4 space-y-4 border border-border/40">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              Tọa độ GPS
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude" className="text-sm font-medium text-muted-foreground">
                  Vĩ độ (Latitude)
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="VD: 10.8231"
                  className="h-11 border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20 font-mono text-sm"
                  {...register("latitude")}
                />
                {errors.latitude && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.latitude.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude" className="text-sm font-medium text-muted-foreground">
                  Kinh độ (Longitude)
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="VD: 106.6297"
                  className="h-11 border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20 font-mono text-sm"
                  {...register("longitude")}
                />
                {errors.longitude && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.longitude.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Trạng thái hoạt động (chỉ hiện khi edit) */}
          {isEdit && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-gradient-to-r from-muted/30 to-muted/10 p-4 hover:border-emerald-200 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  Đại lý hoạt động
                </Label>
                <p className="text-xs text-muted-foreground">
                  Tắt nếu đại lý tạm ngừng kinh doanh
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue("isActive", checked)}
                className="data-[state=checked]:bg-emerald-500"
              />
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
              disabled={isSubmitting}
              className="h-11 px-6 gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEdit ? "Cập nhật" : "Thêm mới"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
