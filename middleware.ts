import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname

    // Skip middleware for static files and API routes
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/webhook') ||
      pathname.startsWith('/api/health') ||
      pathname.includes('.') ||
      pathname.startsWith('/favicon')
    ) {
      return NextResponse.next()
    }

    // For now, just pass through - we can add auth checks here later
    const response = NextResponse.next()

    // Set cache headers for auth-related pages to prevent caching issues
    if (pathname.includes('/profile') || pathname.includes('/dashboard')) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
}