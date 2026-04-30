'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue | undefined }
  | JsonValue[];

interface UploadManyResult {
  success: boolean;
  publicUrls: string[];
  error?: string;
}

export interface CreateProductPayload {
  sku: string;
  title: string;
  brand?: string;
  categoryId: string;
  basePrice: number;
  description: string;
  gallery_images: string[];
  variants: JsonValue[];
  shipping_info: JsonValue;
  stock_quantity: number;
  specifications?: Record<string, JsonValue>;
}

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Thiếu biến môi trường Supabase. Cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function slugifyProductName(value: string) {
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

function sanitizeFileName(name: string) {
  const normalizedName = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalizedName || 'product-image';
}

async function uploadSingleProductImage(file: File) {
  const supabase = getSupabaseServerClient();
  const sanitizedName = sanitizeFileName(file.name);
  const fileExtension = sanitizedName.includes('.') ? sanitizedName.split('.').pop() : '';
  const fileStem = fileExtension ? sanitizedName.slice(0, -(fileExtension.length + 1)) : sanitizedName;
  const safeStem = fileStem || 'product-image';
  const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
  const storagePath = fileExtension
    ? `products/${uniqueSuffix}-${safeStem}.${fileExtension}`
    : `products/${uniqueSuffix}-${safeStem}`;

  const { data, error } = await supabase.storage.from('product_images').upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    console.error('Supabase Storage upload failed:', error);
    throw new Error(`Tải ảnh "${file.name}" thất bại.`);
  }

  const { data: publicUrlData } = supabase.storage.from('product_images').getPublicUrl(data.path);
  if (!publicUrlData.publicUrl) {
    throw new Error(`Không lấy được URL công khai cho ảnh "${file.name}".`);
  }

  return publicUrlData.publicUrl;
}

function normalizeSkuError(formattedSku: string) {
  return {
    success: false as const,
    error: `Mã sản phẩm (SKU) "${formattedSku}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.`,
  };
}

function isDuplicateSkuError(error: { code?: string | null; message?: string | null; details?: string | null }) {
  const haystack = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return error.code === '23505' && haystack.includes('sku');
}

function isMissingColumnError(error: { message?: string | null; details?: string | null }) {
  const haystack = `${error.message || ''} ${error.details || ''}`.toLowerCase();
  return haystack.includes('column') && (haystack.includes('does not exist') || haystack.includes('could not find'));
}

export async function uploadProductImage(formData: FormData) {
  try {
    const file = formData.get('file');
    if (!(file instanceof File)) {
      throw new Error('Không tìm thấy file ảnh trong dữ liệu gửi lên.');
    }

    const publicUrl = await uploadSingleProductImage(file);
    return {
      success: true,
      publicUrl,
    };
  } catch (error) {
    console.error('uploadProductImage failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi server không xác định.',
    };
  }
}

export async function uploadMultipleProductImages(formData: FormData): Promise<UploadManyResult> {
  try {
    const files = formData
      .getAll('files')
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (files.length === 0) {
      return {
        success: false,
        publicUrls: [],
        error: 'Không tìm thấy ảnh nào để tải lên.',
      };
    }

    const results = await Promise.allSettled(files.map((file) => uploadSingleProductImage(file)));
    const publicUrls = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
      .map((result) => result.value);
    const failedUploads = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );

    if (failedUploads.length > 0) {
      const firstReason = failedUploads[0]?.reason;
      return {
        success: false,
        publicUrls,
        error:
          firstReason instanceof Error
            ? firstReason.message
            : 'Có ít nhất một ảnh tải lên thất bại. Vui lòng thử lại.',
      };
    }

    return {
      success: true,
      publicUrls,
    };
  } catch (error) {
    console.error('uploadMultipleProductImages failed:', error);
    return {
      success: false,
      publicUrls: [],
      error: error instanceof Error ? error.message : 'Lỗi server không xác định.',
    };
  }
}

export async function createProduct(payload: CreateProductPayload) {
  try {
    const supabase = getSupabaseServerClient();
    const formattedSku = payload.sku.trim().toUpperCase();
    const title = payload.title.trim();
    const generatedSlug = slugifyProductName(title);
    const galleryImages = payload.gallery_images.filter((item) => typeof item === 'string' && item.trim().length > 0);
    const coverImage = galleryImages[0] || null;
    const galleryImagesWithoutCover = galleryImages.slice(1);
    const normalizedVariants = Array.isArray(payload.variants) ? payload.variants : [];
    const normalizedShippingInfo = payload.shipping_info ?? null;
    const normalizedSpecifications = payload.specifications ?? {};

    if (!coverImage) {
      return {
        success: false,
        error: 'Cần ít nhất 1 ảnh sản phẩm trước khi lưu.',
      };
    }

    const primaryInsertPayload = {
      slug: generatedSlug,
      sku: formattedSku,
      name: title,
      brand: payload.brand?.trim() || null,
      category_id: payload.categoryId,
      base_price: payload.basePrice,
      description: payload.description.trim(),
      image_url: coverImage,
      gallery_images: galleryImagesWithoutCover,
      variants: normalizedVariants,
      shipping_info: normalizedShippingInfo,
      stock_quantity: payload.stock_quantity,
      specifications: normalizedSpecifications,
      is_active: true,
    };

    const { data: insertedProduct, error: primaryError } = await supabase
      .from('products')
      .insert(primaryInsertPayload)
      .select()
      .single();

    if (primaryError) {
      if (isDuplicateSkuError(primaryError)) {
        return normalizeSkuError(formattedSku);
      }

      if (!isMissingColumnError(primaryError)) {
        console.error('Primary createProduct insert failed:', primaryError);
        return {
          success: false,
          error: primaryError.message || 'Không thể lưu sản phẩm.',
        };
      }

      const compatibilityInsertPayload = {
        slug: generatedSlug,
        sku: formattedSku,
        name: title,
        brand: payload.brand?.trim() || '',
        category_id: payload.categoryId,
        base_price: payload.basePrice,
        description: payload.description.trim(),
        image_url: coverImage,
        specifications: {
          ...normalizedSpecifications,
          gallery_images: galleryImagesWithoutCover,
          variants: normalizedVariants,
          shipping_info: normalizedShippingInfo,
          stock_quantity: payload.stock_quantity,
        },
        status: 'active',
      };

      const { data: compatibilityInsertedProduct, error: compatibilityError } = await supabase
        .from('products')
        .insert(compatibilityInsertPayload)
        .select()
        .single();

      if (compatibilityError) {
        if (isDuplicateSkuError(compatibilityError)) {
          return normalizeSkuError(formattedSku);
        }

        console.error('Compatibility createProduct insert failed:', compatibilityError);
        return {
          success: false,
          error: compatibilityError.message || 'Không thể lưu sản phẩm.',
        };
      }

      revalidatePath('/admin/products');
      return {
        success: true,
        data: compatibilityInsertedProduct,
      };
    }

    revalidatePath('/admin/products');
    return {
      success: true,
      data: insertedProduct,
    };
  } catch (error) {
    console.error('createProduct failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã có lỗi hệ thống xảy ra khi lưu sản phẩm.',
    };
  }
}
