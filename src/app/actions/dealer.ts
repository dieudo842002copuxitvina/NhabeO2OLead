/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER SERVER ACTIONS                                              ║
 * ║  CRUD operations for Dealer management using Prisma                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * NOTE: Database uses snake_case field names matching Prisma schema
 */

"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern for production)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES - Matching database schema (snake_case)
 * ═══════════════════════════════════════════════════════════════════════════════ */

// Dealer type from database (snake_case)
export interface Dealer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: Date;
}

// Normalized Dealer for frontend (camelCase)
export interface DealerNormalized {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateDealerInput {
  name: string;
  phone?: string;
  address?: string;
  province?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateDealerInput extends Partial<CreateDealerInput> {
  isActive?: boolean;
}

export interface DealerResult {
  success: boolean;
  data?: DealerNormalized;
  error?: string;
}

export interface DealersResult {
  success: boolean;
  data?: DealerNormalized[];
  error?: string;
  count?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Normalize dealer from DB (snake_case -> camelCase)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function normalizeDealer(dealer: Dealer): DealerNormalized {
  return {
    id: dealer.id,
    name: dealer.name,
    phone: dealer.phone,
    address: dealer.address,
    province: dealer.province,
    district: dealer.district,
    latitude: dealer.latitude,
    longitude: dealer.longitude,
    isActive: dealer.is_active,
    createdAt: dealer.created_at,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ZOD SCHEMAS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const createDealerSchema = z.object({
  name: z.string().min(1, "Tên đại lý không được để trống").max(255),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
  district: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

const updateDealerSchema = createDealerSchema.extend({
  isActive: z.boolean().optional(),
});

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET DEALERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Get all dealers with optional filtering and pagination
 */
export async function getDealers(options?: {
  province?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<DealersResult> {
  try {
    const where: Prisma.DealerWhereInput = {};

    if (options?.province) {
      where.province = options.province;
    }
    if (options?.isActive !== undefined) {
      where.is_active = options.isActive;
    }
    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { phone: { contains: options.search, mode: "insensitive" } },
        { address: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [data, count] = await Promise.all([
      prisma.dealer.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: options?.limit,
        skip: options?.offset,
      }),
      prisma.dealer.count({ where }),
    ]);

    return {
      success: true,
      data: data.map(normalizeDealer),
      count,
    };
  } catch (error) {
    console.error("getDealers error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get a single dealer by ID
 */
export async function getDealerById(id: string): Promise<DealerResult> {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id },
    });

    if (!dealer) {
      return { success: false, error: "Không tìm thấy đại lý" };
    }

    return { success: true, data: normalizeDealer(dealer) };
  } catch (error) {
    console.error("getDealerById error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CREATE DEALER
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Create a new dealer
 */
export async function createDealer(input: CreateDealerInput): Promise<DealerResult> {
  try {
    // Validate input
    const validated = createDealerSchema.parse(input);

    const dealer = await prisma.dealer.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        address: validated.address,
        province: validated.province,
        district: validated.district,
        latitude: validated.latitude,
        longitude: validated.longitude,
        is_active: true,
      },
    });

    // Revalidate
    revalidatePath("/admin/dealers");

    return { success: true, data: normalizeDealer(dealer) };
  } catch (error) {
    console.error("createDealer error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UPDATE DEALER
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Update an existing dealer
 */
export async function updateDealer(
  id: string,
  input: UpdateDealerInput
): Promise<DealerResult> {
  try {
    // Validate input
    const validated = updateDealerSchema.parse(input);

    const updateData: Prisma.DealerUpdateInput = {
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.phone !== undefined && { phone: validated.phone }),
      ...(validated.address !== undefined && { address: validated.address }),
      ...(validated.province !== undefined && { province: validated.province }),
      ...(validated.district !== undefined && { district: validated.district }),
      ...(validated.latitude !== undefined && { latitude: validated.latitude }),
      ...(validated.longitude !== undefined && { longitude: validated.longitude }),
      ...(validated.isActive !== undefined && { is_active: validated.isActive }),
    };

    const dealer = await prisma.dealer.update({
      where: { id },
      data: updateData,
    });

    // Revalidate
    revalidatePath("/admin/dealers");
    revalidatePath(`/admin/dealers/${id}`);

    return { success: true, data: normalizeDealer(dealer) };
  } catch (error) {
    console.error("updateDealer error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DELETE DEALER
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Delete a dealer
 */
export async function deleteDealer(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.dealer.delete({
      where: { id },
    });

    revalidatePath("/admin/dealers");

    return { success: true };
  } catch (error) {
    console.error("deleteDealer error:", error);

    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return { success: false, error: "Không tìm thấy đại lý" };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * STATISTICS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Get dealer statistics
 */
export async function getDealerStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  byProvince: Record<string, number>;
}> {
  try {
    const { success, data } = await getDealers({ limit: 1000 });

    if (!success || !data) {
      return { total: 0, active: 0, inactive: 0, byProvince: {} };
    }

    const byProvince: Record<string, number> = {};
    let active = 0;
    let inactive = 0;

    data.forEach((dealer) => {
      if (dealer.isActive) active++;
      else inactive++;

      if (dealer.province) {
        byProvince[dealer.province] = (byProvince[dealer.province] || 0) + 1;
      }
    });

    return {
      total: data.length,
      active,
      inactive,
      byProvince,
    };
  } catch (error) {
    console.error("getDealerStats error:", error);
    return { total: 0, active: 0, inactive: 0, byProvince: {} };
  }
}
