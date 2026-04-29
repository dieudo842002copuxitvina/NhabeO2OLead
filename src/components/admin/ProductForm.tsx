'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import {
  Boxes,
  Image as ImageIcon,
  Loader2,
  Package,
  Save,
  Settings2,
  UploadCloud,
  X,
} from 'lucide-react';
import { uploadProductImage, createProduct } from '../../../app/actions/productActions';

export interface ProductCategoryOption {
  id: string;
  name: string;
  slug: string;
  source?: 'supabase' | 'fallback';
}

interface ProductFormProps {
  categories: ProductCategoryOption[];
}

const STOCK_STATUS_OPTIONS = [
  { value: 'con_hang', label: 'Còn hàng' },
  { value: 'het_hang', label: 'Hết hàng' },
  { value: 'dat_truoc', label: 'Đặt trước' },
] as const;

const UNIT_OPTIONS = [
  { value: 'cai', label: 'Cái' },
  { value: 'cuon', label: 'Cuộn' },
  { value: 'bao', label: 'Bao' },
  { value: 'tan', label: 'Tấn' },
] as const;

const formSchema = z.object({
  title: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự.'),
  sku: z.string().min(3, 'SKU phải có ít nhất 3 ký tự.'),
  brand: z.string().optional(),
  imageUrl: z.string().min(1, 'Vui lòng tải ảnh sản phẩm.'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục.'),
  basePrice: z.coerce.number().min(0, 'Giá bán không hợp lệ.'),
  description: z.string().optional(),
  stockStatus: z.enum(['con_hang', 'het_hang', 'dat_truoc']),
  unit: z.enum(['cai', 'cuon', 'bao', 'tan']),
  specifications: z.record(z.any()).optional(),
});

type FormValues = z.infer<typeof formSchema>;
type AdvancedCategoryMode = 'fertilizer' | 'irrigation' | 'default';

type AdvancedFieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'number';
  description?: string;
};

const ADVANCED_FIELD_GROUPS: Record<Exclude<AdvancedCategoryMode, 'default'>, AdvancedFieldConfig[]> = {
  fertilizer: [
    {
      key: 'npk_percent',
      label: 'Hàm lượng N-P-K (%)',
      placeholder: 'Ví dụ: 20-20-15',
      type: 'text',
      description: 'Ghi theo định dạng N-P-K hoặc chuỗi phần trăm công bố của nhà sản xuất.',
    },
    {
      key: 'solubility_percent',
      label: 'Độ tan (%)',
      placeholder: 'Ví dụ: 98',
      type: 'number',
    },
    {
      key: 'ec_impact',
      label: 'Chỉ số EC impact',
      placeholder: 'Ví dụ: 1.35',
      type: 'number',
    },
    {
      key: 'mother_solution_l_per_kg',
      label: 'Hướng dẫn pha dung dịch mẹ (L/kg)',
      placeholder: 'Ví dụ: 4.5',
      type: 'number',
    },
  ],
  irrigation: [
    {
      key: 'operating_pressure_bar',
      label: 'Áp suất hoạt động (bar)',
      placeholder: 'Ví dụ: 1.8',
      type: 'number',
    },
    {
      key: 'nominal_flow_lph',
      label: 'Lưu lượng danh định (L/h)',
      placeholder: 'Ví dụ: 35',
      type: 'number',
    },
    {
      key: 'uv_resistance_level',
      label: 'Chất liệu (UV resistance level)',
      placeholder: 'Ví dụ: UV8 / UV10',
      type: 'text',
    },
    {
      key: 'origin',
      label: 'Xuất xứ',
      placeholder: 'Ví dụ: Israel / Việt Nam',
      type: 'text',
    },
  ],
};

const ALL_ADVANCED_KEYS = new Set(
  Object.values(ADVANCED_FIELD_GROUPS)
    .flat()
    .map((field) => field.key)
);

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

