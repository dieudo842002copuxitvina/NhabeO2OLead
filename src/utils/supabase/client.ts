/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  SUPABASE CLIENT UTILS                                            ║
 * ║  Client-side Supabase client using @supabase/ssr                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Usage in Client Components:
 *   import { createClient } from '@/utils/supabase/client'
 *   const supabase = createClient()
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for client-side operations
 * Automatically handles session refresh and auth state
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
