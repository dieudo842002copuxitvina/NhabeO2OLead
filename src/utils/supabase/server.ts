/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SUPABASE SERVER UTILS                                           ║
 * ║  Server-side Supabase client using @supabase/ssr                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Usage in Server Components, Server Actions, and Route Handlers:
 *   import { createServerClient } from '@/utils/supabase/server'
 *   const supabase = await createServerClient()
 */

import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for server-side operations
 * Handles cookies automatically for SSR
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookies in read-only context (e.g., Server Components)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookies in read-only context
          }
        },
      },
    }
  )
}

/**
 * Get the current authenticated user from the server
 */
export async function getAuthenticatedUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Check if user has admin role
 */
export async function isAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  // Check for admin role in user_roles table
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single()
  
  return !!roleData
}
