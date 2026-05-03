/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  MIDDLEWARE - Route Protection                                   ║
 * ║  Protects admin routes and manages auth redirects              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 * 
 * This middleware:
 * 1. Protects /admin/* routes - redirects to /login if not authenticated
 * 2. Redirects authenticated users away from /login
 * 3. Manages session refresh
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for this middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on request for downstream handlers
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Set cookie on response for the browser
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie on request
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Remove cookie on response
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get the current user session
  const { data: { user }, error } = await supabase.auth.getUser()

  // Check if the user is logged in
  const isAuthenticated = !!user && !error

  // Get the current path
  const pathname = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/api/auth',
  ]

  // Check if current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // If accessing admin routes without authentication, redirect to login
  if (pathname.startsWith('/admin') && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url)
    // Add the return URL so we can redirect back after login
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated user is accessing public auth pages, redirect to admin
  if (isPublicPath && isAuthenticated && pathname === '/login') {
    const redirectUrl = new URL('/admin', request.url)
    // Check for return URL
    const returnTo = request.nextUrl.searchParams.get('redirectTo')
    if (returnTo && returnTo.startsWith('/')) {
      redirectUrl.pathname = returnTo
    }
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (except auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
