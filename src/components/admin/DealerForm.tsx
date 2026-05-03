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
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {isEdit ? "Chỉnh sửa Đại lý" : "Thêm Đại lý mới"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Cập nhật thông tin đại lý"
              : "Điền thông tin để thêm đại lý mới vào hệ thống"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Tên đại lý */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tên đại lý <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                placeholder="VD: Đại lý Nông Phát"
                className="pl-10"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Số điện thoại
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="VD: 0901234567"
                className="pl-10"
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Địa chỉ
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                placeholder="VD: 123 Nguyễn Trãi, P.5"
                className="pl-10"
                {...register("address")}
              />
            </div>
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* Tỉnh/Thành phố & Quận/Huyện */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province" className="text-sm font-medium">
                Tỉnh/Thành phố
              </Label>
              <Input
                id="province"
                placeholder="VD: TP.HCM"
                {...register("province")}
              />
              {errors.province && (
                <p className="text-xs text-red-500">{errors.province.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="district" className="text-sm font-medium">
                Quận/Huyện
              </Label>
              <Input
                id="district"
                placeholder="VD: Quận 1"
                {...register("district")}
              />
              {errors.district && (
                <p className="text-xs text-red-500">{errors.district.message}</p>
              )}
            </div>
          </div>

          {/* Tọa độ GPS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-sm font-medium">
                Vĩ độ (Latitude)
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="VD: 10.8231"
                {...register("latitude")}
              />
              {errors.latitude && (
                <p className="text-xs text-red-500">{errors.latitude.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-sm font-medium">
                Kinh độ (Longitude)
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="VD: 106.6297"
                {...register("longitude")}
              />
              {errors.longitude && (
                <p className="text-xs text-red-500">{errors.longitude.message}</p>
              )}
            </div>
          </div>

          {/* Trạng thái hoạt động (chỉ hiện khi edit) */}
          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
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
              />
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
