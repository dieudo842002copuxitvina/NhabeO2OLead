/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  O2O ROUTING ENGINE - Lead Auto-Assignment with Round-Robin             ║
 * ║  Automatically routes calculator leads to the appropriate dealer           ║
 * ║  based on province/district matching with Round-Robin distribution         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Logic:
 * 1. Find all active dealers matching the province
 * 2. Apply Round-Robin: sort by lastAssignedAt ASC (null = never assigned first)
 * 3. Select the first dealer in the sorted list
 * 4. Use transaction to insert lead AND update dealer's lastAssignedAt atomically
 * 5. Fallback to nearest dealer by coordinates (if available)
 * 6. Fallback to Default Dealer (Nhà Bè Agri HQ) if no local dealer found
 * 7. Return null if no dealer found → queue for admin manual handling
 */

import { PrismaClient } from "@prisma/client";
import { calculateDistance, isValidCoordinate } from "@/lib/geo";
import { sendEmail } from "@/lib/mail";
import { NewLeadEmail } from "@/emails/NewLeadEmail";

/* ═══════════════════════════════════════════════════════════════════════════════
 * DEFAULT DEALER CONSTANTS (Fallback for white areas)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export const DEFAULT_DEALER = {
  id: "default-hq",
  name: "Tổng đài Nhà Bè Agri",
  zaloOALink: "https://zalo.me/0909123456",
  phone: "0909123456",
} as const;

export const ZALO_OA_FALLBACK = DEFAULT_DEALER.zaloOALink;

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

export interface RoutingResult {
  dealerId: string | null;
  dealerName: string | null;
  matchType: "exact_district" | "province_only" | "nearest_geo" | "none" | "direct_assignment" | "fallback_hq";
  distanceKm?: number;
  isFallback?: boolean;
  fallbackReason?: string;
}

export interface DealerLocation {
  id: string;
  name: string;
  province: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  lastAssignedAt: Date | null;
}

export interface LeadData {
  customer_name?: string;
  customer_phone: string;
  crop_type?: string;
  area_ha?: number;
  province?: string;
  district?: string;
  calculator_data?: Record<string, unknown>;
  results?: Record<string, unknown>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer_url?: string;
}

export interface CreateLeadWithRoutingResult {
  success: boolean;
  leadId?: string;
  dealerId?: string | null;
  dealerName?: string | null;
  matchType: RoutingResult["matchType"];
  isFallback?: boolean;
  fallbackReason?: string;
  error?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CORE ROUTING LOGIC
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Normalize province name for matching
 * Handles variations like "Tỉnh Đắk Lắk" vs "Đắk Lắk" vs "Dak Lak"
 */
