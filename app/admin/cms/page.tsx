"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "react-quill/dist/quill.snow.css";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Search,
  MoreHorizontal,
  Eye,
  X,
  ArrowLeft,
  ArrowRight,
  Save,
  ImageIcon,
  FileText,
  Search as SearchIcon,
  AlertTriangle,
  CheckCircle2,
  Globe,
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Dynamic import react-quill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Đang tải trình soạn thảo...</p>
      </div>
    </div>
  ),
});

/* ─────────────────────────────────────────────
 * Quill Toolbar Configuration
 * ───────────────────────────────────────────── */

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "align",
  "list",
  "bullet",
  "link",
  "image",
];

/* ─────────────────────────────────────────────
 * Types & Constants
 * ───────────────────────────────────────────── */

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail_url: string | null;
  status: "draft" | "published" | "archived";
  category_id: string;
  category_name: string;
  author: string;
  // SEO fields
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

const POST_STATUS_COLORS = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-emerald-100 text-emerald-700",
  archived: "bg-amber-100 text-amber-700",
} as const;

const POST_STATUS_LABELS = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
} as const;

// Default categories
const CATEGORIES: Category[] = [
  { id: "1", name: "Tin tức", slug: "tin-tuc" },
  { id: "2", name: "Kỹ thuật nông vụ", slug: "ky-thuat-nong-vu" },
  { id: "3", name: "Wiki - Cẩm nang", slug: "wiki-cam-nang" },
  { id: "4", name: "Thị trường", slug: "thi-truong" },
];

// Mock posts (thumbnail_url = null để tránh mock data)
const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Kỹ thuật tưới tiết kiệm nước cho cây cà phê mùa khô",
    slug: "ky-thuat-tuoi-tiet-kiem-nuoc-ca-phe-mua-kho",
    content: "<p>Nội dung bài viết...</p>",
    thumbnail_url: null, // Upload thực tế khi chỉnh sửa
    status: "published",
    category_id: "2",
    category_name: "Kỹ thuật nông vụ",
    author: "Admin",
    meta_title: "Kỹ thuật tưới tiết kiệm nước cho cây cà phê | AgriHub",
    meta_description: "Hướng dẫn chi tiết cách tưới tiết kiệm nước cho cây cà phê mùa khô, tăng năng suất và giảm chi phí.",
    keywords: "tưới tiết kiệm nước, cà phê, nông nghiệp, tưới tự động",
    created_at: "2026-04-15T10:30:00Z",
    updated_at: "2026-04-16T14:20:00Z",
  },
  {
    id: "2",
    title: "Báo cáo giá cà phê Robusta tháng 4/2026",
    slug: "bao-cao-gia-ca-phe-robusta-thang-4-2026",
    content: "<p>Nội dung bài viết...</p>",
    thumbnail_url: null,
    status: "published",
    category_id: "4",
    category_name: "Thị trường",
    author: "Admin",
    meta_title: "Giá cà phê Robusta hôm nay | AgriHub",
    meta_description: "Cập nhật giá cà phê Robusta mới nhất tháng 4/2026. Phân tích xu hướng và dự báo giá.",
    keywords: "giá cà phê, robusta, thị trường nông sản",
    created_at: "2026-04-12T08:00:00Z",
    updated_at: "2026-04-12T08:00:00Z",
  },
  {
    id: "3",
    title: "Hướng dẫn phòng chống sương muối cho vườn sầu riêng",
    slug: "huong-dan-phong-chong-suong-muoi-sau-rieng",
    content: "<p>Nội dung bài viết...</p>",
    thumbnail_url: null,
    status: "draft",
    category_id: "3",
    category_name: "Wiki - Cẩm nang",
    author: "Admin",
    created_at: "2026-04-08T16:45:00Z",
    updated_at: "2026-04-08T16:45:00Z",
  },
  {
    id: "4",
    title: "Công nghệ IoT trong nông nghiệp chính xác",
    slug: "cong-nghe-iot-nong-nghiep-chinh-xac",
    content: "<p>Nội dung bài viết...</p>",
    thumbnail_url: null,
    status: "archived",
    category_id: "3",
    category_name: "Wiki - Cẩm nang",
    author: "Admin",
    created_at: "2026-03-20T09:15:00Z",
    updated_at: "2026-04-01T11:30:00Z",
  },
];

