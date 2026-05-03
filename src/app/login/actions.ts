/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LOGIN ACTIONS                                                   ║
 * ║  Server Actions for authentication with Supabase Auth            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@/utils/supabase/server";
import { z } from "zod";

/* ═══════════════════════════════════════════════════════════════════════════════
 * ZOD SCHEMA
 * ═══════════════════════════════════════════════════════════════════════════════ */

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: LOGIN
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface LoginResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string || "/admin";

  // Validate input
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      fieldErrors[field] = err.message;
    });
    return { success: false, fieldErrors };
  }

  try {
    const supabase = await createServerClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (error) {
      // Handle specific error codes
      if (error.code === "invalid_credentials") {
        return { success: false, error: "Email hoặc mật khẩu không đúng" };
      }
      if (error.code === "user_not_found") {
        return { success: false, error: "Tài khoản không tồn tại" };
      }
      if (error.code === "email_not_confirmed") {
        return { success: false, error: "Vui lòng xác nhận email trước khi đăng nhập" };
      }
      return { success: false, error: error.message };
    }

    // Revalidate and redirect to the requested page
    revalidatePath("/", "layout");
    redirect(redirectTo);
  } catch (error) {
    // Next.js redirect throws an error, catch it
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Login error:", error);
    return { success: false, error: "Đã xảy ra lỗi khi đăng nhập" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: LOGOUT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function logoutAction() {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Logout error:", error);
  }
}
