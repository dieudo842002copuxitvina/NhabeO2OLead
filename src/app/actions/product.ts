'use server';

import { revalidatePath } from 'next/cache';
import { PrismaClient, Prisma } from '@prisma/client';

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern for production)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface ProductWithCategory {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_id: string;
  description: string | null;
  image_url: string | null;
  pdf_url: string | null;
  specifications: Prisma.JsonValue;
  features: Prisma.JsonValue;
  is_active: boolean;
  in_stock: boolean;
  created_at: Date;
  updated_at: Date | null;
  gallery_images: string[];
  variants: Prisma.JsonValue | null;
  shipping_info: Prisma.JsonValue | null;
  stock_quantity: number | null;
  base_price: number | null;
  brand: string | null;
  categories: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductsResult {
  success: boolean;
  data?: ProductWithCategory[];
  count?: number;
  error?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET PRODUCTS (with category)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getProducts(options?: {
  categoryId?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<ProductsResult> {
  try {
    const where: Prisma.productsWhereInput = {};

    if (options?.categoryId) {
      where.category_id = options.categoryId;
    }

    if (options?.isActive !== undefined) {
      where.is_active = options.isActive;
    }

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { sku: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [data, count] = await Promise.all([
      prisma.products.findMany({
        where,
        include: {
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: options?.limit,
        skip: options?.offset,
      }),
      prisma.products.count({ where }),
    ]);

    return {
      success: true,
      data: data as ProductWithCategory[],
      count,
    };
  } catch (error) {
    console.error('getProducts error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET PRODUCT BY ID
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getProductById(id: string): Promise<{
  success: boolean;
  data?: ProductWithCategory;
  error?: string;
}> {
  try {
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: 'Không tìm thấy sản phẩm' };
    }

    return { success: true, data: product as ProductWithCategory };
  } catch (error) {
    console.error('getProductById error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET ALL CATEGORIES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getCategories(): Promise<{
  success: boolean;
  data?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    productCount?: number;
  }[];
  error?: string;
}> {
  try {
    const categories = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: categories.map((cat) => ({
        ...cat,
        productCount: cat._count.products,
      })),
    };
  } catch (error) {
    console.error('getCategories error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CREATE PRODUCT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function createProduct(data: {
  sku: string;
  name: string;
  category_id: string;
  description?: string;
  image_url?: string;
  pdf_url?: string;
  specifications?: Record<string, unknown>;
  base_price?: number;
  brand?: string;
}): Promise<{ success: boolean; data?: ProductWithCategory; error?: string }> {
  try {
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const product = await prisma.products.create({
      data: {
        sku: data.sku.toUpperCase(),
        name: data.name,
        slug: `${slug}-${Date.now()}`,
        category_id: data.category_id,
        description: data.description || null,
        image_url: data.image_url || null,
        pdf_url: data.pdf_url || null,
        specifications: data.specifications || {},
        base_price: data.base_price || 0,
        brand: data.brand || null,
        is_active: true,
        in_stock: true,
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    revalidatePath('/admin/products');

    return { success: true, data: product as ProductWithCategory };
  } catch (error) {
    console.error('createProduct error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: 'Mã SKU đã tồn tại' };
      }
      if (error.code === 'P2003') {
        return { success: false, error: 'Danh mục không tồn tại' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UPDATE PRODUCT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    sku: string;
    category_id: string;
    description: string;
    image_url: string;
    pdf_url: string;
    specifications: Record<string, unknown>;
    is_active: boolean;
    in_stock: boolean;
    base_price: number;
    brand: string;
  }>
): Promise<{ success: boolean; data?: ProductWithCategory; error?: string }> {
  try {
    const updateData: Prisma.productsUpdateInput = { ...data };

    if (data.specifications) {
      updateData.specifications = data.specifications;
    }

    const product = await prisma.products.update({
      where: { id },
      data: updateData,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    revalidatePath('/admin/products');

    return { success: true, data: product as ProductWithCategory };
  } catch (error) {
    console.error('updateProduct error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { success: false, error: 'Sản phẩm không tồn tại' };
      }
      if (error.code === 'P2002') {
        return { success: false, error: 'Mã SKU đã tồn tại' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TOGGLE PRODUCT STATUS (Bật/Tắt hiển thị)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function toggleProductStatus(
  id: string,
  currentStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.products.update({
      where: { id },
      data: { is_active: !currentStatus },
    });

    revalidatePath('/admin/products');
    revalidatePath('/san-pham');

    return { success: true };
  } catch (error) {
    console.error('toggleProductStatus error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { success: false, error: 'Sản phẩm không tồn tại' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CREATE PRODUCT (Từ FormData)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createProductFromForm(
  formData: FormData
): Promise<{ success: boolean; data?: ProductWithCategory; error?: string }> {
  try {
    const sku = formData.get('sku') as string;
    const name = formData.get('name') as string;
    const category_id = formData.get('category_id') as string;
    const description = formData.get('description') as string | null;
    const image_url = formData.get('image_url') as string | null;
    const pdf_url = formData.get('pdf_url') as string | null;
    const base_price = formData.get('base_price') as string | null;
    const brand = formData.get('brand') as string | null;
    const specificationsStr = formData.get('specifications') as string | null;

    if (!sku || !name || !category_id) {
      return { success: false, error: 'SKU, Tên sản phẩm và Danh mục là bắt buộc' };
    }

    const slug = `${generateSlug(name)}-${Date.now()}`;

    let specifications = {};
    if (specificationsStr) {
      try {
        specifications = JSON.parse(specificationsStr);
      } catch {
        specifications = {};
      }
    }

    const product = await prisma.products.create({
      data: {
        sku: sku.toUpperCase(),
        name,
        slug,
        category_id,
        description: description || null,
        image_url: image_url || null,
        pdf_url: pdf_url || null,
        specifications,
        base_price: base_price ? parseInt(base_price, 10) : 0,
        brand: brand || null,
        is_active: true,
        in_stock: true,
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    revalidatePath('/admin/products');

    return { success: true, data: product as ProductWithCategory };
  } catch (error) {
    console.error('createProductFromForm error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { success: false, error: 'Mã SKU đã tồn tại' };
      }
      if (error.code === 'P2003') {
        return { success: false, error: 'Danh mục không tồn tại' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UPDATE PRODUCT (Từ FormData)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function updateProductFromForm(
  id: string,
  formData: FormData
): Promise<{ success: boolean; data?: ProductWithCategory; error?: string }> {
  try {
    const sku = formData.get('sku') as string | null;
    const name = formData.get('name') as string | null;
    const category_id = formData.get('category_id') as string | null;
    const description = formData.get('description') as string | null;
    const image_url = formData.get('image_url') as string | null;
    const pdf_url = formData.get('pdf_url') as string | null;
    const base_price = formData.get('base_price') as string | null;
    const brand = formData.get('brand') as string | null;
    const is_active = formData.get('is_active') as string | null;
    const in_stock = formData.get('in_stock') as string | null;
    const specificationsStr = formData.get('specifications') as string | null;

    const updateData: Prisma.productsUpdateInput = {};

    if (sku) updateData.sku = sku.toUpperCase();
    if (name) updateData.name = name;
    if (category_id) updateData.category_id = category_id;
    if (description !== null) updateData.description = description || null;
    if (image_url !== null) updateData.image_url = image_url || null;
    if (pdf_url !== null) updateData.pdf_url = pdf_url || null;
    if (base_price !== null) {
      updateData.base_price = base_price ? parseInt(base_price, 10) : null;
    }
    if (brand !== null) updateData.brand = brand || null;
    if (is_active !== null) updateData.is_active = is_active === 'true';
    if (in_stock !== null) updateData.in_stock = in_stock === 'true';

    if (specificationsStr) {
      try {
        updateData.specifications = JSON.parse(specificationsStr);
      } catch {
        // Ignore invalid JSON
      }
    }

    const product = await prisma.products.update({
      where: { id },
      data: updateData,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    revalidatePath('/admin/products');

    return { success: true, data: product as ProductWithCategory };
  } catch (error) {
    console.error('updateProductFromForm error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { success: false, error: 'Sản phẩm không tồn tại' };
      }
      if (error.code === 'P2002') {
        return { success: false, error: 'Mã SKU đã tồn tại' };
      }
      if (error.code === 'P2003') {
        return { success: false, error: 'Danh mục không tồn tại' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DELETE PRODUCT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.products.delete({
      where: { id },
    });

    revalidatePath('/admin/products');

    return { success: true };
  } catch (error) {
    console.error('deleteProduct error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { success: false, error: 'Sản phẩm không tồn tại' };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
