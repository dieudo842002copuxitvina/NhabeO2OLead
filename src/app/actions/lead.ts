/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LEAD SERVER ACTIONS                                              ║
 * ║  CRUD operations for Lead management using Prisma                      ║
 * ║  CRM - Quản lý Khách hàng Tiềm năng                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient, Prisma, LeadStatus } from "@prisma/client";
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

export interface Lead {
  id: string;
  customerName: string | null;
  customerPhone: string;
  province: string | null;
  district: string | null;
  cropType: string | null;
  areaM2: number | null;
  calculatorData: Prisma.JsonValue;
  assignedDealerId: string | null;
  status: LeadStatus;
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
  data?: Lead[];
  error?: string;
  count?: number;
}

export interface LeadResult {
  success: boolean;
  data?: Lead;
  error?: string;
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
  status?: LeadStatus;
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
        { customerName: { contains: options.search, mode: "insensitive" } },
        { customerPhone: { contains: options.search, mode: "insensitive" } },
        { province: { contains: options.search, mode: "insensitive" } },
        { district: { contains: options.search, mode: "insensitive" } },
        { cropType: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [data, count] = await Promise.all([
      prisma.leads.findMany({
        where,
        include: {
          assignedDealer: {
            select: {
              id: true,
              name: true,
              phone: true,
              province: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: options?.limit,
        skip: options?.offset,
      }),
      prisma.leads.count({ where }),
    ]);

    return {
      success: true,
      data,
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
        assignedDealer: {
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

    return { success: true, data: lead };
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
): Promise<{ success: boolean; data?: Lead; error?: string }> {
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

    if (!dealer.isActive) {
      return { success: false, error: "Đại lý đang không hoạt động" };
    }

    // Update lead
    const updatedLead = await prisma.leads.update({
      where: { id: validated.leadId },
      data: {
        assignedDealerId: validated.dealerId,
        status: "PROGRESS",
      },
      include: {
        assignedDealer: {
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
      data: updatedLead,
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
  status: LeadStatus
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
        assignedDealer: {
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

    return { success: true, data: updatedLead };
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
        cropType: true,
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
        case "NEW":
          stats.new++;
          break;
        case "PROGRESS":
          stats.inProgress++;
          break;
        case "WON":
          stats.won++;
          break;
        case "LOST":
          stats.lost++;
          break;
      }

      // Count by province
      if (lead.province) {
        stats.byProvince[lead.province] = (stats.byProvince[lead.province] || 0) + 1;
      }

      // Count by crop type
      if (lead.cropType) {
        stats.byCropType[lead.cropType] = (stats.byCropType[lead.cropType] || 0) + 1;
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
