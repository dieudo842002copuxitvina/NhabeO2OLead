'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  ChevronRight,
  FileText,
  Hash,
  Image as ImageIcon,
  Layers3,
  Loader2,
  Package,
  Plus,
  Ruler,
  Save,
  Tags,
  Truck,
  UploadCloud,
  X,
} from 'lucide-react';
import { createProduct, uploadMultipleProductImages } from '../../../app/actions/productActions';

export interface ProductCategoryOption {
  id: string;
  name: string;
  slug: string;
  source?: 'supabase' | 'fallback';
}

interface ProductFormProps {
  categories: ProductCategoryOption[];
}

interface GalleryImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface VariantRow {
  key: string;
  label: string;
  option1: string;
  option2?: string;
  price: number;
  stockQuantity: number;
  sku: string;
}

const MAX_GALLERY_IMAGES = 9;

const SECTION_ITEMS = [
  { id: 'basic-info', label: 'Thông tin cơ bản' },
  { id: 'media-assets', label: 'Hình ảnh' },
  { id: 'sales-info', label: 'Thông tin bán hàng' },
  { id: 'shipping-info', label: 'Vận chuyển' },
] as const;

const formSchema = z.object({
  title: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự.'),
  categoryId: z.string().min(1, 'Vui lòng chọn ngành hàng.'),
  description: z.string().min(10, 'Mô tả sản phẩm nên có ít nhất 10 ký tự.'),
  sku: z.string().optional(),
  imageUrl: z.string().min(1, 'Vui lòng tải lên ít nhất 1 ảnh sản phẩm.'),
  basePrice: z.coerce.number().min(0, 'Giá bán không hợp lệ.'),
  stockQuantity: z.coerce.number().min(0, 'Số lượng tồn kho không hợp lệ.'),
  weightGram: z.coerce.number().min(1, 'Cân nặng phải lớn hơn 0 gram.'),
  packageLengthCm: z.coerce.number().min(1, 'Chiều dài phải lớn hơn 0 cm.'),
  packageWidthCm: z.coerce.number().min(1, 'Chiều rộng phải lớn hơn 0 cm.'),
  packageHeightCm: z.coerce.number().min(1, 'Chiều cao phải lớn hơn 0 cm.'),
});

type FormValues = z.infer<typeof formSchema>;