/* ─────────────────────────────────────────────
 * Form Schema (Zod) with SEO fields
 * ───────────────────────────────────────────── */

const postFormSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(200, "Tiêu đề tối đa 200 ký tự"),
  slug: z
    .string()
    .min(3, "Slug phải có ít nhất 3 ký tự")
    .max(100, "Slug tối đa 100 ký tự")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug phải là chữ thường, không dấu"),
  content: z.string().min(50, "Nội dung phải có ít nhất 50 ký tự"),
  category_id: z.string().min(1, "Vui lòng chọn danh mục"),
  status: z.enum(["draft", "published", "archived"]),
  // SEO fields (optional with defaults)
  meta_title: z.string().max(60, "Meta title khuyến cáo dưới 60 ký tự").optional().or(z.literal("")),
  meta_description: z.string().max(160, "Meta description khuyến cáo dưới 160 ký tự").optional().or(z.literal("")),
  keywords: z.string().optional().or(z.literal("")),
});

type PostFormValues = z.infer<typeof postFormSchema>;

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
async function uploadImageToSupabaseWithCacheBust(file: File, folder: string = "posts"): Promise<string> {
  try {
    const publicUrl = await uploadImageToSupabase(file, folder);
    // Add cache-busting for immediate preview
    return getImageUrlWithCacheBust(publicUrl, true);
  } catch (error) {
    // Fallback for development - but DO NOT use mock URLs
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
      const publicUrl = await uploadImageToSupabaseWithCacheBust(file, "posts");
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }, []);

  return (
    <div className="space-y-2">
      <Label>Thumbnail / OG Image</Label>
      {value ? (
        <div className="relative rounded-lg border overflow-hidden group">
          <div className="aspect-video w-full relative bg-slate-50">
            {/* Sử dụng cache-busting để hiển thị ảnh mới upload */}
            <Image 
              src={getImageUrlWithCacheBust(value, true)} 
              alt="Thumbnail preview" 
              fill 
              className="object-cover" 
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => document.getElementById("image-upload")?.click()}>
              <Pencil className="w-4 h-4 mr-1" /> Đổi ảnh
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onChange(null)}>
              <Trash2 className="w-4 h-4 mr-1" /> Xóa
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn("border-2 border-dashed rounded-lg p-8 text-center transition-colors", dragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300")}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input id="image-upload" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file); }} className="hidden" />
          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Đang tải lên...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Kéo thả ảnh hoặc <button type="button" onClick={() => document.getElementById("image-upload")?.click()} className="text-primary hover:underline">chọn file</button>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP • Tối đa 5MB</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
 * SEO Preview Snippet Component
 * ───────────────────────────────────────────── */

interface SEOPreviewProps {
  title: string;
  slug: string;
  metaDescription: string;
}

function SEOPreview({ title, slug, metaDescription }: SEOPreviewProps) {
  const displayTitle = title || "Tiêu đề bài viết của bạn";
  const displayUrl = `agrihub.vn/blog/${slug || "slug-bai-viet"}`;
  const displayDescription = metaDescription || "Mô tả ngắn về bài viết sẽ hiển thị trên Google. Nên viết ngắn gọn, hấp dẫn.";
  
  // Truncate for display
  const truncatedTitle = displayTitle.length > 60 ? displayTitle.slice(0, 57) + "..." : displayTitle;
  const truncatedDesc = displayDescription.length > 160 ? displayDescription.slice(0, 157) + "..." : displayDescription;

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        Preview Snippet (Google)
      </Label>
      <div className="border rounded-lg overflow-hidden bg-white">
        {/* Google Header */}
        <div className="bg-gray-100 px-4 py-2 flex items-center gap-3 text-xs text-gray-600">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span>https://www.google.com</span>
        </div>
        
        {/* Snippet */}
        <div className="p-4">
          <h3 className="text-xl text-blue-800 hover:underline cursor-pointer mb-1">
            {truncatedTitle}
          </h3>
          <p className="text-green-700 text-sm mb-2">{displayUrl}</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            {truncatedDesc}
          </p>
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="flex flex-wrap gap-2">
        {title.length > 0 && title.length <= 60 && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Title OK ({title.length}/60)
          </Badge>
        )}
        {title.length > 60 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <AlertTriangle className="w-3 h-3" />
            Title dài ({title.length}/60)
          </Badge>
        )}
        {metaDescription.length > 0 && metaDescription.length <= 160 && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Description OK ({metaDescription.length}/160)
          </Badge>
        )}
        {metaDescription.length > 160 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <AlertTriangle className="w-3 h-3" />
            Description dài ({metaDescription.length}/160)
          </Badge>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Post Form Page Component
 * ───────────────────────────────────────────── */

interface PostFormPageProps {
  post?: Post;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

function PostFormPage({ post, categories, onSuccess, onCancel }: PostFormPageProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(post?.thumbnail_url ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      content: post?.content ?? "",
      category_id: post?.category_id ?? "",
      status: post?.status ?? "draft",
      meta_title: post?.meta_title ?? "",
      meta_description: post?.meta_description ?? "",
      keywords: post?.keywords ?? "",
    },
  });

  const watchedStatus = watch("status");
  const watchedContent = watch("content");
  const watchedTitle = watch("title");
  const watchedMetaTitle = watch("meta_title");
  const watchedMetaDescription = watch("meta_description");
  const watchedSlug = watch("slug");

  const onSubmit = async (data: PostFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual Supabase insert/update
      // Payload sẽ bao gồm cả các trường SEO
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const payload = {
        ...data,
        thumbnail_url: thumbnailUrl,
        // SEO fields included
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        keywords: data.keywords || null,
      };
      
      console.log("Form submitted with SEO:", payload);
      onSuccess();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = () => {
    if (watchedTitle) {
      const slug = watchedTitle
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Form Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {post ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {post ? `Đang chỉnh sửa: ${post.title}` : "Điền thông tin bài viết mới"}
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
                  {post ? "Cập nhật" : "Tạo bài viết"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content with Tabs */}
      <div className="max-w-5xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="content" className="w-full">
          {/* Tabs List */}
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="content" className="gap-2">
              <FileText className="w-4 h-4" />
              Nội dung bài viết
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <SearchIcon className="w-4 h-4" />
              Cấu hình SEO
            </TabsTrigger>
          </TabsList>

          {/* Tab Content: Content */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="col-span-2 space-y-6">
                {/* Title */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Nội dung bài viết</CardTitle>
                      <Button type="button" variant="ghost" size="sm" onClick={generateSlug} className="text-xs">
                        Tạo slug tự động
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title Input */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Tiêu đề</Label>
                      <Input
                        id="title"
                        placeholder="VD: Kỹ thuật tưới tiết kiệm nước cho cây cà phê"
                        {...register("title")}
                        className={cn(errors.title && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {errors.title && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Slug Input */}
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL)</Label>
                      <Input
                        id="slug"
                        placeholder="VD: ky-thuat-tuoi-ca-phe"
                        {...register("slug")}
                        className={cn(errors.slug && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {errors.slug && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.slug.message}
                        </p>
                      )}
                    </div>

                    {/* Content Editor (react-quill) */}
                    <div className="space-y-2">
                      <Label>Nội dung</Label>
                      <div className={cn("rounded-lg border overflow-hidden", errors.content ? "border-red-500" : "border-slate-200")}>
                        <ReactQuill
                          theme="snow"
                          value={watchedContent}
                          onChange={(content) => setValue("content", content)}
                          modules={QUILL_MODULES}
                          formats={QUILL_FORMATS}
                          className="bg-white"
                          placeholder="Nhập nội dung bài viết tại đây..."
                        />
                      </div>
                      {errors.content && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.content.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Category & Status */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Phân loại</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Category Select */}
                    <div className="space-y-2">
                      <Label>Danh mục</Label>
                      <Select
                        value={watch("category_id")}
                        onValueChange={(value) => setValue("category_id", value)}
                      >
                        <SelectTrigger className={cn(errors.category_id && "border-red-500")}>
                          <SelectValue placeholder="Chọn danh mục..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category_id && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.category_id.message}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label>Trạng thái</Label>
                      <div className="flex flex-wrap gap-2">
                        {(["draft", "published", "archived"] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setValue("status", status)}
                            className={cn(
                              "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                              watchedStatus === status
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            )}
                          >
                            {POST_STATUS_LABELS[status]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thumbnail */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Hình ảnh</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload value={thumbnailUrl} onChange={setThumbnailUrl} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab Content: SEO */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* SEO Fields */}
              <div className="col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <SearchIcon className="w-5 h-5 text-emerald-600" />
                      Cấu hình SEO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Meta Title */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="meta_title">Meta Title</Label>
                        <span className={cn(
                          "text-xs",
                          (watchedMetaTitle?.length ?? 0) > 60 ? "text-amber-600" : "text-muted-foreground"
                        )}>
                          {(watchedMetaTitle?.length ?? 0)}/60 ký tự
                        </span>
                      </div>
                      <Input
                        id="meta_title"
                        placeholder="VD: Kỹ thuật tưới tiết kiệm nước cho cà phê | AgriHub"
                        {...register("meta_title")}
                        className={cn(
                          errors.meta_title && "border-red-500 focus-visible:ring-red-500",
                          (watchedMetaTitle?.length ?? 0) > 60 && "border-amber-400"
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Tiêu đề hiển thị trên Google. Nên dưới 60 ký tự để hiển thị đầy đủ.
                      </p>
                      {errors.meta_title && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.meta_title.message}
                        </p>
                      )}
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="meta_description">Meta Description</Label>
                        <span className={cn(
                          "text-xs",
                          (watchedMetaDescription?.length ?? 0) > 160 ? "text-amber-600" : "text-muted-foreground"
                        )}>
                          {(watchedMetaDescription?.length ?? 0)}/160 ký tự
                        </span>
                      </div>
                      <Textarea
                        id="meta_description"
                        placeholder="VD: Hướng dẫn chi tiết cách tưới tiết kiệm nước cho cây cà phê mùa khô, giúp tăng năng suất và giảm 30% chi phí nước."
                        {...register("meta_description")}
                        rows={3}
                        className={cn(
                          errors.meta_description && "border-red-500 focus-visible:ring-red-500",
                          (watchedMetaDescription?.length ?? 0) > 160 && "border-amber-400"
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        Mô tả ngắn hiển thị trên Google. Nên 120-160 ký tự.
                      </p>
                      {errors.meta_description && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{errors.meta_description.message}
                        </p>
                      )}
                    </div>

                    {/* Keywords */}
                    <div className="space-y-2">
                      <Label htmlFor="keywords">Từ khóa (Keywords)</Label>
                      <Input
                        id="keywords"
                        placeholder="VD: tưới tự động, sầu riêng, tiết kiệm nước, nông nghiệp"
                        {...register("keywords")}
                      />
                      <p className="text-xs text-muted-foreground">
                        Các từ khóa liên quan, cách nhau bằng dấu phẩy. Giúp Google hiểu nội dung bài viết.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* SEO Preview */}
              <div className="space-y-6">
                <Card className="sticky top-24">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SEOPreview
                      title={watchedMetaTitle || watchedTitle}
                      slug={watchedSlug}
                      metaDescription={watchedMetaDescription || ""}
                    />
                  </CardContent>
                </Card>

                {/* SEO Tips */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                      Mẹo SEO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-amber-700 space-y-2">
                    <p>• Meta title nên chứa từ khóa chính ở đầu</p>
                    <p>• Meta description nên hấp dẫn, kêu gọi hành động</p>
                    <p>• Sử dụng từ khóa tự nhiên, không nhồi nhét</p>
                    <p>• URL nên ngắn gọn và chứa từ khóa</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quill CSS */}
      <style jsx global>{`
        .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 8px 12px !important;
          background: #f8fafc;
        }
        .ql-container {
          border: none !important;
          font-family: inherit;
          font-size: 15px;
        }
        .ql-editor {
          min-height: 350px;
          padding: 16px 20px;
        }
        .ql-editor p {
          margin-bottom: 12px;
        }
        .ql-editor h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .ql-editor h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .ql-editor h3 {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .ql-editor ul, .ql-editor ol {
          padding-left: 24px;
          margin-bottom: 12px;
        }
        .ql-editor li {
          margin-bottom: 6px;
        }
        .ql-editor a {
          color: #2E7D32;
          text-decoration: underline;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item::before {
          content: 'Normal';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
          content: 'Heading 1';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
          content: 'Heading 2';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
          content: 'Heading 3';
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
 * Post Row Component
 * ───────────────────────────────────────────── */

interface PostRowProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

function PostRow({ post, onEdit, onDelete }: PostRowProps) {
  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex items-center gap-3">
          {post.thumbnail_url ? (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground line-clamp-1">{post.title}</p>
            <p className="text-xs text-muted-foreground font-mono">/{post.slug}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {post.category_name}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={cn("font-medium", POST_STATUS_COLORS[post.status])}>
          {POST_STATUS_LABELS[post.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {post.author}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(post.updated_at).toLocaleDateString("vi-VN")}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(post)}>
              <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" /> Xem trước
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(post)} className="text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4 mr-2" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

/* ─────────────────────────────────────────────
 * Main CMS Page Component
 * ───────────────────────────────────────────── */

export default function AdminCmsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [categories] = useState<Category[]>(CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Post["status"]>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  // Full-screen form mode
  const [formMode, setFormMode] = useState<"list" | "create" | "edit">("list");
  const [editingPost, setEditingPost] = useState<Post | undefined>(undefined);
  
  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState<Post | undefined>(undefined);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || post.status === filterStatus;
      const matchesCategory = filterCategory === "all" || post.category_id === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [posts, searchQuery, filterStatus, filterCategory]);

  // Handlers
  const handleCreatePost = () => {
    setEditingPost(undefined);
    setFormMode("create");
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setFormMode("edit");
  };

  const handleDeletePost = (post: Post) => {
    setDeletingPost(post);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingPost) {
      setPosts((prev) => prev.filter((p) => p.id !== deletingPost.id));
      toast({
        title: "Đã xóa bài viết",
        description: `Bài viết "${deletingPost.title}" đã được xóa.`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });
      setIsDeleteDialogOpen(false);
      setDeletingPost(undefined);
    }
  };

  const handleFormSuccess = () => {
    setFormMode("list");
    setEditingPost(undefined);
    toast({
      title: formMode === "edit" ? "Đã cập nhật bài viết" : "Đã tạo bài viết mới",
      description: formMode === "edit" ? "Bài viết đã được cập nhật thành công." : "Bài viết mới đã được tạo.",
      className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    });
  };

  const handleFormCancel = () => {
    setFormMode("list");
    setEditingPost(undefined);
  };

  // Render form mode
  if (formMode === "create" || formMode === "edit") {
    return (
      <PostFormPage
        post={editingPost}
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
          <h2 className="text-2xl font-bold text-foreground">Quản lý Tin tức & CMS</h2>
          <p className="text-sm text-muted-foreground">
            Tạo, chỉnh sửa và quản lý nội dung trên Agri-OS
          </p>
        </div>
        <Button onClick={handleCreatePost} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm bài viết mới
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
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Danh mục..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(["all", "published", "draft", "archived"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status === "all" ? "Tất cả" : POST_STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[35%]">Bài viết</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">Không tìm thấy bài viết</p>
                        <p className="text-sm text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
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
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Xác nhận xóa bài viết</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Bạn có chắc chắn muốn xóa bài viết "{deletingPost?.title}"? Hành động này không thể hoàn tác.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa bài viết
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
