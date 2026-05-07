/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER LIBRARY - Product & Inventory Queries                      ║
 * ║  Functions for fetching dealer products with inventory status             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { PrismaClient } from "@prisma/client";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface ProductWithInventory {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image_url: string | null;
  base_price: number | null;
  brand: string | null;
  stock_quantity: number | null;
  is_active: boolean;
  in_stock: boolean; // from products.in_stock
  dealer_in_stock: boolean; // from DealerInventory.in_stock
  category?: string | null;
}

export interface DealerProductsResult {
  inStockProducts: ProductWithInventory[];
  preOrderProducts: ProductWithInventory[];
  totalCount: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET DEALER PRODUCTS (with inventory from DealerInventory)
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Fetch all products managed by a dealer via DealerInventory table.
 * Products are split into "in stock" and "pre-order" categories.
 *
 * Logic:
 * - If a product has an entry in DealerInventory: use that entry's in_stock value
 * - If no entry: fall back to product's own in_stock field (global default)
 *
 * @param dealerId - The dealer's UUID
 * @returns Split arrays of in-stock and pre-order products
 */
export async function getDealerProducts(dealerId: string): Promise<DealerProductsResult> {
  try {
    // Fetch all inventory records for this dealer with product details
    const inventoryItems = await prisma.dealerInventory.findMany({
      where: { dealer_id: dealerId },
      select: {
        id: true,
        in_stock: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            image_url: true,
            base_price: true,
            brand: true,
            stock_quantity: true,
            is_active: true,
            in_stock: true, // fallback
            categories: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    // Map to unified shape
    const allProducts: ProductWithInventory[] = inventoryItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      sku: item.product.sku,
      image_url: item.product.image_url,
      base_price: item.product.base_price,
      brand: item.product.brand,
      stock_quantity: item.product.stock_quantity,
      is_active: item.product.is_active,
      in_stock: item.product.in_stock, // global fallback
      dealer_in_stock: item.in_stock, // dealer's specific setting
      category: item.product.categories?.name || null,
    }));

    // Split by dealer's inventory status
    const inStockProducts = allProducts
      .filter((p) => p.dealer_in_stock === true)
      .sort((a, b) => a.name.localeCompare(b.name));

    const preOrderProducts = allProducts
      .filter((p) => p.dealer_in_stock === false)
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      inStockProducts,
      preOrderProducts,
      totalCount: allProducts.length,
    };
  } catch (error) {
    console.error("[Dealers] Error fetching dealer products:", error);
    return { inStockProducts: [], preOrderProducts: [], totalCount: 0 };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET ALL ACTIVE PRODUCTS (for catalog / inventory management)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getActiveProducts() {
  try {
    return await prisma.products.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        image_url: true,
        base_price: true,
        brand: true,
        stock_quantity: true,
        is_active: true,
        in_stock: true,
        categories: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("[Dealers] Error fetching active products:", error);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET DEALER INVENTORY (full mapping for a dealer)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getDealerInventory(dealerId: string) {
  try {
    const items = await prisma.dealerInventory.findMany({
      where: { dealer_id: dealerId },
      select: {
        product_id: true,
        in_stock: true,
        updated_at: true,
      },
    });

    // Return as a map: product_id → in_stock
    const map: Record<string, boolean> = {};
    for (const item of items) {
      map[item.product_id] = item.in_stock;
    }
    return map;
  } catch (error) {
    console.error("[Dealers] Error fetching dealer inventory:", error);
    return {};
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UPSERT DEALER INVENTORY (add or update a product's stock status)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function upsertDealerInventoryItem(
  dealerId: string,
  productId: string,
  inStock: boolean
) {
  try {
    const item = await prisma.dealerInventory.upsert({
      where: {
        dealer_id_product_id: { dealer_id: dealerId, product_id: productId },
      },
      update: { in_stock: inStock },
      create: {
        dealer_id: dealerId,
        product_id: productId,
        in_stock: inStock,
      },
    });
    return { success: true, item };
  } catch (error) {
    console.error("[Dealers] Error upserting inventory item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * BATCH UPDATE DEALER INVENTORY (bulk save)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function batchUpdateDealerInventory(
  dealerId: string,
  updates: Array<{ productId: string; inStock: boolean }>
) {
  try {
    // Use transaction to ensure atomicity
    await prisma.$transaction(
      updates.map(({ productId, inStock }) =>
        prisma.dealerInventory.upsert({
          where: {
            dealer_id_product_id: { dealer_id: dealerId, product_id: productId },
          },
          update: { in_stock: inStock },
          create: {
            dealer_id: dealerId,
            product_id: productId,
            in_stock: inStock,
          },
        })
      )
    );

    return { success: true };
  } catch (error) {
    console.error("[Dealers] Error batch updating inventory:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
