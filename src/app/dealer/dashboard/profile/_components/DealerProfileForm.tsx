"use client";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER PROFILE FORM - Client Component                             ║
 * ║  Form for editing dealer public profile information                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  MessageCircle,
  Clock,
  Image,
  Search,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { updateDealerProfile, type DealerProfileData } from "@/app/actions/dealer";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface DealerProfileFormProps {
  profile: DealerProfileData;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const OPENING_HOURS_PRESETS = [
  "07:00 - 17:00",
  "07:00 - 18:00",
  "07:30 - 17:30",
  "08:00 - 17:00",
  "08:00 - 18:00",
  "08:00 - 17:30",
];

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default function DealerProfileForm({ profile }: DealerProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [zalo_number, setZaloNumber] = useState(profile.zalo_number || "");
  const [about_us, setAboutUs] = useState(profile.about_us || "");
  const [opening_hours, setOpeningHours] = useState(profile.opening_hours || "");
  const [cover_image, setCoverImage] = useState(profile.cover_image || "");
  const [slug, setSlug] = useState(profile.slug || "");
  const [meta_title, setMetaTitle] = useState(profile.meta_title || "");
  const [meta_description, setMetaDescription] = useState(profile.meta_description || "");
  const [localError, setLocalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Public URL
  const publicUrl = `/dai-ly/${profile.slug || profile.id}`;
  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${publicUrl}`
    : publicUrl;

  // Copy URL to clipboard
  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast({ description: "Đã copy URL!" });
    setTimeout(() => setCopied(false), 2000);
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * SUBMIT HANDLER
   * ───────────────────────────────────────────────────────────────────────── */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setFieldErrors({});

    const formData = new FormData();
    formData.append("zalo_number", zalo_number);
    formData.append("about_us", about_us);
    formData.append("opening_hours", opening_hours);
    formData.append("cover_image", cover_image);
    formData.append("slug", slug);
    formData.append("meta_title", meta_title);
    formData.append("meta_description", meta_description);

    startTransition(async () => {
      const result = await updateDealerProfile(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        if (result.error) {
          setLocalError(result.error);
        }
        toast({
          title: "Lỗi",
          description: result.error || "Không thể cập nhật thông tin",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Thành công",
        description: "Thông tin cửa hàng đã được cập nhật",
      });

      router.refresh();
    });
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * RENDER
   * ───────────────────────────────────────────────────────────────────────── */

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {localError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>{localError}</AlertDescription>
        </Alert>
      )}

      {/* Public URL Preview */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-emerald-700 mb-1">Trang công khai của bạn</p>
              <p className="text-sm font-mono text-emerald-800 truncate">{fullUrl}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyUrl}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-blue-600" />
            Liên hệ & Giờ mở cửa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zalo Number */}
          <div className="space-y-2">
            <label htmlFor="zalo_number" className="text-sm font-medium">
              Số Zalo
            </label>
            <Input
              id="zalo_number"
              type="tel"
              placeholder="VD: 0909123456"
              value={zalo_number}
              onChange={(e) => setZaloNumber(e.target.value)}
              disabled={isPending}
              className={fieldErrors.zalo_number ? "border-red-500" : ""}
            />
            {fieldErrors.zalo_number && (
              <p className="text-xs text-red-500">{fieldErrors.zalo_number}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Số điện thoại Zalo để khách hàng liên hệ nhanh qua Zalo
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-2">
            <label htmlFor="opening_hours" className="text-sm font-medium">
              Giờ mở cửa
            </label>
            <Input
              id="opening_hours"
              placeholder="VD: 07:00 - 17:30"
              value={opening_hours}
              onChange={(e) => setOpeningHours(e.target.value)}
              disabled={isPending}
              className={fieldErrors.opening_hours ? "border-red-500" : ""}
            />
            <div className="flex flex-wrap gap-1.5">
              {OPENING_HOURS_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setOpeningHours(preset)}
                  className="text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Us Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Image className="h-4 w-4 text-purple-600" />
            Giới thiệu & Hình ảnh
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cover Image */}
          <div className="space-y-2">
            <label htmlFor="cover_image" className="text-sm font-medium">
              Ảnh bìa
            </label>
            <Input
              id="cover_image"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={cover_image}
              onChange={(e) => setCoverImage(e.target.value)}
              disabled={isPending}
              className={fieldErrors.cover_image ? "border-red-500" : ""}
            />
            {fieldErrors.cover_image && (
              <p className="text-xs text-red-500">{fieldErrors.cover_image}</p>
            )}
            {cover_image && (
              <div className="mt-2 rounded-lg overflow-hidden border h-32 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover_image}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* About Us */}
          <div className="space-y-2">
            <label htmlFor="about_us" className="text-sm font-medium">
              Giới thiệu về cửa hàng
            </label>
            <Textarea
              id="about_us"
              placeholder="Viết giới thiệu ngắn về cửa hàng, thế mạnh, kinh nghiệm..."
              value={about_us}
              onChange={(e) => setAboutUs(e.target.value)}
              disabled={isPending}
              rows={5}
              className={`resize-none ${fieldErrors.about_us ? "border-red-500" : ""}`}
            />
            {fieldErrors.about_us && (
              <p className="text-xs text-red-500">{fieldErrors.about_us}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {about_us.length}/2000 ký tự. Viết ngắn gọn, súc tích về điểm mạnh của bạn.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-amber-600" />
            SEO & URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Slug */}
          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium">
              URL thân thiện (Slug)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                /dai-ly/
              </span>
              <Input
                id="slug"
                placeholder="dai-ly-minh-phuong-daklak"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                disabled={isPending}
                className={`flex-1 ${fieldErrors.slug ? "border-red-500" : ""}`}
              />
            </div>
            {fieldErrors.slug && (
              <p className="text-xs text-red-500">{fieldErrors.slug}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Chỉ chứa chữ thường, số và dấu gạch ngang. VD: <code>dai-ly-ten-cua-ban-tinh</code>
            </p>
          </div>

          {/* Meta Title */}
          <div className="space-y-2">
            <label htmlFor="meta_title" className="text-sm font-medium">
              Meta Title (SEO)
            </label>
            <Input
              id="meta_title"
              placeholder="VD: Đại lý Minh Phương | Nhà Bè Agri Đắk Lắk"
              value={meta_title}
              onChange={(e) => setMetaTitle(e.target.value)}
              disabled={isPending}
              maxLength={70}
              className={fieldErrors.meta_title ? "border-red-500" : ""}
            />
            {fieldErrors.meta_title && (
              <p className="text-xs text-red-500">{fieldErrors.meta_title}</p>
            )}
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Tiêu đề hiển thị trên Google</span>
              <span className={meta_title.length > 60 ? "text-amber-500" : ""}>
                {meta_title.length}/70
              </span>
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <label htmlFor="meta_description" className="text-sm font-medium">
              Meta Description (SEO)
            </label>
            <Textarea
              id="meta_description"
              placeholder="VD: Đại lý Nhà Bè Agri tại Đắk Lắk. Chuyên cung cấp vật tư tưới tiêu, dự toán BOM..."
              value={meta_description}
              onChange={(e) => setMetaDescription(e.target.value)}
              disabled={isPending}
              rows={3}
              maxLength={160}
              className={`resize-none ${fieldErrors.meta_description ? "border-red-500" : ""}`}
            />
            {fieldErrors.meta_description && (
              <p className="text-xs text-red-500">{fieldErrors.meta_description}</p>
            )}
            <p className="text-xs text-muted-foreground flex justify-between">
              <span>Mô tả ngắn hiển thị dưới tiêu đề trên Google</span>
              <span className={meta_description.length > 150 ? "text-amber-500" : ""}>
                {meta_description.length}/160
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
