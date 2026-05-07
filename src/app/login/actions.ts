/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  LOGIN/SIGNUP ACTIONS - Nhà Bè Agri                            ║
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
 * ZOD SCHEMAS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

const signupSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

/* ═══════════════════════════════════════════════════════════════════════════════
 * HELPER: Get User Roles and Determine Redirect
 * ═══════════════════════════════════════════════════════════════════════════════ */

type RedirectResult = {
  redirectTo: string;
  shouldCreateProfile: boolean;
};

async function getUserRedirectInfo(userId: string): Promise<RedirectResult> {
  const supabase = await createServerClient();
  
  // Fetch user roles
  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  
  const roles = (rolesData ?? []).map((r) => r.role);
  
  // Determine redirect based on role
  if (roles.includes('admin')) {
    return { redirectTo: '/admin/dashboard', shouldCreateProfile: false };
  }
  
  if (roles.includes('dealer')) {
    return { redirectTo: '/dealer/dashboard', shouldCreateProfile: false };
  }
  
  // Default for new users (customer role or no role yet)
  return { redirectTo: '/tinh-toan', shouldCreateProfile: true };
}

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
  const redirectTo = formData.get("redirectTo") as string || "/tinh-toan";

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

    const { data, error } = await supabase.auth.signInWithPassword({
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

    // Get role-based redirect
    if (data.user) {
      const { redirectTo: roleRedirect } = await getUserRedirectInfo(data.user.id);
      
      // Revalidate and redirect
      revalidatePath("/", "layout");
      redirect(roleRedirect);
    }

    // Fallback redirect
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
 * SERVER ACTION: SIGNUP
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface SignupResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  needsEmailConfirmation?: boolean;
}

export async function signupAction(formData: FormData): Promise<SignupResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string | undefined;

  // Validate input
  const validation = signupSchema.safeParse({
    email,
    password,
    confirmPassword,
    fullName,
    phone,
  });
  
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

    // Check if user already exists by trying to get user (will fail if doesn't exist)
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users.some(u => u.email === email);

    if (userExists) {
      return { 
        success: false, 
        error: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác." 
      };
    }

    // Create the user
    const { data, error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      if (error.code === "user_already_exists") {
        return { success: false, error: "Email này đã được đăng ký. Vui lòng đăng nhập." };
      }
      if (error.code === "weak_password") {
        return { success: false, error: "Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn." };
      }
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Assign default 'customer' role to new user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: 'customer' });

      if (roleError) {
        console.error("Error assigning customer role:", roleError);
      }

      // Check if profile exists, if not create one
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (!profile) {
        // Create profile for the user (only full_name and phone - no email field)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            phone: phone || null,
          });

        if (profileError) {
          console.error("Error creating profile:", profileError);
        }
      }

      // Check if email confirmation is required
      if (!data.session) {
        return { 
          success: true, 
          needsEmailConfirmation: true,
          error: undefined,
        };
      }

      // Auto-login successful - redirect to calculator
      revalidatePath("/", "layout");
      redirect("/tinh-toan");
    }

    return { success: false, error: "Đã xảy ra lỗi khi đăng ký" };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("Signup error:", error);
    return { success: false, error: "Đã xảy ra lỗi khi đăng ký" };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: GOOGLE SIGN IN
 * ═══════════════════════════════════════════════════════════════════════════════ */

export interface GoogleSignInResult {
  error?: string;
  url?: string;
}

export async function signInWithGoogleAction(redirectTo?: string): Promise<GoogleSignInResult> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?redirectTo=${encodeURIComponent(redirectTo || '/tinh-toan')}`,
        queryParams: {
          prompt: 'consent',
          access_type: 'offline',
        },
      },
    });

    if (error) {
      console.error("Google OAuth error:", error);
      return { error: "Không thể đăng nhập với Google. Vui lòng thử lại." };
    }

    if (data.url) {
      return { url: data.url };
    }

    return { error: "Đã xảy ra lỗi khi đăng nhập với Google" };
  } catch (error) {
    console.error("Google sign in error:", error);
    return { error: "Đã xảy ra lỗi khi đăng nhập với Google" };
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

/* ═══════════════════════════════════════════════════════════════════════════════
 * SERVER ACTION: CHECK AUTH STATUS
 * ═══════════════════════════════════════════════════════════════════════════════ */

export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  redirectTo?: string;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { isAuthenticated: false };
    }

    // Get role-based redirect
    const { redirectTo } = await getUserRedirectInfo(user.id);
    
    return { isAuthenticated: true, redirectTo };
  } catch (error) {
    console.error("Check auth status error:", error);
    return { isAuthenticated: false };
  }
}
