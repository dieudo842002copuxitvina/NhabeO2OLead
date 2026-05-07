"use server";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LEAD SERVER ACTIONS                                              ║
 * ║  CRUD operations for Lead management using Prisma                      ║
 * ║  CRM - Quản lý Khách hàng Tiềm năng                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * NOTE: Database uses snake_case field names matching Prisma schema
 */

import { revalidatePath } from "next/cache";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";
import type { Lead, LeadNormalized, DealerBasic, LeadsResult, LeadResult } from "@/types/lead";
import { calculateDistance, findNearestDealer, isValidCoordinate } from "@/lib/geo";
import { assignLeadToDealer, createLeadWithRouting, type RoutingResult, type LeadData } from "@/lib/routing";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern for production)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
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
    latitude: lead.latitude ?? null,
    longitude: lead.longitude ?? null,
    distanceKm: lead.distance_km ? Number(lead.distance_km) : null,
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
      data: data.map((lead) => normalizeLead(lead as unknown as Lead)),
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

    return { success: true, data: normalizeLead(lead as unknown as Lead) };
  } catch (error) {
    console.error("getLeadById error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET ACTIVE DEALERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Get list of active dealers for dropdown
 */
export async function getActiveDealers(): Promise<DealerBasic[]> {
  try {
    const dealers = await prisma.dealer.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        province: true,
        district: true,
        phone: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { created_at: "desc" },
    });

    return dealers;
  } catch (error) {
    console.error("getActiveDealers error:", error);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ASSIGN LEAD TO DEALER (Server Action)
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

    // Update lead (status: 'assigned' for newly assigned leads)
    const updatedLead = await prisma.leads.update({
      where: { id: validated.leadId },
      data: {
        assigned_dealer_id: validated.dealerId,
        status: "assigned",
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
      data: normalizeLead(updatedLead as unknown as Lead),
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

    return { success: true, data: normalizeLead(updatedLead as unknown as Lead) };
  } catch (error) {
    console.error("updateLeadStatus error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UPDATE CALCULATOR LEAD STATUS (O2O)
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Update status for calculator_leads (O2O routing)
 */
export async function updateCalculatorLeadStatus(
  leadId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const lead = await prisma.calculator_leads.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return { success: false, error: "Không tìm thấy lead" };
    }

    await prisma.calculator_leads.update({
      where: { id: leadId },
      data: { status },
    });

    revalidatePath("/admin/leads");
    revalidatePath("/dealer/dashboard");

    return { success: true };
  } catch (error) {
    console.error("updateCalculatorLeadStatus error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CALCULATOR: Submit Calculator & Auto-Create Lead (CRM Integration)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface CalculatorLeadData {
  customerName: string;
  customerPhone: string;
  province?: string;
  district?: string;
  cropType?: string;
  areaM2?: number;
  latitude?: number;
  longitude?: number;
  calculatorType: 'pump' | 'roi' | 'bom';
  calculatorData: Record<string, any>;
  // Pre-assigned dealer (bypass Round-Robin, e.g. from dealer profile CTA)
  assignedDealer?: string | null;
  // UTM Tracking
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}

export async function submitCalculatorAndCreateLead(
  data: CalculatorLeadData
): Promise<{ success: boolean; leadId?: string; assignedDealerId?: string; distanceKm?: number; error?: string }> {
  try {
    // 1. Validate required fields
    if (!data.customerPhone?.trim()) {
      return { success: false, error: 'Số điện thoại là bắt buộc' };
    }

    // 2. Validate phone format (Vietnamese)
    const phoneRegex = /^(0[0-9]{9,10})$/;
    if (!phoneRegex.test(data.customerPhone.replace(/\s/g, ''))) {
      return { success: false, error: 'Số điện thoại không hợp lệ (VD: 0912345678)' };
    }

    // 3. Geo-matching: Find nearest active dealer if coordinates are provided
    let assignedDealerId: string | undefined;
    let distanceKm: number | undefined;
    let status = 'new';

    if (
      typeof data.latitude === 'number' &&
      typeof data.longitude === 'number' &&
      isValidCoordinate(data.latitude, data.longitude)
    ) {
      try {
        // Fetch all active dealers with coordinates
        const activeDealers = await prisma.dealer.findMany({
          where: {
            is_active: true,
            latitude: { not: null },
            longitude: { not: null },
          },
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
          },
        });

        if (activeDealers.length > 0) {
          // Find nearest dealer using Haversine formula
          const nearest = findNearestDealer(data.latitude, data.longitude, activeDealers);

          if (nearest) {
            assignedDealerId = nearest.dealer.id;
            distanceKm = nearest.distanceKm;
            status = 'assigned';
            console.log(`[Geo-Matching] Lead matched to dealer "${nearest.dealer.name}" (${nearest.distanceKm} km)`);
          }
        }
      } catch (geoError) {
        // Geo-matching failure should not block lead creation
        console.error('[Geo-Matching] Error finding nearest dealer:', geoError);
      }
    }

    // 4. Insert into leads table with Prisma
    const newLead = await prisma.leads.create({
      data: {
        customer_name: data.customerName?.trim() || null,
        customer_phone: data.customerPhone.replace(/\s/g, ''),
        province: data.province || null,
        district: data.district || null,
        crop_type: data.cropType || null,
        area_m2: data.areaM2 ? new Prisma.Decimal(data.areaM2) : null,
        latitude: typeof data.latitude === 'number' ? data.latitude : null,
        longitude: typeof data.longitude === 'number' ? data.longitude : null,
        distance_km: typeof distanceKm === 'number' ? distanceKm : null,
        calculator_data: {
          type: data.calculatorType,
          submitted_at: new Date().toISOString(),
          ...data.calculatorData,
        },
        assigned_dealer_id: assignedDealerId || null,
        status: status,
      },
    });

    // 4.1 UTM Tracking (log only - calculator_leads table pending schema sync)
    if (data.utmSource || data.utmMedium || data.utmCampaign || data.utmContent || data.utmTerm) {
      // Log UTM params for tracking
      console.log(`[UTM Tracking] Lead UTM: source=${data.utmSource}, medium=${data.utmMedium}, campaign=${data.utmCampaign}, content=${data.utmContent}`);
      // Note: Insert to calculator_leads pending Prisma schema sync
      // TODO: Run `npx prisma db push` to sync schema
    }

    console.log(`[Calculator→CRM] Created lead ${newLead.id} from ${data.calculatorType} calculator`);

    // 5. Revalidate admin leads page for real-time update
    revalidatePath('/admin/leads');

    // 6. Optionally trigger n8n webhook (non-blocking)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'calculator_lead_created',
            lead_id: newLead.id,
            customer_phone: data.customerPhone,
            calculator_type: data.calculatorType,
            province: data.province,
            crop_type: data.cropType,
            assigned_dealer_id: assignedDealerId,
            distance_km: distanceKm,
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        }).catch(() => {
          // Non-fatal webhook error
        });

        clearTimeout(timeoutId);
      } catch {
        // Non-fatal webhook error
      }
    }

    return { success: true, leadId: newLead.id, assignedDealerId, distanceKm };
  } catch (error) {
    console.error('[Calculator→CRM] Error creating lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi tạo lead',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CALCULATOR: Submit to calculator_leads with O2O Routing
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Submit calculator result directly to calculator_leads table
 * with automatic O2O routing by province/district
 */
export async function submitCalculatorLeadWithRouting(
  data: CalculatorLeadData & { 
    bomItems?: Array<{ item: string; qty: number; unit: string; unitPrice: number; subtotal: number }>;
    totalCost?: number;
  }
): Promise<{ 
  success: boolean; 
  leadId?: string; 
  assignedDealerId?: string | null;
  assignedDealerName?: string | null;
  dealerZaloNumber?: string | null;
  routingResult?: RoutingResult;
  error?: string 
}> {
  try {
    // 1. Validate required fields
    if (!data.customerPhone?.trim()) {
      return { success: false, error: 'Số điện thoại là bắt buộc' };
    }

    // 2. Validate phone format (Vietnamese)
    const phoneRegex = /^(0[0-9]{9,10})$/;
    if (!phoneRegex.test(data.customerPhone.replace(/\s/g, ''))) {
      return { success: false, error: 'Số điện thoại không hợp lệ (VD: 0912345678)' };
    }

    // 3. O2O Routing: Use createLeadWithRouting from routing.ts (handles Round-Robin atomically)
    let routingResult: RoutingResult = { dealerId: null, dealerName: null, matchType: "none" };

    // Fetch UTM from URL params
    let utmSource: string | null = data.utmSource || null;
    let utmMedium: string | null = data.utmMedium || null;
    let utmCampaign: string | null = data.utmCampaign || null;
    let utmContent: string | null = data.utmContent || null;
    let utmTerm: string | null = data.utmTerm || null;
    
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      utmSource = params.get('utm_source') || utmSource;
      utmMedium = params.get('utm_medium') || utmMedium;
      utmCampaign = params.get('utm_campaign') || utmCampaign;
      utmContent = params.get('utm_content') || utmContent;
      utmTerm = params.get('utm_term') || utmTerm;
    }

    const leadData: LeadData = {
      customer_name: data.customerName,
      customer_phone: data.customerPhone.replace(/\s/g, ''),
      crop_type: data.cropType,
      area_ha: data.areaM2 ? data.areaM2 / 10000 : undefined,
      province: data.province,
      district: data.district,
      calculator_data: {
        type: data.calculatorType,
        submitted_at: new Date().toISOString(),
        crop_type: data.cropType,
        area_ha: data.areaM2 ? data.areaM2 / 10000 : null,
        bomItems: data.bomItems || [],
        totalCost: data.totalCost || 0,
        ...data.calculatorData,
      },
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm,
    };

    const routingResponse = await createLeadWithRouting(
      leadData,
      data.latitude,
      data.longitude,
      data.assignedDealer || undefined
    );

    if (!routingResponse.success) {
      return { success: false, error: routingResponse.error || 'Lỗi khi tạo lead' };
    }

    routingResult = {
      dealerId: routingResponse.dealerId || null,
      dealerName: routingResponse.dealerName || null,
      matchType: routingResponse.matchType,
    };

    // 4. Fetch dealer contact info (zalo_number, phone) for Zalo deep link
    let dealerZaloNumber: string | null = null;
    
    if (routingResult.dealerId) {
      try {
        const dealerInfo = await prisma.dealer.findUnique({
          where: { id: routingResult.dealerId },
          select: { zalo_number: true, phone: true },
        });
        // Prefer zalo_number, fall back to phone
        dealerZaloNumber = dealerInfo?.zalo_number || dealerInfo?.phone || null;
      } catch (err) {
        console.error('[O2O] Error fetching dealer zalo_number:', err);
      }
    }

    console.log(`[O2O→CalculatorLeads] Created lead ${routingResponse.leadId}, dealer=${routingResult.dealerName}, zalo=${dealerZaloNumber || 'fallback'}`);

    return { 
      success: true, 
      leadId: routingResponse.leadId,
      assignedDealerId: routingResult.dealerId,
      assignedDealerName: routingResult.dealerName,
      dealerZaloNumber,
      routingResult,
    };
  } catch (error) {
    console.error('[O2O Routing→CalculatorLeads] Error creating lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi tạo lead',
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * DEALER: Get leads assigned to a specific dealer
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Get calculator leads assigned to a specific dealer
 */
export async function getDealerCalculatorLeads(dealerId: string): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    customer_name: string | null;
    customer_phone: string;
    province: string | null;
    district: string | null;
    crop_type: string | null;
    area_ha: number | null;
    calculator_data: any;
    status: string;
    created_at: Date;
  }>;
  error?: string;
}> {
  try {
    const leads = await prisma.calculator_leads.findMany({
      where: { assigned_dealer_id: dealerId },
      select: {
        id: true,
        customer_name: true,
        customer_phone: true,
        province: true,
        district: true,
        crop_type: true,
        area_ha: true,
        calculator_data: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      data: leads.map(lead => ({
        ...lead,
        area_ha: lead.area_ha ? Number(lead.area_ha) : null,
      })),
    };
  } catch (error) {
    console.error('[Dealer Leads] Error fetching leads:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi lấy danh sách lead',
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
