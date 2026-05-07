/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  INVITATION SERVER ACTIONS - Nhà Bè Agri                       ║
 * ║  Create and manage user invitations for dealers/suppliers            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { createServerClient } from "@/utils/supabase/server";
import { z } from "zod";
import { render } from "@react-email/components";
import { InvitationEmail } from "@/emails/InvitationEmail";
import { sendEmail } from "@/lib/mail";

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

export type InviteRole = "dealer" | "supplier";
export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  created_at: Date;
  expires_at: Date | null;
  created_by: string | null;
}

export interface InvitationResult {
  success: boolean;
  data?: Invitation;
  error?: string;
}

export interface AcceptInvitationResult {
  success: boolean;
  error?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPERS: Role Configuration
 * ═══════════════════════════════════════════════════════════════════════════════ */

const ROLE_LABELS: Record<InviteRole, string> = {
  dealer: "Đại lý",
  supplier: "Nhà cung cấp",
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPERS: Admin Permission Check
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function checkAdminPermission(): Promise<{
  isAdmin: boolean;
  userId?: string;
  displayName?: string;
  error?: string;
}> {
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

    // Get admin display name for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    return {
      isAdmin: true,
      userId: user.id,
      displayName: profile?.full_name || user.email || "Quản trị viên",
    };
  } catch (error) {
    console.error("checkAdminPermission error:", error);
    return { isAdmin: false, error: "Đã xảy ra lỗi khi kiểm tra quyền" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * ZOD SCHEMAS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const createInvitationSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["dealer", "supplier"], {
    errorMap: () => ({ message: "Vai trò không hợp lệ" }),
  }),
});

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Generate Secure Token
 * ═══════════════════════════════════════════════════════════════════════════════ */

