"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Save,
  Check,
  AlertCircle,
  Search,
  MoreHorizontal,
  Eye,
  X,
  ArrowLeft,
  Package,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import type {
  Product,
  ProductCategory,
} from "@/types/product";
import { DEFAULT_PRODUCT_CATEGORIES, MOCK_PRODUCTS, TECH_TYPE_OPTIONS, TECH_TYPE_LABELS } from "@/types/product";

/* ─────────────────────────────────────────────
 * Form Schema (Zod) - Must match Supabase schema exactly
 * ───────────────────────────────────────────── */

const productFormSchema = z.object({
  name: z.string().min(5, "Tên sản phẩm phải có ít nhất 5 ký tự").max(200, "Tên tối đa 200 ký tự"),
  slug: z
    .string()
    .min(3, "Slug phải có ít nhất 3 ký tự")
    .max(100, "Slug tối đa 100 ký tự")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug phải là chữ thường, không dấu"),
  sku: z.string().min(3, "SKU phải có ít nhất 3 ký tự").max(50, "SKU tối đa 50 ký tự"),
  description: z.string().optional(),
  price: z.number().min(0, "Giá phải lớn hơn 0"),
  unit: z.string().min(1, "Vui lòng nhập đơn vị"),
  // Danh mục (from product_categories table - UUID)
  category_id: z.string().min(1, "Vui lòng chọn danh mục"),
  // Loại Kỹ thuật O2O (enum from Supabase)
  tech_type: z.enum(TECH_TYPE_OPTIONS, {
    errorMap: () => ({ message: "Vui lòng chọn loại thiết bị kỹ thuật" }),
  }),
  attributes: z.object({
    flow_rate_lph: z.number().optional().nullable(),
    max_pressure_bar: z.number().optional().nullable(),
    inner_diameter_mm: z.number().optional().nullable(),
    power_hp: z.number().optional().nullable(),
  }),
  is_whitelist: z.boolean(),
  in_stock: z.boolean(),
  active: z.boolean(),
  stock: z.number().min(0, "Số lượng tồn kho không được âm"),
  image: z.string().optional().nullable(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

/* ─────────────────────────────────────────────
 * Supabase Upload Utility
 * ───────────────────────────────────────────── */

import { 
  uploadImageToSupabase, 
  getImageUrlWithCacheBust 
} from "@/lib/supabase/storage";

/**
 * Upload image to Supabase Storage
 * Returns public URL with cache-busting parameter
 */
async function uploadImageToSupabaseWithCacheBust(file: File, folder: string = "products"): Promise<string> {
  try {
    const publicUrl = await uploadImageToSupabase(file, folder);
    return getImageUrlWithCacheBust(publicUrl, true);
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
}

/* ─────────────────────────────────────────────
 * Image Upload Component
 * ───────────────────────────────────────────── */

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Lỗi định dạng", description: "Vui lòng chọn file hình ảnh (JPG, PNG, WebP)", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File quá lớn", description: "Kích thước file tối đa là 5MB", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      // Upload với cache-busting
      const publicUrl = await uploadImageToSupabaseWithCacheBust(file, "products");
      onChange(publicUrl);
      toast({ 
        title: "Upload thành công", 
        description: "Hình ảnh đã được tải lên Supabase Storage", 
        className: "bg-emerald-50 border-emerald-200 text-emerald-800" 
      });
    } catch (error) {
      toast({ 
        title: "Upload thất bại", 
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Ảnh đại diện</Label>
      {value ? (
        <div className="relative rounded-lg border overflow-hidden group">
          <div className="aspect-video w-full relative bg-slate-50">
            {/* Sử dụng cache-busting để hiển thị ảnh mới upload */}
            <Image 
              src={getImageUrlWithCacheBust(value, true)} 
              alt="Product preview" 
              fill 
              className="object-cover" 
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => document.getElementById("product-image-upload")?.click()}>
              <Pencil className="w-4 h-4 mr-1" /> Đổi ảnh
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onChange(null)}>
              <Trash2 className="w-4 h-4 mr-1" /> Xóa
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn("border-2 border-dashed rounded-lg p-6 text-center transition-colors", dragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300")}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); const file = e.dataTransfer.files?.[0]; if (file) handleUpload(file); }}
        >
          <input id="product-image-upload" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file); }} className="hidden" />
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Đang tải lên...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="text-sm text-slate-600">
                  Kéo thả hoặc <button type="button" onClick={() => document.getElementById("product-image-upload")?.click()} className="text-primary hover:underline">chọn file</button>
                </p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WebP • Tối đa 5MB</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Product Form Page Component
 * ───────────────────────────────────────────── */

interface ProductFormPageProps {
  product?: Product;
  categories: ProductCategory[];
  onSuccess: () => void;
  onCancel: () => void;
}

function ProductFormPage({ product, categories, onSuccess, onCancel }: ProductFormPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      sku: product?.sku ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      unit: product?.unit ?? "đ/cái",
      category_id: product?.category_id ?? "",
      tech_type: product?.tech_type ?? "Phụ Kiện",
      attributes: {
        flow_rate_lph: product?.attributes?.flow_rate_lph ?? undefined,
        max_pressure_bar: product?.attributes?.max_pressure_bar ?? undefined,
        inner_diameter_mm: product?.attributes?.inner_diameter_mm ?? undefined,
        power_hp: product?.attributes?.power_hp ?? undefined,
      },
      is_whitelist: product?.is_whitelist ?? true,
      in_stock: product?.in_stock ?? true,
      active: product?.active ?? true,
      stock: product?.stock ?? 0,
      image: product?.image ?? null,
    },
  });

  const watchedImage = watch("image");
  const watchedName = watch("name");
  const watchedTechType = watch("tech_type");
  const watchedCategoryId = watch("category_id");

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // Payload to send to Supabase - matches schema exactly
      const payload = {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        description: data.description || null,
        price: data.price,
        unit: data.unit,
        category_id: data.category_id,  // UUID from product_categories
        tech_type: data.tech_type,      // Enum value
        attributes: {
          flow_rate_lph: data.attributes.flow_rate_lph || null,
          max_pressure_bar: data.attributes.max_pressure_bar || null,
          inner_diameter_mm: data.attributes.inner_diameter_mm || null,
          power_hp: data.attributes.power_hp || null,
        },
        is_whitelist: data.is_whitelist,
        in_stock: data.in_stock,
        active: data.active,
        stock: data.stock,
        image: data.image || null,
      };
      
      console.log("Product payload for Supabase:", payload);
      
      // TODO: Replace with actual Supabase insert/update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSuccess();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = () => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  };

  const generateSku = () => {
    if (watchedName) {
      const techPrefix = watchedTechType?.toUpperCase().slice(0, 3) ?? "SKU";
      const nameInitials = watchedName
        .split(" ")
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? "")
        .join("");
      const sku = `${techPrefix}-${nameInitials}-${Date.now().toString(36).toUpperCase().slice(-3)}`;
      setValue("sku", sku);
    }
  };

  // Tech type field visibility - based on new Supabase enum values
  // Dynamic fields show/hide based on selected tech_type
  const showFlowRate = watchedTechType === "Béc Tưới";
  const showDiameter = watchedTechType === "Ống Chính" || watchedTechType === "Ống Nhánh";
  const showPower = watchedTechType === "Bơm Thủy Lực";
  const showPressure = true; // Always show pressure field

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Form Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {product ? `Đang chỉnh sửa: ${product.name}` : "Điền thông tin sản phẩm"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {product ? "Cập nhật" : "Tạo sản phẩm"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: General Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin chung</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="name">Tên thiết bị <span className="text-red-500">*</span></Label>
                      <Button type="button" variant="ghost" size="sm" onClick={generateSku} className="text-xs">
                        Tạo SKU tự động
                      </Button>
                    </div>
                    <Input
                      id="name"
                      placeholder="VD: Bộ Điều Khiển Tưới Smart 8 Zone"
                      {...register("name")}
                      className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name.message}</p>}
                  </div>

                  {/* SKU & Slug */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id="sku"
                          placeholder="VD: TU-SMART-8Z"
                          {...register("sku")}
                          className={cn(errors.sku && "border-red-500 focus-visible:ring-red-500")}
                        />
                      </div>
                      {errors.sku && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.sku.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="slug">Slug</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={generateSlug} className="text-xs h-7">
                          Tạo tự động
                        </Button>
                      </div>
                      <Input
                        id="slug"
                        placeholder="VD: bo-dieu-khien-tuoi-smart"
                        {...register("slug")}
                        className={cn(errors.slug && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {errors.slug && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.slug.message}</p>}
                    </div>
                  </div>

                  {/* Price & Unit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Giá bán <span className="text-red-500">*</span></Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="VD: 12500000"
                        {...register("price", { valueAsNumber: true })}
                        className={cn(errors.price && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {errors.price && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Đơn vị</Label>
                      <Input
                        id="unit"
                        placeholder="VD: đ/cái, đ/bộ"
                        {...register("unit")}
                        className={cn(errors.unit && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {errors.unit && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.unit.message}</p>}
                    </div>
                  </div>

                  {/* Category Select - from product_categories table */}
                  <div className="space-y-2">
                    <Label>Danh mục sản phẩm</Label>
                    <Controller
                      name="category_id"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={cn(errors.category_id && "border-red-500")}>
                            <SelectValue placeholder="Chọn danh mục..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category_id && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.category_id.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <textarea
                      id="description"
                      rows={3}
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      {...register("description")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Technical Specs Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông số kỹ thuật O2O</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tech Type Select - MUST match Supabase enum exactly */}
                  <div className="space-y-2">
                    <Label>Loại Thiết Bị Kỹ Thuật <span className="text-red-500">*</span></Label>
                    <Controller
                      name="tech_type"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={cn(errors.tech_type && "border-red-500")}>
                            <SelectValue placeholder="Chọn loại thiết bị kỹ thuật..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bơm Thủy Lực">Bơm Thủy Lực</SelectItem>
                            <SelectItem value="Ống Chính">Ống Chính</SelectItem>
                            <SelectItem value="Ống Nhánh">Ống Nhánh</SelectItem>
                            <SelectItem value="Béc Tưới">Béc Tưới</SelectItem>
                            <SelectItem value="Bộ Lọc Trung Tâm">Bộ Lọc Trung Tâm</SelectItem>
                            <SelectItem value="Phụ Kiện">Phụ Kiện</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.tech_type && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.tech_type.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Phân loại kỹ thuật cho máy tính BOM (O2O)
                    </p>
                  </div>

                  {/* Dynamic Technical Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Flow Rate - for Béc Tưới */}
                    {(watchedTechType === "Béc Tưới") && (
                      <div className="space-y-2">
                        <Label htmlFor="flow_rate_lph">Lưu lượng (L/h)</Label>
                        <Input
                          id="flow_rate_lph"
                          type="number"
                          placeholder="VD: 4"
                          {...register("attributes.flow_rate_lph", { valueAsNumber: true })}
                        />
                      </div>
                    )}

                    {/* Max Pressure - for all types */}
                    <div className="space-y-2">
                      <Label htmlFor="max_pressure_bar">Áp suất tối đa (bar)</Label>
                      <Input
                        id="max_pressure_bar"
                        type="number"
                        step="0.1"
                        placeholder="VD: 5.0"
                        {...register("attributes.max_pressure_bar", { valueAsNumber: true })}
                      />
                    </div>

                    {/* Inner Diameter - for Ống Chính, Ống Nhánh */}
                    {(watchedTechType === "Ống Chính" || watchedTechType === "Ống Nhánh") && (
                      <div className="space-y-2">
                        <Label htmlFor="inner_diameter_mm">Đường kính trong (mm)</Label>
                        <Input
                          id="inner_diameter_mm"
                          type="number"
                          placeholder="VD: 90"
                          {...register("attributes.inner_diameter_mm", { valueAsNumber: true })}
                        />
                      </div>
                    )}

                    {/* Power - for Bơm Thủy Lực */}
                    {(watchedTechType === "Bơm Thủy Lực") && (
                      <div className="space-y-2">
                        <Label htmlFor="power_hp">Công suất (HP)</Label>
                        <Input
                          id="power_hp"
                          type="number"
                          step="0.5"
                          placeholder="VD: 2"
                          {...register("attributes.power_hp", { valueAsNumber: true })}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Image & Status */}
            <div className="space-y-6">
              {/* Image Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hình ảnh</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload value={watchedImage ?? null} onChange={(url) => setValue("image", url)} />
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trạng thái</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stock */}
                  <div className="space-y-2">
                    <Label htmlFor="stock">Số lượng tồn kho</Label>
                    <Input
                      id="stock"
                      type="number"
                      {...register("stock", { valueAsNumber: true })}
                      className={cn(errors.stock && "border-red-500 focus-visible:ring-red-500")}
                    />
                    {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4 pt-2">
                    {/* In Stock Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-emerald-600" />
                        <div>
                          <Label htmlFor="in_stock" className="cursor-pointer font-medium">Còn hàng</Label>
                          <p className="text-xs text-muted-foreground">Sản phẩm sẵn sàng bán</p>
                        </div>
                      </div>
                      <Controller
                        name="in_stock"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="in_stock"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-emerald-600"
                          />
                        )}
                      />
                    </div>

                    {/* Whitelist Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <ToggleRight className="w-5 h-5 text-blue-600" />
                        <div>
                          <Label htmlFor="is_whitelist" className="cursor-pointer font-medium">BOM Calculator</Label>
                          <p className="text-xs text-muted-foreground">Cho phép đưa vào máy tính vật tư</p>
                        </div>
                      </div>
                      <Controller
                        name="is_whitelist"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="is_whitelist"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        )}
                      />
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Eye className={cn("w-5 h-5", watch("active") ? "text-emerald-600" : "text-slate-400")} />
                        <div>
                          <Label htmlFor="active" className="cursor-pointer font-medium">Hiển thị</Label>
                          <p className="text-xs text-muted-foreground">Sản phẩm hiển thị trên website</p>
                        </div>
                      </div>
                      <Controller
                        name="active"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            id="active"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Product Row Component
 * ───────────────────────────────────────────── */

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
  // Find category label from categories
  const categoryLabel = DEFAULT_PRODUCT_CATEGORIES.find(c => c.id === product.category_id)?.label || product.category_id;
  
  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex items-center gap-3">
          {product.image ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground line-clamp-1">{product.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {categoryLabel}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          {product.tech_type}
        </Badge>
      </TableCell>
      <TableCell className="font-bold text-emerald-600">
        {new Intl.NumberFormat("vi-VN").format(product.price)}đ
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge className={cn(product.in_stock ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
            {product.in_stock ? "Còn hàng" : "Hết hàng"}
          </Badge>
          {product.is_whitelist && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              BOM
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {product.stock} cái
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4 mr-2" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

/* ─────────────────────────────────────────────
 * Main Products Page Component
 * ───────────────────────────────────────────── */

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories] = useState<ProductCategory[]>(DEFAULT_PRODUCT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Full-screen form mode
  const [formMode, setFormMode] = useState<"list" | "create" | "edit">("list");
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | undefined>(undefined);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || product.tech_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [products, searchQuery, filterType]);

  // Handlers
  const handleCreateProduct = () => {
    setEditingProduct(undefined);
    setFormMode("create");
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormMode("edit");
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingProduct) {
      toast({
        title: "Đã xóa sản phẩm",
        description: `Sản phẩm "${deletingProduct.name}" đã được xóa.`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });
      setIsDeleteDialogOpen(false);
      setDeletingProduct(undefined);
    }
  };

  const handleFormSuccess = () => {
    setFormMode("list");
    setEditingProduct(undefined);
    toast({
      title: formMode === "edit" ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm mới",
      description: formMode === "edit" ? "Sản phẩm đã được cập nhật thành công." : "Sản phẩm mới đã được tạo.",
      className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    });
  };

  const handleFormCancel = () => {
    setFormMode("list");
    setEditingProduct(undefined);
  };

  // Render form mode
  if (formMode === "create" || formMode === "edit") {
    return (
      <ProductFormPage
        product={editingProduct}
        categories={categories}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  // Render list mode
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quản lý Sản phẩm</h2>
          <p className="text-sm text-muted-foreground">
            Thêm, chỉnh sửa và quản lý danh mục thiết bị nông nghiệp
          </p>
        </div>
        <Button onClick={handleCreateProduct} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Loại thiết bị..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {Object.entries(TECH_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[35%]">Sản phẩm</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">Không tìm thấy sản phẩm</p>
                        <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 flex items-center justify-center transition-opacity",
          isDeleteDialogOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsDeleteDialogOpen(false)}
      >
        <div
          className={cn(
            "bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 transition-transform",
            isDeleteDialogOpen ? "scale-100" : "scale-95"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Xác nhận xóa sản phẩm</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Bạn có chắc chắn muốn xóa sản phẩm "{deletingProduct?.name}"? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa sản phẩm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
