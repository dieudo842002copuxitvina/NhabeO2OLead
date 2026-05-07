/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  DEALER PROFILE SERVER ACTIONS                                  ║
 * ║  Update dealer profile information (zalo_number, about_us, opening_hours) ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

"use server";

import { PrismaClient } from "@prisma/client";
import { createServerClient } from "@/utils/supabase/server";
import { z } from "zod";

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

export interface DealerProfileData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  zalo_number: string | null;
  about_us: string | null;
  opening_hours: string | null;
  cover_image: string | null;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface UpdateDealerProfileResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ZOD SCHEMAS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const updateDealerSchema = z.object({
  zalo_number: z
    .string()
    .regex(/^[0-9]{9,11}$/, "Số Zalo phải là số điện thoại 9-11 chữ số")
    .optional()
    .or(z.literal("")),
  about_us: z
    .string()
    .max(2000, "Giới thiệu không được quá 2000 ký tự")
    .optional(),
  opening_hours: z
    .string()
    .max(100, "Giờ mở cửa không được quá 100 ký tự")
    .optional(),
  cover_image: z
    .string()
    .url("URL ảnh bìa không hợp lệ")
    .optional()
    .or(z.literal("")),
  slug: z
    .string()
    .min(3, "Slug phải có ít nhất 3 ký tự")
    .max(100, "Slug không được quá 100 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang")
    .optional()
    .or(z.literal("")),
  meta_title: z
    .string()
    .max(70, "Meta title không được quá 70 ký tự")
    .optional(),
  meta_description: z
    .string()
    .max(160, "Meta description không được quá 160 ký tự")
    .optional(),
});

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Get Dealer ID from User
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function getDealerIdFromUser(): Promise<{
  dealerId: string | null;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { dealerId: null, error: "Người dùng chưa đăng nhập" };
    }

    // Check dealer role
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const roles = (rolesData ?? []).map((r) => r.role);
    const isDealer = roles.includes("dealer") || roles.includes("admin");

    if (!isDealer) {
      return { dealerId: null, error: "Bạn không có quyền chỉnh sửa thông tin đại lý" };
    }

    // Get dealer_id from profile
    const profile = await prisma.profile.findFirst({
      where: { id: user.id },
      select: { dealer_id: true },
    });

    if (!profile?.dealer_id) {
      return { dealerId: null, error: "Tài khoản chưa được liên kết với đại lý" };
    }

    return { dealerId: profile.dealer_id };
  } catch (error) {
    console.error("[Dealer Profile] Error getting dealer ID:", error);
    return {
      dealerId: null,
      error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi lấy thông tin đại lý",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: GET DEALER PROFILE
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getDealerProfile(): Promise<{
  success: boolean;
  data?: DealerProfileData;
  error?: string;
}> {
  const { dealerId, error } = await getDealerIdFromUser();

  if (!dealerId) {
    return { success: false, error: error || "Không tìm thấy đại lý" };
  }

  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        province: true,
        district: true,
        zalo_number: true,
        about_us: true,
        opening_hours: true,
        cover_image: true,
        slug: true,
        meta_title: true,
        meta_description: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!dealer) {
      return { success: false, error: "Không tìm thấy thông tin đại lý" };
    }

    return { success: true, data: dealer };
  } catch (error) {
    console.error("[Dealer Profile] Error fetching profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Đã xảy ra lỗi",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: UPDATE DEALER PROFILE
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function updateDealerProfile(
  formData: FormData
): Promise<UpdateDealerProfileResult> {
  const { dealerId, error } = await getDealerIdFromUser();

  if (!dealerId) {
    return { success: false, error: error || "Không có quyền chỉnh sửa" };
  }

  // Extract form data
  const rawData = {
    zalo_number: formData.get("zalo_number") as string | null,
    about_us: formData.get("about_us") as string | null,
    opening_hours: formData.get("opening_hours") as string | null,
    cover_image: formData.get("cover_image") as string | null,
    slug: formData.get("slug") as string | null,
    meta_title: formData.get("meta_title") as string | null,
    meta_description: formData.get("meta_description") as string | null,
  };

  // Remove null values (keep existing if empty string)
  const cleanData: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(rawData)) {
    if (value !== null && value !== undefined && value !== "") {
      cleanData[key] = value;
    } else {
      cleanData[key] = undefined; // Will be set to null in DB
    }
  }

  // Validate
  const validation = updateDealerSchema.safeParse(cleanData);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      fieldErrors[field] = err.message;
    });
    return { success: false, fieldErrors };
  }

  try {
    // Check slug uniqueness if provided
    if (validation.data.slug) {
      const existing = await prisma.dealer.findFirst({
        where: {
          slug: validation.data.slug,
          NOT: { id: dealerId },
        },
      });

      if (existing) {
        return {
          success: false,
          fieldErrors: { slug: "Slug này đã được sử dụng. Vui lòng chọn slug khác." },
        };
      }
    }

    // Update dealer
    const updatedDealer = await prisma.dealer.update({
      where: { id: dealerId },
      data: {
        zalo_number: validation.data.zalo_number || null,
        about_us: validation.data.about_us || null,
        opening_hours: validation.data.opening_hours || null,
        cover_image: validation.data.cover_image || null,
        slug: validation.data.slug || null,
        meta_title: validation.data.meta_title || null,
        meta_description: validation.data.meta_description || null,
      },
    });

    console.log(`[Dealer Profile] Updated: ${updatedDealer.id} (${updatedDealer.name})`);

    return { success: true };
  } catch (error) {
    console.error("[Dealer Profile] Error updating profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: AUTO-GENERATE SLUG
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function generateSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")    // Remove special chars
    .replace(/\s+/g, "-")             // Spaces to hyphens
    .replace(/-+/g, "-")              // Multiple hyphens to one
    .replace(/^-|-$/g, "");           // Trim hyphens from ends

  return baseSlug || "dealer";
}
