/**
 * BRANDS LIBRARY — Server-side brand data from database.
 * Single source of truth for brand metadata.
 * Use in Server Components / Route Handlers only.
 */

import { PrismaClient } from "@prisma/client";

const _global = globalThis as unknown as { _prisma: PrismaClient };
const prisma = _global._prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") _global._prisma = prisma;

export type Brand = Awaited<ReturnType<typeof getAllBrands>>[number];

/** Returns all active brands ordered by name */
export async function getAllBrands() {
  return prisma.brand.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo_url: true,
      description: true,
      website: true,
      origin_country: true,
      is_active: true,
    },
  });
}

/** Returns a single brand by slug with its active products, or null if not found */
export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        where: { is_active: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          image_url: true,
          base_price: true,
          specifications: true,
          categories: { select: { name: true } },
        },
      },
    },
  });
}

/** Returns brands that have active products, with product count */
export async function getBrandsWithProducts() {
  return prisma.brand.findMany({
    where: { is_active: true },
    include: {
      _count: { select: { products: { where: { is_active: true } } } },
    },
    orderBy: { name: "asc" },
  });
}
