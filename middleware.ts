/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  MIDDLEWARE - Route Protection with Role-Based Access Control (RBAC)    ║
 * ║  Protects routes based on user roles from Supabase                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * Access Rules:
 * - /admin/* → Requires 'ADMIN' role
 * - /dealer/* → Requires 'DEALER' role  
 * - /tinh-toan → Public (anyone can view), but needs auth to save leads
 * - /login, /register, /forgot-password → Public auth pages
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/* ─────────────────────────────────────────────────────────────────────────────
 * ROLE DEFINITIONS
 * ───────────────────────────────────────────────────────────────────────────── */

type UserRole = 'ADMIN' | 'DEALER' | 'USER' | string

const ROLE_REQUIREMENTS: Record<string, UserRole[]> = {
  '/admin': ['ADMIN'],
  '/dealer': ['DEALER'],
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PUBLIC PATHS (No authentication required)
 * ───────────────────────────────────────────────────────────────────────────── */

const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/tinh-toan',
  '/dai-ly',
  '/danh-muc',
  '/san-pham',
  '/blog',
  '/tin-tuc',
  '/gia-nong-san',
  '/giai-phap',
  '/cong-cu',
  '/auth/callback',
]

const PUBLIC_PREFIXES = [
  '/api/auth',
  '/_next',
  '/favicon',
  '/images',
  '/static',
]

/* ─────────────────────────────────────────────────────────────────────────────
 * HELPER FUNCTIONS
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * Check if a path is public (doesn't require authentication)
 */
function isPublicPath(pathname: string): boolean {
  // Check exact matches
  if (PUBLIC_PATHS.includes(pathname)) {
    return true
  }

  // Check prefix matches
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true
    }
  }

  return false
}

/**
 * Get required roles for a given path
 */
function getRequiredRoles(pathname: string): UserRole[] | null {
  for (const [route, roles] of Object.entries(ROLE_REQUIREMENTS)) {
    if (pathname.startsWith(route)) {
      return roles
    }
  }
  return null
}

/**
 * Fetch user roles from Supabase
 */
async function fetchUserRoles(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<UserRole[]> {
  try {
    // Query user_roles table (case-insensitive role match)
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (error || !userRoles) {
      console.error('[Middleware] Error fetching roles:', error?.message)
      return []
    }

    // Normalize roles to uppercase
    return userRoles.map(r => r.role.toUpperCase() as UserRole)
  } catch (err) {
    console.error('[Middleware] Exception fetching roles:', err)
    return []
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MAIN MIDDLEWARE FUNCTION
 * ───────────────────────────────────────────────────────────────────────────── */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  /* ─────────────────────────────────────────────────────────────────────────────
   * CREATE SUPABASE CLIENT
   * ───────────────────────────────────────────────────────────────────────────── */

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  /* ─────────────────────────────────────────────────────────────────────────────
   * CHECK AUTHENTICATION
   * ───────────────────────────────────────────────────────────────────────────── */

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  const isAuthenticated = !!user && !authError

  /* ─────────────────────────────────────────────────────────────────────────────
   * HANDLE PUBLIC PATHS
   * ───────────────────────────────────────────────────────────────────────────── */

  if (isPublicPath(pathname)) {
    // If authenticated user visits login/signup page, redirect based on role
    if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      // Fetch user roles to determine redirect
      const userRoles = await fetchUserRoles(supabase, user!.id);
      const roles = userRoles.map(r => r.toLowerCase());
      
      if (roles.includes('admin')) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (roles.includes('dealer')) {
        return NextResponse.redirect(new URL('/dealer/dashboard', request.url));
      }
      // Default for customers - redirect to calculator
      return NextResponse.redirect(new URL('/tinh-toan', request.url));
    }

    // Allow public access
    return response
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * HANDLE PROTECTED ROUTES
   * ───────────────────────────────────────────────────────────────────────────── */

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check role requirements for this path
  const requiredRoles = getRequiredRoles(pathname)

  if (requiredRoles) {
    // Fetch user roles from database
    const userRoles = await fetchUserRoles(supabase, user!.id)

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

    if (!hasRequiredRole) {
      console.warn(
        `[Middleware] Access denied for user ${user!.id} to ${pathname}`,
        { requiredRoles, userRoles }
      )

      // Redirect to appropriate page based on role
      if (userRoles.includes('ADMIN')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (userRoles.includes('DEALER')) {
        return NextResponse.redirect(new URL('/dealer', request.url))
      }

      // No valid role, redirect to login
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('error', 'insufficient_permissions')
      return NextResponse.redirect(redirectUrl)
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * ALLOW ACCESS
   * ───────────────────────────────────────────────────────────────────────────── */

  return response
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ROUTE MATCHER - Optimize by only running on necessary routes
 * ───────────────────────────────────────────────────────────────────────────── */

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - Static files (_next/static, _next/image)
     * - Favicon
     * - Media files (svg, png, jpg, jpeg, gif, webp, ico)
     * - API routes that don't need auth (except /api/auth/*)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