function normalizeProvince(province: string): string {
  return province
    .toLowerCase()
    .replace(/^(tỉnh\s+|thành phố\s+|tp\.?\s*)/i, "") // Remove prefix
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")           // Normalize accents
    .replace(/[èéẹảẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/[đ]/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalize district name for matching
 */
function normalizeDistrict(district: string): string {
  return district
    .toLowerCase()
    .replace(/^(quận|q\.|huyện|thị xã|tx\.|thành phố|tp\.?)\s*/i, "") // Remove prefix
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[èéẹảẽêềếệểễ]/g, "e")
    .replace(/[ìíịỉĩ]/g, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[ùúụủũưừứựửữ]/g, "u")
    .replace(/[ỳýỵỷỹ]/g, "y")
    .replace(/[đ]/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if two strings match (with fuzzy matching)
 */
function matchesNormalized(source: string, target: string): boolean {
  const normalizedSource = normalizeProvince(source);
  const normalizedTarget = normalizeProvince(target);
  return normalizedSource === normalizedTarget ||
         normalizedSource.includes(normalizedTarget) ||
         normalizedTarget.includes(normalizedSource);
}

/**
 * Fallback: Find nearest dealer by coordinates, then fallback to HQ
 */
async function findNearestDealerFallback(
  activeDealers: DealerLocation[],
  customerLat: number,
  customerLon: number
): Promise<RoutingResult> {
  const dealersWithCoords = activeDealers.filter(
    (d) =>
      d.latitude !== null &&
      d.longitude !== null &&
      isValidCoordinate(d.latitude, d.longitude)
  );

  if (dealersWithCoords.length > 0) {
    let minDistance = Infinity;
    let nearestDealer: DealerLocation | null = null;

    for (const dealer of dealersWithCoords) {
      const distance = calculateDistance(
        customerLat,
        customerLon,
        dealer.latitude!,
        dealer.longitude!
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestDealer = dealer;
      }
    }

    if (nearestDealer) {
      console.log(
        `[O2O Routing] Geo fallback match: ${nearestDealer.name} (${minDistance.toFixed(1)}km)`
      );
      return {
        dealerId: nearestDealer.id,
        dealerName: nearestDealer.name,
        matchType: "nearest_geo",
        distanceKm: Number(minDistance.toFixed(3)),
      };
    }
  }

  // No dealer found anywhere → Fallback to HQ
  console.log(`[O2O Routing] No dealers available → Falling back to HQ`);
  return {
    dealerId: DEFAULT_DEALER.id,
    dealerName: DEFAULT_DEALER.name,
    matchType: "fallback_hq",
    isFallback: true,
    fallbackReason: "Không có đại lý trong khu vực",
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * MAIN ROUTING FUNCTION
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Assign a lead to the most appropriate dealer using Round-Robin within province
 * 
 * @param province - Customer's province (required)
 * @param district - Customer's district (optional)
 * @param customerLat - Customer's latitude (optional, for geo-matching)
 * @param customerLon - Customer's longitude (optional, for geo-matching)
 * @returns RoutingResult with dealer info or null if no match
 * 
 * Round-Robin Logic:
 * 1. Find all active dealers matching the province
 * 2. Sort by lastAssignedAt ASC (null values first = never assigned dealers priority)
 * 3. Return the first dealer in the sorted list
 * 
 * @example
 * const result = await assignLeadToDealer("Đắk Lắk", "Buôn Ma Thuột", 12.5, 108.2);
 * if (result.dealerId) {
 *   console.log(`Lead routed to ${result.dealerName} (${result.matchType})`);
 * }
 */
export async function assignLeadToDealer(
  province: string,
  district?: string,
  customerLat?: number,
  customerLon?: number
): Promise<RoutingResult> {
  if (!province?.trim()) {
    console.warn("[O2O Routing] No province provided, cannot route");
    return { dealerId: null, dealerName: null, matchType: "none" };
  }

  const normalizedDistrict = district ? normalizeDistrict(district) : null;

  try {
    // Step 1: Fetch all active dealers with lastAssignedAt for Round-Robin
    const activeDealers = await prisma.dealer.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        province: true,
        district: true,
        latitude: true,
        longitude: true,
        is_active: true,
        lastAssignedAt: true,
      },
    });

    if (activeDealers.length === 0) {
      console.warn("[O2O Routing] No active dealers found");
      return { dealerId: null, dealerName: null, matchType: "none" };
    }

    // Step 2: Filter dealers by province match
    const provinceMatchDealers = activeDealers.filter((dealer) => {
      if (!dealer.province) return false;
      return matchesNormalized(province, dealer.province);
    });

    if (provinceMatchDealers.length === 0) {
      console.warn(`[O2O Routing] No dealers found for province: "${province}"`);
      
      // Fallback: Try nearest by coordinates if available
      if (
        typeof customerLat === "number" &&
        typeof customerLon === "number" &&
        isValidCoordinate(customerLat, customerLon)
      ) {
        return await findNearestDealerFallback(activeDealers, customerLat, customerLon);
      }
      
      return { dealerId: null, dealerName: null, matchType: "none" };
    }

    // Step 3: Try exact district + province match first (if district provided)
    if (normalizedDistrict) {
      const districtMatch = provinceMatchDealers.find((dealer) => {
        if (!dealer.district) return false;
        return normalizeDistrict(dealer.district) === normalizedDistrict;
      });

      if (districtMatch) {
        console.log(`[O2O Routing] District match: "${district}" → "${districtMatch.name}"`);
        return {
          dealerId: districtMatch.id,
          dealerName: districtMatch.name,
          matchType: "exact_district",
        };
      }
    }

    // Step 4: Apply Round-Robin - Sort by lastAssignedAt ASC (null = never assigned = first)
    // Dealers with null lastAssignedAt come first, then by assignment time
    const roundRobinDealers = [...provinceMatchDealers].sort((a, b) => {
      // null values (never assigned) come first
      if (a.lastAssignedAt === null && b.lastAssignedAt === null) return 0;
      if (a.lastAssignedAt === null) return -1;
      if (b.lastAssignedAt === null) return 1;
      // Both have been assigned - sort by lastAssignedAt ascending (oldest first)
      return a.lastAssignedAt.getTime() - b.lastAssignedAt.getTime();
    });

    const selectedDealer = roundRobinDealers[0];

    if (selectedDealer) {
      console.log(
        `[O2O Routing] Round-Robin select: "${selectedDealer.name}" ` +
        `(lastAssignedAt: ${selectedDealer.lastAssignedAt || "never"})`
      );
      return {
        dealerId: selectedDealer.id,
        dealerName: selectedDealer.name,
        matchType: "province_only",
      };
    }

    // Fallback: Try nearest by coordinates if available
    if (
      typeof customerLat === "number" &&
      typeof customerLon === "number" &&
      isValidCoordinate(customerLat, customerLon)
    ) {
      return await findNearestDealerFallback(activeDealers, customerLat, customerLon);
    }

    // Step 5: No match found anywhere → Fallback to HQ
    console.log(`[O2O Routing] No dealer found for "${province}" / "${district || "N/A"}" → Falling back to HQ`);
    return {
      dealerId: DEFAULT_DEALER.id,
      dealerName: DEFAULT_DEALER.name,
      matchType: "fallback_hq",
      isFallback: true,
      fallbackReason: "Vùng trắng - chưa có đại lý phủ sóng",
    };
  } catch (error) {
    console.error("[O2O Routing] Error during routing:", error);
    // On error, fallback to HQ instead of returning null
    return {
      dealerId: DEFAULT_DEALER.id,
      dealerName: DEFAULT_DEALER.name,
      matchType: "fallback_hq",
      isFallback: true,
      fallbackReason: "Lỗi hệ thống - kết nối tổng đài",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TRANSACTIONAL LEAD CREATION WITH ROUTING
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Create a calculator lead with automatic dealer routing using Round-Robin
 * 
 * This function performs the following atomically:
 * 1. If assigned_dealer is provided and valid, skip routing and use that dealer directly
 * 2. Otherwise, route lead to appropriate dealer using Round-Robin
 * 3. Insert the lead into calculator_leads table with assigned dealer
 * 4. Update dealer's lastAssignedAt timestamp
 * 
 * @param leadData - Lead information from calculator
 * @param customerLat - Customer's latitude (optional, for geo-matching)
 * @param customerLon - Customer's longitude (optional, for geo-matching)
 * @param assignedDealerId - Pre-assigned dealer ID from URL (bypasses Round-Robin)
 * @returns CreateLeadWithRoutingResult with lead ID and routing info
 * 
 * @example
 * // Normal routing (Round-Robin)
 * const result = await createLeadWithRouting({ customer_phone: "0909...", province: "Đắk Lắk" });
 * 
 * // Direct assignment (from dealer profile CTA)
 * const result = await createLeadWithRouting({ customer_phone: "0909...", province: "Đắk Lắk" }, undefined, undefined, "dealer-uuid");
 */
export async function createLeadWithRouting(
  leadData: LeadData,
  customerLat?: number,
  customerLon?: number,
  assignedDealerId?: string | null
): Promise<CreateLeadWithRoutingResult> {
  const { province, district } = leadData;

  try {
    let routingResult: RoutingResult;

    // Step 1: Check for pre-assigned dealer (bypass Round-Robin)
    if (assignedDealerId) {
      // Validate the assigned dealer exists and is active
      const assignedDealer = await prisma.dealer.findUnique({
        where: { id: assignedDealerId },
        select: { id: true, name: true, is_active: true },
      });

      if (assignedDealer && assignedDealer.is_active) {
        console.log(
          `[O2O Routing] Direct assignment bypass — using pre-assigned dealer: ` +
          `"${assignedDealer.name}" (${assignedDealer.id})`
        );
        routingResult = {
          dealerId: assignedDealer.id,
          dealerName: assignedDealer.name,
          matchType: "direct_assignment",
        };
      } else {
        console.warn(
          `[O2O Routing] Assigned dealer "${assignedDealerId}" not found or inactive, ` +
          `falling back to Round-Robin`
        );
        // Fall through to normal routing
        routingResult = await assignLeadToDealer(
          province || "",
          district,
          customerLat,
          customerLon
        );
      }
    } else {
      // Step 2: Normal routing (Round-Robin)
      routingResult = await assignLeadToDealer(
        province || "",
        district,
        customerLat,
        customerLon
      );
    }

    const now = new Date();

    // Step 2: Create lead and update dealer atomically using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the calculator lead
      const newLead = await tx.calculator_leads.create({
        data: {
          customer_name: leadData.customer_name,
          customer_phone: leadData.customer_phone,
          crop_type: leadData.crop_type,
          area_ha: leadData.area_ha,
          province: leadData.province,
          district: leadData.district,
          calculator_data: leadData.calculator_data as object || {},
          results: leadData.results as object || {},
          assigned_dealer_id: routingResult.dealerId,
          status: routingResult.dealerId ? "assigned" : "new",
          utm_source: leadData.utm_source,
          utm_medium: leadData.utm_medium,
          utm_campaign: leadData.utm_campaign,
          utm_content: leadData.utm_content,
          utm_term: leadData.utm_term,
          referrer_url: leadData.referrer_url,
        },
      });

      // Update dealer's lastAssignedAt if dealer was assigned (skip for HQ fallback)
      if (routingResult.dealerId && routingResult.dealerId !== DEFAULT_DEALER.id) {
        await tx.dealer.update({
          where: { id: routingResult.dealerId },
          data: { lastAssignedAt: now },
        });
        
        console.log(
          `[O2O Routing] Lead ${newLead.id} created and assigned to dealer ` +
          `"${routingResult.dealerName}" (lastAssignedAt updated to ${now.toISOString()})`
        );
      } else if (routingResult.dealerId === DEFAULT_DEALER.id) {
        // HQ fallback - lead is still "assigned" to HQ
        console.log(
          `[O2O Routing] Lead ${newLead.id} created and routed to HQ ` +
          `(isFallback: ${routingResult.isFallback}, reason: ${routingResult.fallbackReason})`
        );
      } else {
        console.log(
          `[O2O Routing] Lead ${newLead.id} created with no dealer assigned ` +
          `(status: "new" for admin manual handling)`
        );
      }

      return {
        leadId: newLead.id,
        dealerId: routingResult.dealerId,
        dealerName: routingResult.dealerName,
        matchType: routingResult.matchType,
      };
    });

    // Step 3: Send email notification to dealer (non-blocking)
    if (result.dealerId && result.dealerName) {
      sendLeadNotificationEmail({
        dealerId: result.dealerId,
        leadData,
        leadId: result.leadId,
      }).catch((emailError) => {
        console.error("[O2O Routing] Failed to send email notification:", emailError);
      });
    }

    return {
      success: true,
      ...result,
      isFallback: routingResult.isFallback,
      fallbackReason: routingResult.fallbackReason,
    };
  } catch (error) {
    console.error("[O2O Routing] Error creating lead with routing:", error);
    return {
      success: false,
      dealerId: null,
      dealerName: null,
      matchType: "none",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL NOTIFICATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface SendEmailParams {
  dealerId: string;
  leadData: LeadData;
  leadId: string;
}

/**
 * Send email notification to dealer about new lead
 * Non-fatal: errors are caught and logged but don't affect main flow
 */
async function sendLeadNotificationEmail(params: SendEmailParams): Promise<void> {
  const { dealerId, leadData, leadId } = params;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nhaBeAgri.vn";

  try {
    // Fetch dealer email from database
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { name: true, email: true },
    });

    if (!dealer) {
      console.warn(`[Email] Dealer ${dealerId} not found for email notification`);
      return;
    }

    // Check if dealer has email
    if (!dealer.email) {
      console.warn(`[Email] Dealer "${dealer.name}" has no email configured`);
      return;
    }

    // Send email notification
    const emailResult = await sendEmail({
      to: dealer.email,
      subject: `Nhà Bè Agri: Bạn có Lead mới từ ${leadData.province || "khu vực của bạn"}`,
      react: NewLeadEmail({
        dealerName: dealer.name,
        customerName: leadData.customer_name,
        customerPhone: leadData.customer_phone,
        province: leadData.province,
        district: leadData.district,
        cropType: leadData.crop_type,
        areaHa: leadData.area_ha ? Number(leadData.area_ha) : undefined,
        dashboardUrl: `${APP_URL}/dealer/dashboard`,
        leadId,
      }),
    });

    if (emailResult.success) {
      console.log(`[Email] Notification sent to ${dealer.email} for lead ${leadId}`);
    } else {
      console.warn(`[Email] Failed to send notification to ${dealer.email}: ${emailResult.error}`);
    }
  } catch (error) {
    console.error("[Email] Error sending lead notification:", error);
    // Don't throw - email errors should not affect the main flow
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UTILITY: Get all active dealers (for admin dropdown)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getActiveDealersForRouting(): Promise<
  Array<{
    id: string;
    name: string;
    province: string | null;
    district: string | null;
    phone: string | null;
    lastAssignedAt: Date | null;
  }>
> {
  try {
    return await prisma.dealer.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        province: true,
        district: true,
        phone: true,
        lastAssignedAt: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("[O2O Routing] Error fetching dealers:", error);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UTILITY: Get unassigned leads (for admin manual routing)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getUnassignedCalculatorLeads(limit = 50) {
  try {
    return await prisma.calculator_leads.findMany({
      where: {
        assigned_dealer_id: null,
        status: "new",
      },
      select: {
        id: true,
        customer_name: true,
        customer_phone: true,
        province: true,
        district: true,
        crop_type: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("[O2O Routing] Error fetching unassigned leads:", error);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UTILITY: Get dealer statistics for Round-Robin monitoring
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getDealerAssignmentStats() {
  try {
    const dealers = await prisma.dealer.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        province: true,
        lastAssignedAt: true,
        _count: {
          select: {
            calculator_leads: true,
          },
        },
      },
      orderBy: { lastAssignedAt: "asc" },
    });

    return dealers.map((dealer) => ({
      id: dealer.id,
      name: dealer.name,
      province: dealer.province,
      lastAssignedAt: dealer.lastAssignedAt,
      totalLeads: dealer._count.calculator_leads,
      isNeverAssigned: dealer.lastAssignedAt === null,
    }));
  } catch (error) {
    console.error("[O2O Routing] Error fetching dealer stats:", error);
    return [];
  }
}
