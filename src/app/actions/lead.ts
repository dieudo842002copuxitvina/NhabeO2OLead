/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LEAD SERVER ACTIONS                                              ║
 * ║  CRUD operations for Lead management using Prisma                      ║
 * ║  CRM - Quản lý Khách hàng Tiềm năng                               ║
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

// Lead type from database (snake_case)
export interface Lead {
  id: string;
  customer_name: string | null;
  customer_phone: string;
  province: string | null;
  district: string | null;
  crop_type: string | null;
  area_m2: Prisma.Decimal | null;
  calculator_data: Prisma.JsonValue;
  assigned_dealer_id: string | null;
  status: string;
  created_at: Date;
  dealers: {
    id: string;
    name: string;
    phone: string | null;
    province: string | null;
  } | null;
}

// Normalized Lead for frontend (camelCase)
export interface LeadNormalized {
  id: string;
  customerName: string | null;
  customerPhone: string;
  province: string | null;
  district: string | null;
  cropType: string | null;
  areaM2: number | null;
  calculatorData: Prisma.JsonValue;
  assignedDealerId: string | null;
  status: string;
  createdAt: Date;
  assignedDealer: {
    id: string;
    name: string;
    phone: string | null;
    province: string | null;
  } | null;
}

export interface LeadsResult {
  success: boolean;
  data?: LeadNormalized[];
  error?: string;
  count?: number;
}

export interface LeadResult {
  success: boolean;
  data?: LeadNormalized;
  error?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Normalize lead from DB (snake_case -> camelCase)
 * ═══════════════════════════════════════════════════════════════════════════════ */

function normalizeLead(lead: Lead): LeadNormalized {
  return {
    id: lead.id,
    customerName: lead.customer_name,
    customerPhone: lead.customer_phone,
    province: lead.province,
    district: lead.district,
    cropType: lead.crop_type,
    areaM2: lead.area_m2 ? Number(lead.area_m2) : null,
    calculatorData: lead.calculator_data,
    assignedDealerId: lead.assigned_dealer_id,
    status: lead.status,
    createdAt: lead.created_at,
    assignedDealer: lead.dealers ? {
      id: lead.dealers.id,
      name: lead.dealers.name,
      phone: lead.dealers.phone,
      province: lead.dealers.province,
    } : null,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ZOD SCHEMAS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const assignLeadSchema = z.object({
  leadId: z.string().uuid("ID lead không hợp lệ"),
  dealerId: z.string().uuid("ID đại lý không hợp lệ"),
});

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET LEADS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Get all leads with optional filtering and pagination
 * Includes assigned dealer information via include
 */
export async function getLeads(options?: {
  status?: string;
  province?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<LeadsResult> {
  try {
    const where: Prisma.LeadsWhereInput = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.province) {
      where.province = { contains: options.province, mode: "insensitive" };
    }

    if (options?.search) {
      where.OR = [
        { customer_name: { contains: options.search, mode: "insensitive" } },
        { customer_phone: { contains: options.search, mode: "insensitive" } },
        { province: { contains: options.search, mode: "insensitive" } },
        { district: { contains: options.search, mode: "insensitive" } },
        { crop_type: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [data, count] = await Promise.all([
      prisma.leads.findMany({
        where,
        include: {
          dealers: {
            select: {
              id: true,
              name: true,
              phone: true,
              province: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: options?.limit,
        skip: options?.offset,
      }),
      prisma.leads.count({ where }),
    ]);

    return {
      success: true,
      data: data.map(normalizeLead),
      count,
    };
  } catch (error) {
    console.error("getLeads error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get a single lead by ID with dealer info
 */
export async function getLeadById(id: string): Promise<LeadResult> {
  try {
    const lead = await prisma.leads.findUnique({
      where: { id },
      include: {
        dealers: {
          select: {
            id: true,
            name: true,
            phone: true,
            province: true,
          },
        },
      },
    });

    if (!lead) {
      return { success: false, error: "Không tìm thấy lead" };
    }

    return { success: true, data: normalizeLead(lead) };
  } catch (error) {
    console.error("getLeadById error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ASSIGN LEAD TO DEALER
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Assign a lead to a dealer
 * Updates the assigned_dealer_id and changes status to 'progress'
 */
export async function assignLeadToDealer(
  leadId: string,
  dealerId: string
): Promise<{ success: boolean; data?: LeadNormalized; error?: string }> {
  try {
    // Validate input
    const validated = assignLeadSchema.parse({ leadId, dealerId });

    // Verify lead exists
    const lead = await prisma.leads.findUnique({
      where: { id: validated.leadId },
    });

    if (!lead) {
      return { success: false, error: "Không tìm thấy lead" };
    }

    // Verify dealer exists and is active
    const dealer = await prisma.dealer.findUnique({
      where: { id: validated.dealerId },
    });

    if (!dealer) {
      return { success: false, error: "Không tìm thấy đại lý" };
    }

    if (!dealer.is_active) {
      return { success: false, error: "Đại lý đang không hoạt động" };
    }

    // Update lead (status: 'progress' for assigned leads)
    const updatedLead = await prisma.leads.update({
      where: { id: validated.leadId },
      data: {
        assigned_dealer_id: validated.dealerId,
        status: "progress",
      },
      include: {
        dealers: {
          select: {
            id: true,
            name: true,
            phone: true,
            province: true,
          },
        },
      },
    });

    // Revalidate the leads page
    revalidatePath("/admin/leads");

    return {
      success: true,
      data: normalizeLead(updatedLead),
    };
  } catch (error) {
    console.error("assignLeadToDealer error:", error);

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
 * UPDATE LEAD STATUS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Update lead status (won, lost, etc.)
 */
export async function updateLeadStatus(
  leadId: string,
  status: string
): Promise<LeadResult> {
  try {
    const lead = await prisma.leads.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return { success: false, error: "Không tìm thấy lead" };
    }

    const updatedLead = await prisma.leads.update({
      where: { id: leadId },
      data: { status },
      include: {
        dealers: {
          select: {
            id: true,
            name: true,
            phone: true,
            province: true,
          },
        },
      },
    });

    revalidatePath("/admin/leads");

    return { success: true, data: normalizeLead(updatedLead) };
  } catch (error) {
    console.error("updateLeadStatus error:", error);
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
 * Get lead statistics for dashboard
 */
export async function getLeadStats(): Promise<{
  success: boolean;
  data?: {
    total: number;
    new: number;
    inProgress: number;
    won: number;
    lost: number;
    byProvince: Record<string, number>;
    byCropType: Record<string, number>;
  };
  error?: string;
}> {
  try {
    const leads = await prisma.leads.findMany({
      select: {
        status: true,
        province: true,
        crop_type: true,
      },
    });

    const stats = {
      total: leads.length,
      new: 0,
      inProgress: 0,
      won: 0,
      lost: 0,
      byProvince: {} as Record<string, number>,
      byCropType: {} as Record<string, number>,
    };

    leads.forEach((lead) => {
      // Count by status
      switch (lead.status) {
        case "new":
          stats.new++;
          break;
        case "progress":
          stats.inProgress++;
          break;
        case "won":
          stats.won++;
          break;
        case "lost":
          stats.lost++;
          break;
      }

      // Count by province
      if (lead.province) {
        stats.byProvince[lead.province] = (stats.byProvince[lead.province] || 0) + 1;
      }

      // Count by crop type
      if (lead.crop_type) {
        stats.byCropType[lead.crop_type] = (stats.byCropType[lead.crop_type] || 0) + 1;
      }
    });

    return { success: true, data: stats };
  } catch (error) {
    console.error("getLeadStats error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