function slugifyProduct(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function parseCurrencyInput(value: string) {
  const rawValue = value.replace(/[^0-9]/g, '');
  return rawValue === '' ? 0 : Number(rawValue);
}

function SectionCard({
  id,
  title,
  description,
  icon,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-28 border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200/80 pb-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            {icon}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
            <CardDescription className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

function MultiImageUpload({
  images,
  onAddImages,
  onRemoveImage,
  error,
}: {
  images: GalleryImageItem[];
  onAddImages: (files: FileList | File[]) => void;
  onRemoveImage: (imageId: string) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remainingSlots = MAX_GALLERY_IMAGES - images.length;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      onAddImages(files);
    }
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files?.length) {
      onAddImages(event.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Bộ ảnh sản phẩm</p>
            <p className="text-sm text-slate-500">
              Kéo thả hoặc tải tối đa {MAX_GALLERY_IMAGES} ảnh. Ảnh đầu tiên sẽ tự động là ảnh bìa.
            </p>
          </div>
          <Badge variant="outline" className="rounded-full border-slate-200 bg-white px-3 py-1 text-slate-600">
            {images.length}/{MAX_GALLERY_IMAGES} ảnh
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <img src={image.previewUrl} alt={image.file.name} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                {index === 0 ? (
                  <Badge className="rounded-full bg-slate-900 px-2.5 py-1 text-white hover:bg-slate-900">
                    Ảnh bìa
                  </Badge>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => onRemoveImage(image.id)}
                  className="rounded-full bg-white/95 p-1.5 text-slate-700 shadow-sm transition hover:bg-white"
                  aria-label="Xóa ảnh"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {remainingSlots > 0 ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 text-center transition hover:border-[#2E7D32]/40 hover:bg-[#2E7D32]/5"
            >
              <UploadCloud className="mb-3 h-8 w-8 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">Thêm ảnh</span>
              <span className="mt-1 text-xs text-slate-500">Còn {remainingSlots} vị trí</span>
            </button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleInputChange}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Video sản phẩm</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Khu vực video đang được giữ chỗ để mở rộng ở bước backend tiếp theo.
        </p>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function VariantOptionBuilder({
  title,
  subtitle,
  nameValue,
  onNameChange,
  draftValue,
  onDraftChange,
  onDraftSubmit,
  options,
  onRemoveOption,
  showRemoveGroup,
  onRemoveGroup,
}: {
  title: string;
  subtitle: string;
  nameValue: string;
  onNameChange: (value: string) => void;
  draftValue: string;
  onDraftChange: (value: string) => void;
  onDraftSubmit: () => void;
  options: string[];
  onRemoveOption: (option: string) => void;
  showRemoveGroup?: boolean;
  onRemoveGroup?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {showRemoveGroup && onRemoveGroup ? (
          <Button type="button" variant="outline" size="sm" onClick={onRemoveGroup}>
            Xóa nhóm
          </Button>
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Tên nhóm phân loại</label>
          <Input
            value={nameValue}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Ví dụ: Quy cách / Trọng lượng / Màu sắc"
            className="h-11 rounded-2xl border-slate-200 bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Thuộc tính phân loại</label>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {options.length > 0 ? (
                options.map((option) => (
                  <Badge
                    key={option}
                    variant="outline"
                    className="rounded-full border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700"
                  >
                    {option}
                    <button
                      type="button"
                      className="ml-2 text-slate-400 transition hover:text-slate-700"
                      onClick={() => onRemoveOption(option)}
                      aria-label={`Xóa ${option}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-400">Chưa có thuộc tính nào. Nhập giá trị rồi bấm Enter.</p>
              )}
            </div>
            <Input
              value={draftValue}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ',') {
                  event.preventDefault();
                  onDraftSubmit();
                }
              }}
              placeholder="Ví dụ: Chai 500ml, Can 5L, Hộp 24 gói..."
              className="h-11 rounded-2xl border-slate-200"
            />
            <p className="mt-2 text-xs text-slate-500">Nhập từng giá trị và nhấn Enter để tạo tag.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof SECTION_ITEMS)[number]['id']>('basic-info');
  const [hasVariants, setHasVariants] = useState(false);
  const [hasSecondVariantGroup, setHasSecondVariantGroup] = useState(false);
  const [variantGroup1Name, setVariantGroup1Name] = useState('Quy cách');
  const [variantGroup2Name, setVariantGroup2Name] = useState('');
  const [variantGroup1Draft, setVariantGroup1Draft] = useState('');
  const [variantGroup2Draft, setVariantGroup2Draft] = useState('');
  const [variantGroup1Options, setVariantGroup1Options] = useState<string[]>([]);
  const [variantGroup2Options, setVariantGroup2Options] = useState<string[]>([]);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);
  const galleryImagesRef = useRef<GalleryImageItem[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      description: '',
      sku: '',
      imageUrl: '',
      basePrice: 0,
      stockQuantity: 0,
      weightGram: 0,
      packageLengthCm: 0,
      packageWidthCm: 0,
      packageHeightCm: 0,
    },
  });

  const selectedCategoryId = form.watch('categoryId');
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );
  const isUsingFallbackCategories = categories.some((category) => category.source === 'fallback');

  useEffect(() => {
    galleryImagesRef.current = galleryImages;
  }, [galleryImages]);

  useEffect(() => {
    return () => {
      galleryImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id as (typeof SECTION_ITEMS)[number]['id']);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.2, 0.4, 0.65],
      }
    );

    SECTION_ITEMS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasSecondVariantGroup) {
      setVariantGroup2Name('');
      setVariantGroup2Draft('');
      setVariantGroup2Options([]);
    }
  }, [hasSecondVariantGroup]);

  useEffect(() => {
    if (!hasVariants) {
      setVariantRows([]);
      return;
    }

    setVariantRows((previousRows) => {
      if (variantGroup1Options.length === 0) {
        return [];
      }

      const previousMap = new Map(previousRows.map((row) => [row.key, row]));
      const fallbackPrice = Number(form.getValues('basePrice') || 0);

      const combinations =
        hasSecondVariantGroup && variantGroup2Options.length > 0
          ? variantGroup1Options.flatMap((option1) =>
              variantGroup2Options.map((option2) => ({
                option1,
                option2,
                label: `${option1} / ${option2}`,
              }))
            )
          : variantGroup1Options.map((option1) => ({
              option1,
              option2: undefined,
              label: option1,
            }));

      return combinations.map((combination) => {
        const key = slugifyProduct(
          `${variantGroup1Name}-${combination.option1}-${variantGroup2Name}-${combination.option2 || ''}`
        );
        const previous = previousMap.get(key);

        return {
          key,
          label: combination.label,
          option1: combination.option1,
          option2: combination.option2,
          price: previous?.price ?? fallbackPrice,
          stockQuantity: previous?.stockQuantity ?? 0,
          sku: previous?.sku ?? '',
        };
      });
    });
  }, [
    form,
    hasSecondVariantGroup,
    hasVariants,
    variantGroup1Name,
    variantGroup1Options,
    variantGroup2Name,
    variantGroup2Options,
  ]);

  const handleAddImages = (incomingFiles: FileList | File[]) => {
    const nextFiles = Array.from(incomingFiles).filter((file) => file.type.startsWith('image/'));

    if (nextFiles.length === 0) {
      toast.error('Chỉ có thể tải lên tệp hình ảnh.');
      return;
    }

    const availableSlots = MAX_GALLERY_IMAGES - galleryImages.length;
    const acceptedFiles = nextFiles.slice(0, availableSlots);

    if (acceptedFiles.length < nextFiles.length) {
      toast.error(`Chỉ có thể giữ tối đa ${MAX_GALLERY_IMAGES} ảnh trong một sản phẩm.`);
    }

    const nextImages = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    const mergedImages = [...galleryImages, ...nextImages];
    setGalleryImages(mergedImages);
    form.setValue('imageUrl', mergedImages[0]?.file.name || '', {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.clearErrors('imageUrl');
  };

  const handleRemoveImage = (imageId: string) => {
    const imageToRemove = galleryImages.find((image) => image.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    const nextImages = galleryImages.filter((image) => image.id !== imageId);
    setGalleryImages(nextImages);
    form.setValue('imageUrl', nextImages[0]?.file.name || '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const scrollToSection = (sectionId: (typeof SECTION_ITEMS)[number]['id']) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const addVariantOption = (group: 1 | 2) => {
    const draft = group === 1 ? variantGroup1Draft : variantGroup2Draft;
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    const currentOptions = group === 1 ? variantGroup1Options : variantGroup2Options;
    if (currentOptions.some((option) => option.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Thuộc tính "${trimmed}" đã tồn tại.`);
      return;
    }

    if (group === 1) {
      setVariantGroup1Options((previous) => [...previous, trimmed]);
      setVariantGroup1Draft('');
    } else {
      setVariantGroup2Options((previous) => [...previous, trimmed]);
      setVariantGroup2Draft('');
    }
  };

  const removeVariantOption = (group: 1 | 2, option: string) => {
    if (group === 1) {
      setVariantGroup1Options((previous) => previous.filter((item) => item !== option));
      return;
    }

    setVariantGroup2Options((previous) => previous.filter((item) => item !== option));
  };

  const updateVariantRow = (
    rowKey: string,
    field: 'price' | 'stockQuantity' | 'sku',
    value: number | string
  ) => {
    setVariantRows((previousRows) =>
      previousRows.map((row) => (row.key === rowKey ? { ...row, [field]: value } : row))
    );
  };

  const variantPayload = useMemo(() => {
    return variantRows.map((row) => ({
      label: row.label,
      sku: row.sku.trim().toUpperCase(),
      price: row.price,
      stock_quantity: row.stockQuantity,
      group_1: {
        name: variantGroup1Name.trim(),
        value: row.option1,
      },
      group_2:
        hasSecondVariantGroup && row.option2
          ? {
              name: variantGroup2Name.trim(),
              value: row.option2,
            }
          : null,
    }));
  }, [hasSecondVariantGroup, variantGroup1Name, variantGroup2Name, variantRows]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      if (!values.categoryId) {
        form.setError('categoryId', {
          type: 'manual',
          message: 'Vui lòng chọn ngành hàng.',
        });
        return;
      }

      if (galleryImages.length === 0 || !values.imageUrl) {
        form.setError('imageUrl', {
          type: 'manual',
          message: 'Vui lòng tải lên ít nhất 1 ảnh sản phẩm.',
        });
        return;
      }

      if (hasVariants) {
        if (!variantGroup1Name.trim()) {
          toast.error('Vui lòng nhập tên nhóm phân loại 1.');
          return;
        }

        if (variantGroup1Options.length === 0) {
          toast.error('Vui lòng thêm ít nhất 1 thuộc tính cho nhóm phân loại 1.');
          return;
        }

        if (hasSecondVariantGroup) {
          if (!variantGroup2Name.trim()) {
            toast.error('Vui lòng nhập tên nhóm phân loại 2.');
            return;
          }

          if (variantGroup2Options.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 thuộc tính cho nhóm phân loại 2.');
            return;
          }
        }

        if (variantRows.length === 0) {
          toast.error('Chưa có biến thể nào được tạo.');
          return;
        }

        const invalidVariant = variantRows.find((variant) => !variant.sku.trim());
        if (invalidVariant) {
          toast.error(`Vui lòng nhập SKU cho phân loại "${invalidVariant.label}".`);
          return;
        }
      } else if (!values.sku?.trim()) {
        form.setError('sku', {
          type: 'manual',
          message: 'Vui lòng nhập SKU sản phẩm.',
        });
        return;
      }

      const imageFormData = new FormData();
      galleryImages.forEach((image) => {
        imageFormData.append('files', image.file);
      });

      const uploadResult = await uploadMultipleProductImages(imageFormData);
      if (!uploadResult.success) {
        toast.error(uploadResult.error || 'Tải bộ ảnh sản phẩm thất bại.');
        return;
      }

      const uploadedGalleryUrls = uploadResult.publicUrls
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      if (uploadedGalleryUrls.length === 0) {
        toast.error('Không nhận được URL ảnh nào sau khi tải bộ ảnh sản phẩm.');
        return;
      }

      const effectiveBasePrice = hasVariants
        ? Math.min(...variantPayload.map((variant) => variant.price))
        : values.basePrice;
      const effectiveStockQuantity = hasVariants
        ? variantPayload.reduce((sum, variant) => sum + variant.stock_quantity, 0)
        : values.stockQuantity;
      const effectiveSku = hasVariants
        ? variantPayload[0]?.sku || values.sku?.trim().toUpperCase() || `VAR-${Date.now()}`
        : values.sku?.trim().toUpperCase() || '';

      const result = await createProduct({
        title: values.title.trim(),
        sku: effectiveSku,
        brand: '',
        categoryId: values.categoryId,
        basePrice: effectiveBasePrice,
        description: values.description.trim(),
        gallery_images: uploadedGalleryUrls,
        variants: hasVariants ? variantPayload : [],
        shipping_info: {
          weight_gram: values.weightGram,
          package_dimensions_cm: {
            length: values.packageLengthCm,
            width: values.packageWidthCm,
            height: values.packageHeightCm,
          },
        },
        stock_quantity: effectiveStockQuantity,
        specifications: {
          category_slug: selectedCategory?.slug ?? null,
          stock_status: effectiveStockQuantity > 0 ? 'con_hang' : 'het_hang',
          gallery_count: uploadedGalleryUrls.length,
          has_variants: hasVariants,
          default_sale_info: hasVariants
            ? null
            : {
                price: values.basePrice,
                stock_quantity: values.stockQuantity,
                sku: values.sku?.trim().toUpperCase() || '',
              },
        },
      });

      if (!result.success) {
        toast.error(result.error || 'Không thể lưu sản phẩm.');
        return;
      }

      toast.success('Đã lưu sản phẩm!');
      router.push('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi không mong muốn xảy ra khi lưu sản phẩm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-[28px] bg-slate-50 pb-28">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Seller Product Composer
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                    Tạo sản phẩm theo luồng Seller Center
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Bố cục được tái cấu trúc theo trải nghiệm đăng bán của Shopee Seller: chia section rõ ràng, neo điều
                    hướng nhanh, và thanh lưu cố định ở đáy màn hình.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Slug dự kiến:</span>{' '}
                  <span className="font-mono">{slugifyProduct(form.watch('title') || '') || 'ten-san-pham'}</span>
                </div>
              </div>
            </div>

            <SectionCard
              id="basic-info"
              title="Thông tin cơ bản"
              description="Thiết lập tên sản phẩm, ngành hàng và mô tả giống khu vực khởi tạo listing trên Seller Center."
              icon={<FileText className="h-5 w-5" />}
            >
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: Bơm ly tâm Adelino 3HP cho vườn sầu riêng"
                          className="h-12 rounded-2xl border-slate-200"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Tiêu đề nên ngắn gọn, nêu rõ công dụng chính và đối tượng sử dụng.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngành hàng</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.clearErrors('categoryId');
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                            <SelectValue placeholder="Chọn ngành hàng / danh mục từ Supabase" />
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả sản phẩm</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả chi tiết đặc tính, ứng dụng, lợi ích và đối tượng phù hợp cho sản phẩm..."
                          className="min-h-[220px] rounded-2xl border-slate-200 bg-white leading-7"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Có thể soạn theo phong cách Seller Center: lợi ích chính, thông số, cách dùng và lưu ý.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SectionCard>

            <SectionCard
              id="media-assets"
              title="Hình ảnh & Video"
              description="Ưu tiên hoàn thiện bộ ảnh theo kiểu listing thương mại điện tử: ảnh bìa nổi bật, ảnh phụ đầy đủ, video để chờ mở rộng."
              icon={<ImageIcon className="h-5 w-5" />}
            >
              <input type="hidden" {...form.register('imageUrl')} />
              <MultiImageUpload
                images={galleryImages}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
                error={form.formState.errors.imageUrl?.message}
              />
            </SectionCard>

            <SectionCard
              id="sales-info"
              title="Thông tin bán hàng"
              description="Thiết lập giá bán, tồn kho, SKU mặc định hoặc chuyển sang mô hình phân loại hàng giống Shopee Seller."
              icon={<Package className="h-5 w-5" />}
            >
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Phân loại hàng</p>
                      <p className="text-sm text-slate-500">
                        Bật để tạo bảng giá, kho và SKU theo từng quy cách biến thể.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={hasVariants ? 'default' : 'outline'}
                      onClick={() => setHasVariants((current) => !current)}
                      className={cn(
                        'rounded-2xl',
                        hasVariants ? 'bg-slate-900 text-white hover:bg-slate-800' : undefined
                      )}
                    >
                      <Layers3 className="mr-2 h-4 w-4" />
                      {hasVariants ? 'Tắt phân loại nhóm hàng' : 'Thêm phân loại nhóm hàng'}
                    </Button>
                  </div>
                </div>

                {!hasVariants ? (
                  <div className="grid gap-5 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá bán (VNĐ)</FormLabel>
                          <FormControl>
                            <Input
                              className="h-12 rounded-2xl border-slate-200 font-mono font-semibold text-slate-900"
                              placeholder="Nhập giá bán"
                              value={field.value ? new Intl.NumberFormat('vi-VN').format(field.value) : ''}
                              onChange={(event) => field.onChange(parseCurrencyInput(event.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số lượng tồn kho</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              className="h-12 rounded-2xl border-slate-200"
                              {...field}
                              onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>Tự động suy ra trạng thái còn hàng / hết hàng khi lưu.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU sản phẩm</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <Input
                                placeholder="Ví dụ: ADE-001"
                                className="h-12 rounded-2xl border-slate-200 pl-10 font-mono uppercase"
                                {...field}
                                value={field.value || ''}
                                onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <VariantOptionBuilder
                      title="Nhóm phân loại 1"
                      subtitle="Ví dụ: Quy cách, Trọng lượng, Dung tích..."
                      nameValue={variantGroup1Name}
                      onNameChange={setVariantGroup1Name}
                      draftValue={variantGroup1Draft}
                      onDraftChange={setVariantGroup1Draft}
                      onDraftSubmit={() => addVariantOption(1)}
                      options={variantGroup1Options}
                      onRemoveOption={(option) => removeVariantOption(1, option)}
                    />

                    {hasSecondVariantGroup ? (
                      <VariantOptionBuilder
                        title="Nhóm phân loại 2"
                        subtitle="Ví dụ: Màu sắc, Mùi hương, Chất liệu..."
                        nameValue={variantGroup2Name}
                        onNameChange={setVariantGroup2Name}
                        draftValue={variantGroup2Draft}
                        onDraftChange={setVariantGroup2Draft}
                        onDraftSubmit={() => addVariantOption(2)}
                        options={variantGroup2Options}
                        onRemoveOption={(option) => removeVariantOption(2, option)}
                        showRemoveGroup
                        onRemoveGroup={() => setHasSecondVariantGroup(false)}
                      />
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setHasSecondVariantGroup(true)}
                        className="rounded-2xl border-dashed"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm nhóm phân loại 2
                      </Button>
                    )}

                    <div className="rounded-3xl border border-slate-200 bg-white">
                      <div className="border-b border-slate-200 px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Tags className="h-4 w-4 text-slate-500" />
                          <p className="text-sm font-semibold text-slate-900">Bảng giá & kho theo phân loại</p>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Bảng này tự động sinh ra từ các thuộc tính bạn vừa khai báo.
                        </p>
                      </div>

                      {variantRows.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                  Tên phân loại
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                  Giá bán
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                  Kho hàng
                                </th>
                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                  SKU phân loại
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {variantRows.map((variant) => (
                                <tr key={variant.key}>
                                  <td className="px-5 py-4 text-sm font-medium text-slate-900">{variant.label}</td>
                                  <td className="px-5 py-4">
                                    <Input
                                      value={
                                        variant.price
                                          ? new Intl.NumberFormat('vi-VN').format(variant.price)
                                          : ''
                                      }
                                      onChange={(event) =>
                                        updateVariantRow(
                                          variant.key,
                                          'price',
                                          parseCurrencyInput(event.target.value)
                                        )
                                      }
                                      className="h-11 min-w-[150px] rounded-xl border-slate-200 font-mono"
                                      placeholder="Giá bán"
                                    />
                                  </td>
                                  <td className="px-5 py-4">
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={variant.stockQuantity}
                                      onChange={(event) =>
                                        updateVariantRow(
                                          variant.key,
                                          'stockQuantity',
                                          Number(event.target.value) || 0
                                        )
                                      }
                                      className="h-11 min-w-[120px] rounded-xl border-slate-200"
                                      placeholder="Kho"
                                    />
                                  </td>
                                  <td className="px-5 py-4">
                                    <Input
                                      value={variant.sku}
                                      onChange={(event) =>
                                        updateVariantRow(
                                          variant.key,
                                          'sku',
                                          event.target.value.toUpperCase()
                                        )
                                      }
                                      className="h-11 min-w-[180px] rounded-xl border-slate-200 font-mono uppercase"
                                      placeholder="SKU phân loại"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="px-5 py-10 text-center text-sm text-slate-500">
                          Chưa có phân loại nào được sinh ra. Hãy khai báo ít nhất 1 thuộc tính cho nhóm phân loại 1.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard
              id="shipping-info"
              title="Vận chuyển"
              description="Khai báo cân nặng và kích thước đóng gói để sẵn sàng cho tính toán vận chuyển, kho vận và niêm yết đa kênh."
              icon={<Truck className="h-5 w-5" />}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="weightGram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cân nặng (gram)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Ví dụ: 2500"
                          className="h-12 rounded-2xl border-slate-200"
                          {...field}
                          onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-5 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="packageLengthCm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dài (cm)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Ruler className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              className="h-12 rounded-2xl border-slate-200 pl-10"
                              {...field}
                              onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packageWidthCm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rộng (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            className="h-12 rounded-2xl border-slate-200"
                            {...field}
                            onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="packageHeightCm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cao (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            className="h-12 rounded-2xl border-slate-200"
                            {...field}
                            onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-6 space-y-4">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-900">Điều hướng nhanh</CardTitle>
                  <CardDescription>Cuộn nhanh tới từng nhóm thông tin như Seller Center.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {SECTION_ITEMS.map((section, index) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition',
                        activeSection === section.id
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                            activeSection === section.id
                              ? 'bg-white/15 text-white'
                              : 'bg-white text-slate-600'
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium">{section.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-slate-900">Ngành hàng đang chọn</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {selectedCategory?.name || 'Chưa chọn ngành hàng cho sản phẩm này.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>

        <div className="sticky bottom-0 z-20 mt-8 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Thao tác này sẽ lưu ảnh bìa, gallery, giá bán, tồn kho, biến thể và dữ liệu vận chuyển của sản phẩm.
            </p>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[180px] bg-[#2E7D32] hover:bg-[#1B5E20]"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? 'Đang lưu...' : 'Lưu & Hiển thị'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
