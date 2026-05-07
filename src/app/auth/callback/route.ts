/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  AUTH CALLBACK - OAuth Redirect Handler                        ║
 * ║  Handles OAuth redirects from Supabase (Google, etc.)             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import { createServerClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/tinh-toan";

  if (code) {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Check if user has any roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);
      
      const roles = (rolesData ?? []).map((r) => r.role);
      
      // Determine redirect based on role
      if (roles.includes('admin')) {
        return NextResponse.redirect(new URL("/admin/dashboard", requestUrl.origin));
      }
      
      if (roles.includes('dealer')) {
        return NextResponse.redirect(new URL("/dealer/dashboard", requestUrl.origin));
      }
      
      // Check if profile exists, if not create one
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      if (!profile) {
        // Create profile for OAuth user
        const { data: authMetadata } = await supabase.auth.getUser();
        const userMetadata = authMetadata?.user?.user_metadata;
        
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: userMetadata?.full_name || userMetadata?.name || null,
          avatar_url: userMetadata?.avatar_url || userMetadata?.picture || null,
        });
        
        // Assign default customer role
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'customer',
        });
      } else {
        // Assign default customer role if no roles exist
        if (roles.length === 0) {
          await supabase.from('user_roles').insert({
            user_id: data.user.id,
            role: 'customer',
          });
        }
      }
    }
    
    // Redirect to the requested page or default
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
  }

  // Return to login if no code
  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", requestUrl.origin));
}
