"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  AlertCircle,
  BookOpen,
  Newspaper,
  Wrench,
  FolderTree,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

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
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
 * Types & Constants
 * ───────────────────────────────────────────── */

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  post_count: number;
  created_at: string;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Newspaper: Newspaper,
  BookOpen: BookOpen,
  Wrench: Wrench,
  FolderTree: FolderTree,
};

const CATEGORY_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

// Default categories (Wiki is merged as a category)
const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Tin tức", slug: "tin-tuc", icon: "Newspaper", post_count: 24, created_at: "2026-01-01T00:00:00Z" },
  { id: "2", name: "Kỹ thuật nông vụ", slug: "ky-thuat-nong-vu", icon: "Wrench", post_count: 18, created_at: "2026-01-15T00:00:00Z" },
  { id: "3", name: "Wiki - Cẩm nang", slug: "wiki-cam-nang", icon: "BookOpen", post_count: 32, created_at: "2026-02-01T00:00:00Z" },
  { id: "4", name: "Thị trường", slug: "thi-truong", icon: "Newspaper", post_count: 12, created_at: "2026-03-01T00:00:00Z" },
];

/* ─────────────────────────────────────────────
 * Form Schema (Zod)
 * ───────────────────────────────────────────── */

const categoryFormSchema = z.object({
  name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự").max(50, "Tên tối đa 50 ký tự"),
  slug: z
    .string()
    .min(2, "Slug phải có ít nhất 2 ký tự")
    .max(50, "Slug tối đa 50 ký tự")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug phải là chữ thường, không dấu"),
  icon: z.string().min(1, "Vui lòng chọn biểu tượng"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

/* ─────────────────────────────────────────────
 * Category Form Component
 * ───────────────────────────────────────────── */

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      icon: category?.icon ?? "Newspaper",
    },
  });

  const watchedIcon = watch("icon");
  const watchedName = watch("name");

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual Supabase insert/update
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Category submitted:", data);
      onSuccess();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from name
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="name">Tên danh mục</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateSlug}
            className="text-xs"
          >
            Tạo slug tự động
          </Button>
        </div>
        <Input
          id="name"
          placeholder="VD: Tin tức, Kỹ thuật nông vụ, Wiki - Cẩm nang"
          {...register("name")}
          className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
        />
        {errors.name && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL thân thiện)</Label>
        <Input
          id="slug"
          placeholder="VD: tin-tuc, ky-thuat-nong-vu"
          {...register("slug")}
          className={cn(errors.slug && "border-red-500 focus-visible:ring-red-500")}
        />
        {errors.slug && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.slug.message}
          </p>
        )}
      </div>

      {/* Icon */}
      <div className="space-y-3">
        <Label>Biểu tượng</Label>
        <div className="grid grid-cols-4 gap-3">
          {["Newspaper", "BookOpen", "Wrench", "FolderTree"].map((iconName) => {
            const Icon = CATEGORY_ICONS[iconName];
            const isSelected = watchedIcon === iconName;
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => setValue("icon", iconName)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all",
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{iconName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
              Đang lưu...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              {category ? "Cập nhật" : "Tạo danh mục"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────
 * Category Row Component
 * ───────────────────────────────────────────── */

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function CategoryRow({ category, onEdit, onDelete }: CategoryRowProps) {
  const Icon = CATEGORY_ICONS[category.icon] || Newspaper;
  const colorClass = CATEGORY_COLORS[parseInt(category.id) % CATEGORY_COLORS.length];

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground font-mono">/{category.slug}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-slate-50">
          {category.post_count} bài viết
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(category.created_at).toLocaleDateString("vi-VN")}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Pencil className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

/* ─────────────────────────────────────────────
 * Main Categories Page Component
 * ───────────────────────────────────────────── */

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | undefined>(undefined);

  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      toast({
        title: "Đã xóa danh mục",
        description: `Danh mục "${deletingCategory.name}" đã được xóa.`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });
      setIsDeleteDialogOpen(false);
      setDeletingCategory(undefined);
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingCategory(undefined);
    toast({
      title: editingCategory ? "Đã cập nhật danh mục" : "Đã tạo danh mục mới",
      description: editingCategory
        ? "Danh mục đã được cập nhật thành công."
        : "Danh mục mới đã được tạo.",
      className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/cms">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-2xl font-bold text-foreground">Danh mục bài viết</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            Quản lý danh mục cho Wiki, Tin tức, Kỹ thuật nông vụ
          </p>
        </div>
        <Button onClick={handleCreateCategory} className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm danh mục mới
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Wiki được tích hợp vào hệ thống CMS</p>
              <p className="text-sm text-blue-700 mt-1">
                Tất cả nội dung Wiki, Tin tức, Kỹ thuật nông vụ đều được quản lý tại đây. 
                Mỗi danh mục tương ứng với một phần của website công khai.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50%]">Danh mục</TableHead>
                <TableHead>Số bài viết</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FolderTree className="w-12 h-12 text-slate-300" />
                      <p className="text-slate-500">Chưa có danh mục nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Cập nhật thông tin danh mục."
                : "Thêm danh mục mới để phân loại bài viết."}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{deletingCategory?.name}"? 
              Các bài viết trong danh mục này sẽ không bị xóa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa danh mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