function resolveAdvancedCategoryMode(category?: ProductCategoryOption): AdvancedCategoryMode {
  if (!category) {
    return 'default';
  }

  const fingerprint = normalizeText(`${category.name} ${category.slug}`);

  if (
    fingerprint.includes('phan bon') ||
    fingerprint.includes('phan-bon') ||
    fingerprint.includes('fertilizer') ||
    fingerprint.includes('npk')
  ) {
    return 'fertilizer';
  }

  if (
    fingerprint.includes('vat tu') ||
    fingerprint.includes('vat-tu') ||
    fingerprint.includes('tuoi') ||
    fingerprint.includes('irrigation') ||
    fingerprint.includes('van') ||
    fingerprint.includes('bec') ||
    fingerprint.includes('ong') ||
    fingerprint.includes('pipe') ||
    fingerprint.includes('nozzle')
  ) {
    return 'irrigation';
  }

  return 'default';
}

function slugifyProduct(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export default function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      sku: '',
      brand: '',
      imageUrl: '',
      categoryId: '',
      basePrice: 0,
      description: '',
      stockStatus: 'con_hang',
      unit: 'cai',
      specifications: {},
    },
  });

  const selectedCategoryId = form.watch('categoryId');
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );
  const selectedCategoryMode = resolveAdvancedCategoryMode(selectedCategory);
  const advancedFields =
    selectedCategoryMode === 'default' ? [] : ADVANCED_FIELD_GROUPS[selectedCategoryMode];
  const specifications = form.watch('specifications') ?? {};
  const isUsingFallbackCategories = categories.some((category) => category.source === 'fallback');

  const updateSpecification = (key: string, value: string, type: 'text' | 'number') => {
    const currentSpecifications = form.getValues('specifications') ?? {};
    const nextSpecifications = { ...currentSpecifications };

    if (value === '') {
      delete nextSpecifications[key];
    } else if (type === 'number') {
      nextSpecifications[key] = Number(value);
    } else {
      nextSpecifications[key] = value;
    }

    form.setValue('specifications', nextSpecifications, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const handleCategoryChange = (categoryId: string, onChange: (value: string) => void) => {
    onChange(categoryId);
    form.clearErrors('categoryId');

    const currentSpecifications = form.getValues('specifications') ?? {};
    const nextSpecifications = { ...currentSpecifications };

    ALL_ADVANCED_KEYS.forEach((key) => {
      delete nextSpecifications[key];
    });

    form.setValue('specifications', nextSpecifications, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    form.setValue('imageUrl', file.name, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.clearErrors('imageUrl');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setValue('imageUrl', '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      if (!values.categoryId) {
        form.setError('categoryId', {
          type: 'manual',
          message: 'Vui lòng chọn danh mục.',
        });
        return;
      }

      if (!imageFile || !values.imageUrl) {
        form.setError('imageUrl', {
          type: 'manual',
          message: 'Vui lòng tải ảnh sản phẩm.',
        });
        return;
      }

      let uploadedImageUrl = '';

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const uploadResult = await uploadProductImage(formData);
        if (!uploadResult.success) {
          toast({
            title: 'Lỗi tải ảnh',
            description: uploadResult.error,
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }

        uploadedImageUrl = uploadResult.publicUrl || '';
      }

      const payload = {
        title: values.title.trim(),
        sku: values.sku.trim().toUpperCase(),
        brand: values.brand?.trim() || '',
        categoryId: values.categoryId,
        basePrice: values.basePrice,
        description: values.description?.trim() || '',
        specifications: {
          ...(values.specifications ?? {}),
          stock_status: values.stockStatus,
          unit: values.unit,
          category_slug: selectedCategory?.slug ?? null,
        },
        imageUrl: uploadedImageUrl,
      };

      const result = await createProduct(payload);

      if (result.success) {
        toast({
          title: 'Thêm sản phẩm thành công',
          description: 'Đã lưu sản phẩm vào hệ thống PIM.',
        });
        router.push('/admin/products');
      } else {
        toast({
          title: 'Lỗi lưu dữ liệu',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Lỗi hệ thống',
        description: 'Có lỗi không mong muốn xảy ra khi lưu sản phẩm.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Thêm / Chỉnh sửa sản phẩm</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý dữ liệu bán hàng, tồn kho và thông số kỹ thuật cho sản phẩm nông nghiệp.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2E7D32] hover:bg-[#1B5E20]"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Đang xử lý...' : 'Lưu sản phẩm'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-7">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4 text-slate-500" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: Bơm ly tâm Adelino 3HP"
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Slug dự kiến:{' '}
                        <span className="font-mono">{slugifyProduct(field.value || '') || 'ten-san-pham'}</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã SKU *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ví dụ: ADE-001"
                            className="rounded-xl font-mono uppercase"
                            {...field}
                            onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thương hiệu</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Adelino" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục *</FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={(value) => handleCategoryChange(value, field.onChange)}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Chọn danh mục từ Supabase" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[220]">
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {isUsingFallbackCategories
                            ? 'Bảng categories đang trống hoặc chưa phản hồi, form tạm dùng bộ danh mục fallback để tránh khóa thao tác.'
                            : 'Danh mục được nạp trực tiếp từ bảng categories trong Supabase.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="basePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá bán (VNĐ) *</FormLabel>
                        <FormControl>
                          <Input
                            className="rounded-xl font-mono font-bold text-[#2E7D32]"
                            placeholder="Nhập giá bán"
                            value={field.value ? new Intl.NumberFormat('vi-VN').format(field.value) : ''}
                            onChange={(event) => {
                              const rawValue = event.target.value.replace(/[^0-9]/g, '');
                              field.onChange(rawValue === '' ? 0 : Number(rawValue));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả nhanh công năng, phân khúc và điểm mạnh của sản phẩm..."
                          className="h-28 resize-none rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 xl:col-span-5">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  Hình ảnh sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {imagePreview ? (
                  <div className="group relative aspect-video overflow-hidden rounded-xl border border-border/50 bg-slate-50">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-2" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="rounded-full shadow-lg"
                      >
                        <X className="mr-1.5 h-4 w-4" />
                        Xóa ảnh
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition-colors hover:border-blue-500/50 hover:bg-blue-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      onChange={handleImageChange}
                    />
                    <UploadCloud className="mb-3 h-10 w-10 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">
                      Kéo thả hoặc click để chọn ảnh
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Định dạng PNG, JPG. Nên dùng ảnh ratio 16:9.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Boxes className="h-4 w-4 text-[#2E7D32]" />
                  Quản lý kho & đơn vị bán
                </CardTitle>
                <CardDescription className="text-xs">
                  Thông tin này sẽ được gom chung vào metadata của sản phẩm khi submit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <FormField
                  control={form.control}
                  name="stockStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái kho</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Chọn trạng thái kho" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[220]">
                          {STOCK_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị tính</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Chọn đơn vị tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[220]">
                          {UNIT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm border-l-4 border-l-[#2E7D32]">
              <CardHeader className="border-b border-border/30 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="h-4 w-4 text-[#2E7D32]" />
                  Thông số kỹ thuật chuyên sâu
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedCategory
                    ? `Bộ trường chuyên sâu cho danh mục: ${selectedCategory.name}`
                    : 'Chọn danh mục trước để mở các trường thông số phù hợp.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {advancedFields.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {advancedFields.map((field) => (
                      <FormItem key={field.key} className={field.key === 'npk_percent' ? 'md:col-span-2' : ''}>
                        <FormLabel className="text-xs">{field.label}</FormLabel>
                        <FormControl>
                          <Input
                            type={field.type}
                            inputMode={field.type === 'number' ? 'decimal' : undefined}
                            className="h-10 rounded-lg"
                            placeholder={field.placeholder}
                            value={String(specifications[field.key] ?? '')}
                            onChange={(event) =>
                              updateSpecification(field.key, event.target.value, field.type)
                            }
                          />
                        </FormControl>
                        {field.description ? (
                          <p className="text-[11px] text-muted-foreground">{field.description}</p>
                        ) : null}
                      </FormItem>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-sm italic text-slate-500">
                      Danh mục này hiện chưa có bộ thông số chuyên sâu riêng. Hãy chọn Phân bón hoặc nhóm
                      Vật tư tưới để mở các trường động.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
