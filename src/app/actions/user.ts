/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  USER MANAGEMENT SERVER ACTIONS                                ║
 * ║  CRUD operations for User management using Prisma                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import { createServerClient } from "@/utils/supabase/server";
import { z } from "zod";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PRISMA CLIENT (singleton pattern for production)
 * ═══════════════════════════════════════════════════════════════════════════════ */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════════ */

export type AppRole = "admin" | "dealer" | "supplier" | "technician" | "customer" | "bi_viewer" | "ai_editor";

export interface UserWithRoles {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  roles: AppRole[];
  createdAt: Date | null;
}

export interface UsersResult {
  success: boolean;
  data?: UserWithRoles[];
  error?: string;
  count?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Check Admin Permission
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function checkAdminPermission(): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { isAdmin: false, error: "Người dùng chưa đăng nhập" };
    }

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roles = (rolesData ?? []).map((r) => r.role);
    const isAdmin = roles.includes('admin') || roles.includes('ADMIN');

    if (!isAdmin) {
      return { isAdmin: false, userId: user.id, error: "Bạn không có quyền thực hiện thao tác này" };
    }

    return { isAdmin: true, userId: user.id };
  } catch (error) {
    console.error("checkAdminPermission error:", error);
    return { isAdmin: false, error: "Đã xảy ra lỗi khi kiểm tra quyền" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ZOD SCHEMAS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const updateRoleSchema = z.object({
  userId: z.string().uuid("ID người dùng không hợp lệ"),
  newRole: z.enum(["admin", "dealer", "supplier", "technician", "customer", "bi_viewer", "ai_editor"], {
    errorMap: () => ({ message: "Vai trò không hợp lệ" }),
  }),
});

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET USERS
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Get all users with their roles
 */
export async function getUsers(options?: {
  search?: string;
  role?: AppRole;
  limit?: number;
  offset?: number;
}): Promise<UsersResult> {
  try {
    // Check admin permission
    const { isAdmin, error: authError } = await checkAdminPermission();
    if (!isAdmin) {
      return { success: false, error: authError || "Không có quyền truy cập" };
    }

    // Get all profiles with their roles
    const profiles = await prisma.profile.findMany({
      include: {
        user_roles: {
          select: { role: true },
        },
        users: {
          select: {
            email: true,
            created_at: true,
          },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    // Get emails from auth.users
    const supabase = await createServerClient();
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    // Create email lookup map
    const emailMap = new Map<string, string>();
    authUsers?.users.forEach(user => {
      emailMap.set(user.id, user.email || null);
    });

    // Transform data
    let users: UserWithRoles[] = profiles.map(profile => ({
      id: profile.id,
      email: emailMap.get(profile.id) || profile.users?.email || null,
      fullName: profile.full_name,
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      roles: profile.user_roles.map(r => r.role.toLowerCase() as AppRole),
      createdAt: profile.users?.created_at || null,
    }));

    // Apply filters
    if (options?.search) {
      const query = options.search.toLowerCase();
      users = users.filter(user =>
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.includes(query)
      );
    }

    if (options?.role) {
      users = users.filter(user => user.roles.includes(options.role!));
    }

    // Apply pagination
    const totalCount = users.length;
    if (options?.offset !== undefined) {
      users = users.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      users = users.slice(0, options.limit);
    }

    return {
      success: true,
      data: users,
      count: totalCount,
    };
  } catch (error) {
    console.error("getUsers error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * UPDATE USER ROLE
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface UpdateUserRoleResult {
  success: boolean;
  error?: string;
}

export async function updateUserRole(
  userId: string,
  newRole: AppRole
): Promise<UpdateUserRoleResult> {
  try {
    // Validate input
    const validation = updateRoleSchema.safeParse({ userId, newRole });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      };
    }

    // Check admin permission
    const { isAdmin, userId: currentUserId, error: authError } = await checkAdminPermission();
    if (!isAdmin) {
      return { success: false, error: authError || "Không có quyền thực hiện thao tác này" };
    }

    // Prevent self-demotion
    if (currentUserId === validation.data.userId && newRole !== "admin") {
      return { success: false, error: "Bạn không thể tự thay đổi vai trò của chính mình" };
    }

    // Upsert the role (insert or update)
    await prisma.userRole.upsert({
      where: {
        user_id_role: {
          user_id: validation.data.userId,
          role: validation.data.newRole,
        },
      },
      update: {},
      create: {
        user_id: validation.data.userId,
        role: validation.data.newRole,
      },
    });

    // Revalidate
    revalidatePath("/admin/users");

    console.log(`[User Management] Role updated: user ${userId} → ${newRole} by admin ${currentUserId}`);

    return { success: true };
  } catch (error) {
    console.error("updateUserRole error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * REMOVE USER ROLE
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function removeUserRole(
  userId: string,
  role: AppRole
): Promise<UpdateUserRoleResult> {
  try {
    // Validate input
    if (!userId || !role) {
      return { success: false, error: "Thiếu thông tin người dùng hoặc vai trò" };
    }

    // Check admin permission
    const { isAdmin, userId: currentUserId, error: authError } = await checkAdminPermission();
    if (!isAdmin) {
      return { success: false, error: authError || "Không có quyền thực hiện thao tác này" };
    }

    // Prevent self-demotion from admin
    if (currentUserId === userId && role === "admin") {
      return { success: false, error: "Bạn không thể tự xóa vai trò admin của chính mình" };
    }

    // Delete the role
    await prisma.userRole.deleteMany({
      where: {
        user_id: userId,
        role: role,
      },
    });

    // Revalidate
    revalidatePath("/admin/users");

    console.log(`[User Management] Role removed: user ${userId} ← ${role} by admin ${currentUserId}`);

    return { success: true };
  } catch (error) {
    console.error("removeUserRole error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * GET USER STATS
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getUserStats(): Promise<{
  success: boolean;
  data?: {
    total: number;
    byRole: Record<AppRole, number>;
  };
  error?: string;
}> {
  try {
    // Check admin permission
    const { isAdmin, error: authError } = await checkAdminPermission();
    if (!isAdmin) {
      return { success: false, error: authError || "Không có quyền truy cập" };
    }

    const profiles = await prisma.profile.findMany({
      include: {
        user_roles: {
          select: { role: true },
        },
      },
    });

    const byRole: Record<AppRole, number> = {
      admin: 0,
      dealer: 0,
      supplier: 0,
      technician: 0,
      customer: 0,
      bi_viewer: 0,
      ai_editor: 0,
    };

    profiles.forEach(profile => {
      profile.user_roles.forEach(userRole => {
        const role = userRole.role.toLowerCase() as AppRole;
        if (role in byRole) {
          byRole[role]++;
        }
      });
    });

    return {
      success: true,
      data: {
        total: profiles.length,
        byRole,
      },
    };
  } catch (error) {
    console.error("getUserStats error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
