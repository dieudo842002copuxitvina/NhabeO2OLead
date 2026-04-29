'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Khởi tạo Supabase Server Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Nhiệm vụ 1: Hàm uploadProductImage(formData)
 * Trích xuất file ảnh từ FormData và tải lên Supabase Storage bucket 'product_images'
 */
export async function uploadProductImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('Không tìm thấy file ảnh trong dữ liệu gửi lên.');
    }

    // Đặt tên file unique bằng Date.now() kết hợp random để tránh trùng lặp
    const fileExt = file.name.split('.').pop() || 'png';
    const uniqueFileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExt}`;

    // Upload file lên bucket
    const { data, error } = await supabase.storage
      .from('product_images')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Lỗi từ Supabase Storage:', error);
      throw new Error('Lỗi khi tải ảnh lên kho lưu trữ. Vui lòng thử lại.');
    }

    // Lấy PublicUrl
    const { data: publicUrlData } = supabase.storage
      .from('product_images')
      .getPublicUrl(data.path);

    return { 
      success: true, 
      publicUrl: publicUrlData.publicUrl 
    };

  } catch (error: any) {
    console.error('Lỗi ngoại lệ trong uploadProductImage:', error);
    return { success: false, error: error.message || 'Lỗi server không xác định.' };
  }
}

// Định nghĩa kiểu dữ liệu payload
export interface CreateProductPayload {
  sku: string;
  title: string;
  brand: string;
  categoryId: string;
  basePrice: number;
  description: string;
  specifications: Record<string, any>;
  imageUrl: string;
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

/**
 * Nhiệm vụ 2: Hàm createProduct(productData)
 * Lưu trữ thông tin sản phẩm (CMS) vào database, tự động viết hoa SKU và bắt lỗi trùng lặp.
 */
export async function createProduct(payload: CreateProductPayload) {
  try {
    // Tự động chuyển SKU thành chữ In Hoa và loại bỏ khoảng trắng thừa
    const formattedSku = payload.sku.trim().toUpperCase();
    const generatedSlug = slugifyProductName(payload.title);

    // Insert dữ liệu vào bảng products
    // Biến specifications (Record/JSON) được nạp thẳng vào cột JSONB
    const { data: insertedProduct, error } = await supabase
      .from('products')
      .insert({
        slug: generatedSlug,
        sku: formattedSku,
        name: payload.title,
        brand: payload.brand,
        category_id: payload.categoryId,
        base_price: payload.basePrice,
        description: payload.description,
        specifications: payload.specifications,
        image_url: payload.imageUrl,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      // Bắt lỗi Unique Violation từ PostgreSQL (mã 23505) nếu mã SKU đã tồn tại
      if (error.code === '23505') {
        return { 
          success: false, 
          error: `Mã sản phẩm (SKU) "${formattedSku}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` 
        };
      }
      
      console.error('Lỗi Database khi insert product:', error);
      return { success: false, error: error.message };
    }

    // Xóa cache của trang danh sách sản phẩm để dữ liệu mới được hiển thị ngay lập tức
    revalidatePath('/admin/products');

    return { 
      success: true,
      data: insertedProduct
    };

  } catch (error: any) {
    console.error('Lỗi ngoại lệ trong createProduct:', error);
    return { success: false, error: 'Đã có lỗi hệ thống xảy ra khi lưu sản phẩm.' };
  }
}