function generateToken(): string {
  // Use crypto.randomUUID() for secure token generation
  return crypto.randomUUID();
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Build Accept URL
 * ═══════════════════════════════════════════════════════════════════════════════ */

function buildAcceptUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nhaBeAgri.vn";
  return `${baseUrl}/invite/accept?token=${token}`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Render Email HTML
 * ═══════════════════════════════════════════════════════════════════════════════ */

async function renderInvitationEmailHtml(params: {
  invitedEmail: string;
  role: InviteRole;
  invitedBy: string;
  acceptUrl: string;
}): Promise<string> {
  const html = await render(
    InvitationEmail({
      ...params,
      roleLabel: ROLE_LABELS[params.role],
      expiresDays: 7,
    }),
    { pretty: true }
  );
  return html;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: CREATE INVITATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Create a new invitation and send email to the invitee
 * Requires admin role
 */
export async function createInvitation(
  email: string,
  role: InviteRole
): Promise<InvitationResult> {
  try {
    // Validate input
    const validation = createInvitationSchema.safeParse({ email, role });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(", "),
      };
    }

    // Check admin permission
    const { isAdmin, userId: adminId, displayName: adminName, error: authError } =
      await checkAdminPermission();
    if (!isAdmin) {
      return { success: false, error: authError || "Không có quyền thực hiện thao tác này" };
    }

    const { data: validated } = validation;

    // Check if invitation already exists for this email with PENDING status
    const existing = await prisma.invitation.findFirst({
      where: {
        email: validated.email.toLowerCase(),
        status: "PENDING",
      },
    });

    if (existing) {
      return {
        success: false,
        error: `Đã có lời mời đang chờ cho email này. Vui lòng hủy lời mời cũ trước khi tạo mới.`,
      };
    }

    // Check if user already exists in the system
    const supabase = await createServerClient();
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users.some(
      u => u.email?.toLowerCase() === validated.email.toLowerCase()
    );

    if (userExists) {
      return {
        success: false,
        error: `Email này đã có tài khoản trong hệ thống. Không cần mời.`,
      };
    }

    // Generate secure token
    const token = generateToken();

    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation in database
    const invitation = await prisma.invitation.create({
      data: {
        email: validated.email.toLowerCase(),
        role: validated.role,
        token,
        status: "PENDING",
        expires_at: expiresAt,
        created_by: adminId,
      },
    });

    // Build accept URL
    const acceptUrl = buildAcceptUrl(token);

    // Render email HTML
    const emailHtml = await renderInvitationEmailHtml({
      invitedEmail: validated.email,
      role: validated.role,
      invitedBy: adminName || "Quản trị viên",
      acceptUrl,
    });

    // Send invitation email
    const emailResult = await sendEmail({
      to: validated.email,
      subject: `Bạn được mời tham gia Nhà Bè Agri với vai trò ${ROLE_LABELS[validated.role]}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.warn(
        `[Invite] Email failed to send for invitation ${invitation.id}:`,
        emailResult.error
      );
      // Don't fail the invitation creation if email fails
      // The invitation is still valid and can be resent manually
    }

    // Revalidate admin users page
    revalidatePath("/admin/users");

    console.log(
      `[Invite] Invitation created: ${invitation.id} for ${validated.email} ` +
      `(role: ${validated.role}) by admin ${adminId}`
    );

    return {
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        status: invitation.status,
        created_at: invitation.created_at,
        expires_at: invitation.expires_at,
        created_by: invitation.created_by,
      },
    };
  } catch (error) {
    console.error("createInvitation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: GET INVITATION BY TOKEN
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getInvitationByToken(token: string): Promise<{
  success: boolean;
  data?: {
    id: string;
    email: string;
    role: string;
    status: string;
    expires_at: Date | null;
  };
  error?: string;
}> {
  try {
    if (!token) {
      return { success: false, error: "Token không hợp lệ" };
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return { success: false, error: "Lời mời không tồn tại hoặc đã bị hủy" };
    }

    // Check if invitation is expired
    if (invitation.status === "ACCEPTED") {
      return { success: false, error: "Lời mời này đã được chấp nhận trước đó" };
    }

    if (invitation.status === "EXPIRED" || invitation.status === "CANCELLED") {
      return { success: false, error: "Lời mời này đã hết hạn hoặc bị hủy" };
    }

    if (invitation.expires_at && invitation.expires_at < new Date()) {
      // Mark as expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return { success: false, error: "Lời mời này đã hết hạn" };
    }

    return {
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expires_at: invitation.expires_at,
      },
    };
  } catch (error) {
    console.error("getInvitationByToken error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: ACCEPT INVITATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Accept an invitation by creating a new user account
 * - Validates the invitation token
 * - Creates Supabase Auth user
 * - Creates profile
 * - Assigns the invited role
 * - Marks invitation as ACCEPTED
 * - Redirects to appropriate dashboard
 */
export async function acceptInvitation(
  token: string,
  password: string
): Promise<AcceptInvitationResult> {
  try {
    // Validate password
    if (!password || password.length < 8) {
      return {
        success: false,
        error: "Mật khẩu phải có ít nhất 8 ký tự",
      };
    }

    // Get invitation
    const { success, data: invitationData, error: inviteError } =
      await getInvitationByToken(token);

    if (!success || !invitationData) {
      return { success: false, error: inviteError || "Lời mời không hợp lệ" };
    }

    const supabase = await createServerClient();

    // Create user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: invitationData.email,
      password,
      options: {
        data: {
          invited_role: invitationData.role,
          invitation_id: invitationData.id,
        },
      },
    });

    if (signUpError) {
      console.error("Accept invitation - signUp error:", signUpError);

      if (signUpError.code === "user_already_exists") {
        return {
          success: false,
          error: "Email này đã có tài khoản. Vui lòng đăng nhập thay vì sử dụng lời mời.",
        };
      }

      return {
        success: false,
        error: signUpError.message || "Đã xảy ra lỗi khi tạo tài khoản",
      };
    }

    if (!authData.user) {
      return { success: false, error: "Không nhận được thông tin người dùng từ Supabase" };
    }

    const userId = authData.user.id;

    // Assign the invited role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: invitationData.role,
      });

    if (roleError) {
      console.error("Accept invitation - role assignment error:", roleError);
      // Don't fail, the role might already exist
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: invitationData.email,
      });

    if (profileError) {
      console.error("Accept invitation - profile creation error:", profileError);
      // Don't fail, profile might already exist from trigger
    }

    // Mark invitation as ACCEPTED
    await prisma.invitation.update({
      where: { token },
      data: { status: "ACCEPTED" },
    });

    // Revalidate relevant paths
    revalidatePath("/admin/users");

    console.log(
      `[Invite] Invitation accepted: ${invitationData.id} ` +
      `for ${invitationData.email} (role: ${invitationData.role})`
    );

    // Redirect will be handled by the calling component based on role
    return { success: true };
  } catch (error) {
    console.error("acceptInvitation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: CANCEL INVITATION
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function cancelInvitation(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check admin permission
    const { isAdmin, error: authError } = await checkAdminPermission();
    if (!isAdmin) {
      return { success: false, error: authError || "Không có quyền thực hiện thao tác này" };
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return { success: false, error: "Lời mời không tồn tại" };
    }

    if (invitation.status === "ACCEPTED") {
      return { success: false, error: "Không thể hủy lời mời đã được chấp nhận" };
    }

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/admin/users");

    console.log(`[Invite] Invitation cancelled: ${invitationId}`);

    return { success: true };
  } catch (error) {
    console.error("cancelInvitation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: GET ALL INVITATIONS (Admin)
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function getInvitations(): Promise<{
  success: boolean;
  data?: Invitation[];
  error?: string;
}> {
  try {
    // Check admin permission
    const { isAdmin, error: authError } = await checkAdminPermission();
    if (!isAdmin) {
      return { success: false, error: authError || "Không có quyền truy cập" };
    }

    const invitations = await prisma.invitation.findMany({
      orderBy: { created_at: "desc" },
    });

    return {
      success: true,
      data: invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        token: inv.token,
        status: inv.status,
        created_at: inv.created_at,
        expires_at: inv.expires_at,
        created_by: inv.created_by,
      })),
    };
  } catch (error) {
    console.error("getInvitations error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
