/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER SERVER ACTIONS                                              ║
 * ║  CRUD operations for Dealer management using Supabase + Prisma        ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { PrismaClient } from "@prisma/client";
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
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface Dealer {
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
  data?: Dealer;
  error?: string;
}

export interface DealersResult {
  success: boolean;
  data?: Dealer[];
  error?: string;
  count?: number;
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
 * NORMALIZE HELPER (PostgreSQL snake_case → TypeScript camelCase)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function normalizeDealer(raw: Record<string, unknown>): Dealer {
  return {
    id: raw.id as string,
    name: raw.name as string,
    phone: raw.phone as string | null,
    address: raw.address as string | null,
    province: raw.province as string | null,
    district: raw.district as string | null,
    latitude: raw.latitude as number | null,
    longitude: raw.longitude as number | null,
    isActive: raw.is_active as boolean,
    createdAt: new Date(raw.created_at as string),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SUPABASE IMPLEMENTATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Get all dealers with optional filtering
 * @param options - Filter and pagination options
 */
export async function getDealersSupabase(options?: {
  province?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<DealersResult> {
  try {
    const supabase = createSupabaseAdminClient();
    
    let query = supabase
      .from("dealers")
      .select("*", { count: "exact" });

    // Apply filters
    if (options?.province) {
      query = query.eq("province", options.province);
    }
    if (options?.isActive !== undefined) {
      query = query.eq("is_active", options.isActive);
    }
    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,phone.ilike.%${options.search}%,address.ilike.%${options.search}%`);
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Order by created_at desc
    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase getDealers error:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data?.map((row) => normalizeDealer(row as Record<string, unknown>)),
      count: count || data?.length || 0,
    };
  } catch (error) {
    console.error("Supabase getDealers exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get a single dealer by ID
 */
export async function getDealerByIdSupabase(id: string): Promise<DealerResult> {
  try {
    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from("dealers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Không tìm thấy đại lý" };
      }
      console.error("Supabase getDealerById error:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: normalizeDealer(data as Record<string, unknown>),
    };
  } catch (error) {
    console.error("Supabase getDealerById exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Create a new dealer
 */
export async function createDealerSupabase(
  input: CreateDealerInput
): Promise<DealerResult> {
  try {
    // Validate input
    const validated = createDealerSchema.parse(input);

    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from("dealers")
      .insert({
        name: validated.name,
        phone: validated.phone || null,
        address: validated.address || null,
        province: validated.province || null,
        district: validated.district || null,
        latitude: validated.latitude || null,
        longitude: validated.longitude || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase createDealer error:", error);
      return { success: false, error: error.message };
    }

    // Revalidate the dealers list page
    revalidatePath("/admin/dealers");

    return {
      success: true,
      data: normalizeDealer(data as Record<string, unknown>),
    };
  } catch (error) {
    console.error("Supabase createDealer exception:", error);
    
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

/**
 * Update an existing dealer
 */
export async function updateDealerSupabase(
  id: string,
  input: UpdateDealerInput
): Promise<DealerResult> {
  try {
    // Validate input
    const validated = updateDealerSchema.parse(input);

    const supabase = createSupabaseAdminClient();
    
    const updateData: Record<string, unknown> = {};
    
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.phone !== undefined) updateData.phone = validated.phone;
    if (validated.address !== undefined) updateData.address = validated.address;
    if (validated.province !== undefined) updateData.province = validated.province;
    if (validated.district !== undefined) updateData.district = validated.district;
    if (validated.latitude !== undefined) updateData.latitude = validated.latitude;
    if (validated.longitude !== undefined) updateData.longitude = validated.longitude;
    if (validated.isActive !== undefined) updateData.is_active = validated.isActive;

    const { data, error } = await supabase
      .from("dealers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase updateDealer error:", error);
      return { success: false, error: error.message };
    }

    // Revalidate both list and detail pages
    revalidatePath("/admin/dealers");
    revalidatePath(`/admin/dealers/${id}`);

    return {
      success: true,
      data: normalizeDealer(data as Record<string, unknown>),
    };
  } catch (error) {
    console.error("Supabase updateDealer exception:", error);
    
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

/**
 * Delete a dealer
 */
export async function deleteDealerSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseAdminClient();
    
    const { error } = await supabase
      .from("dealers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase deleteDealer error:", error);
      return { success: false, error: error.message };
    }

    // Revalidate the dealers list page
    revalidatePath("/admin/dealers");

    return { success: true };
  } catch (error) {
    console.error("Supabase deleteDealer exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA IMPLEMENTATION (Alternative - uncomment when using Prisma)
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Get all dealers - Prisma implementation
 */
export async function getDealers(options?: {
  province?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<DealersResult> {
  try {
    const where: Parameters<typeof prisma.dealer.findMany>[0]["where"] = {};

    if (options?.province) {
      where.province = options.province;
    }
    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
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
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.offset,
      }),
      prisma.dealer.count({ where }),
    ]);

    return {
      success: true,
      data,
      count,
    };
  } catch (error) {
    console.error("Prisma getDealers error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get a single dealer by ID - Prisma implementation
 */
export async function getDealerById(id: string): Promise<DealerResult> {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id },
      include: {
        leads: {
          select: { id: true },
          take: 5,
        },
      },
    });

    if (!dealer) {
      return { success: false, error: "Không tìm thấy đại lý" };
    }

    return { success: true, data: dealer };
  } catch (error) {
    console.error("Prisma getDealerById error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Create a new dealer - Prisma implementation
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
        isActive: true,
      },
    });

    // Revalidate
    revalidatePath("/admin/dealers");

    return { success: true, data: dealer };
  } catch (error) {
    console.error("Prisma createDealer error:", error);

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

/**
 * Update an existing dealer - Prisma implementation
 */
export async function updateDealer(
  id: string,
  input: UpdateDealerInput
): Promise<DealerResult> {
  try {
    // Validate input
    const validated = updateDealerSchema.parse(input);

    const dealer = await prisma.dealer.update({
      where: { id },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.phone !== undefined && { phone: validated.phone }),
        ...(validated.address !== undefined && { address: validated.address }),
        ...(validated.province !== undefined && { province: validated.province }),
        ...(validated.district !== undefined && { district: validated.district }),
        ...(validated.latitude !== undefined && { latitude: validated.latitude }),
        ...(validated.longitude !== undefined && { longitude: validated.longitude }),
        ...(validated.isActive !== undefined && { isActive: validated.isActive }),
      },
    });

    // Revalidate
    revalidatePath("/admin/dealers");
    revalidatePath(`/admin/dealers/${id}`);

    return { success: true, data: dealer };
  } catch (error) {
    console.error("Prisma updateDealer error:", error);

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

/**
 * Delete a dealer - Prisma implementation
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
    console.error("Prisma deleteDealer error:", error);

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
 * HELPER FUNCTIONS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Get unique provinces from all dealers
 */
export async function getDealerProvinces(): Promise<string[]> {
  try {
    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from("dealers")
      .select("province")
      .not("province", "is", null);

    if (error) {
      console.error("getDealerProvinces error:", error);
      return [];
    }

    const provinces = [...new Set(data.map((d) => d.province).filter(Boolean))];
    return provinces as string[];
  } catch (error) {
    console.error("getDealerProvinces exception:", error);
    return [];
  }
}

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
